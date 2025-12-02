import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { GetDeviceQuery } from './get-device.query';
import { DeviceDtoMapper } from '../../device.dto-mapper';
import { DeviceNotFoundError } from '../../domain/device.errors';

@Controller()
export class GetDeviceHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly deviceDtoMapper: DeviceDtoMapper,
  ) {}

  @TsRestHandler(contract.device.get)
  async getDevice() {
    return tsRestHandler(contract.device.get, async ({ params }) => {
      const result = await this.queryBus.execute(new GetDeviceQuery(params.deviceId));

      return result.match(
        (device) =>
          ({
            status: 200,
            body: { device: this.deviceDtoMapper.toDto(device) },
          }) as const,
        (error) => {
          if (error instanceof DeviceNotFoundError) {
            return {
              status: 404,
              body: {
                ...EXCEPTION.DEVICE.NOT_FOUND,
              },
            } as const;
          }
          throw error;
        },
      );
    });
  }
}
