import { Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { IJobHandler } from '@workspace/backend-ddd';

import { StorageGCService } from '../../storage/storage-gc.service';
import { cleanUpOrphanFilesJob } from '../jobs/clean-up-orphan-files.job';

import { TransactionManager } from '@/modules/context';

const BATCH_SIZE = 100;
const RETENTION_HOURS = 24;
const MAX_ITERATIONS = 20;

export class CleanUpOrphanFilesJobHandler implements IJobHandler<cleanUpOrphanFilesJob> {
  private logger = new Logger(CleanUpOrphanFilesJobHandler.name);
  readonly JobClass = cleanUpOrphanFilesJob;

  constructor(
    private readonly storageGCService: StorageGCService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(_job: cleanUpOrphanFilesJob) {
    return await this.txManager.run(async () => {
      const retentionThreshold = new Date(Date.now() - 1000 * 60 * 60 * RETENTION_HOURS);
      let hasMore = true;
      let iteration = 0;

      while (hasMore) {
        iteration++;
        if (iteration > MAX_ITERATIONS) {
          this.logger.warn('Reached maximum iterations while cleaning up orphan files.');
          break;
        }

        const result = await this.storageGCService.cleanUpOrphanFiles(100, retentionThreshold);
        if (result.isErr()) {
          this.logger.error(`Failed to clean up orphan files: ${result.error}`);
          return err(result.error);
        }

        const deletedCount = result.value;
        this.logger.log(`Deleted ${deletedCount} orphan files in this batch.`);

        if (deletedCount < BATCH_SIZE) {
          hasMore = false;
        }
      }

      this.logger.log('Completed cleaning up orphan files.');

      return ok(undefined);
    });
  }
}
