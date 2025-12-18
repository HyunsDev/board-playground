import { Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import z from 'zod';

import { IJobHandler } from '@workspace/backend-ddd';
import { defineJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

import { StorageGCService } from '../../storage/storage-gc.service';

import { BaseJob, BaseJobProps } from '@/base';
import { TransactionManager } from '@/modules/context';

const cleanUpOrphanFilesJobSchema = z.object({});

export type CleanUpOrphanFilesJobProps = BaseJobProps<Record<string, never>>;

export class CleanUpOrphanFilesJob extends BaseJob<CleanUpOrphanFilesJobProps> {
  static readonly code = defineJobCode('system:storage:job:clean_up_orphan_files');
  readonly queueName = TaskQueueCodeEnum.System.Storage;
  readonly schema = cleanUpOrphanFilesJobSchema;
  readonly resourceType = DomainCodeEnums.System.Storage;
}

const BATCH_SIZE = 100;
const RETENTION_HOURS = 24;
const MAX_ITERATIONS = 20;

export class CleanUpOrphanFilesJobHandler implements IJobHandler<CleanUpOrphanFilesJob> {
  private logger = new Logger(CleanUpOrphanFilesJobHandler.name);
  readonly JobClass = CleanUpOrphanFilesJob;

  constructor(
    private readonly storageGCService: StorageGCService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(_job: CleanUpOrphanFilesJob) {
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
