import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { DatabaseService } from '@/infra/database/database.service';

@Injectable()
export class DeviceService {
  constructor(private prisma: DatabaseService) {}

  async getDeviceById(deviceId: string) {
    return this.prisma.device.findUnique({
      where: { id: deviceId },
    });
  }

  async createDevice(data: {
    userId: string;
    hashedRefreshToken: string;
    userAgent: string;
    ipAddress: string;
  }) {
    const userAgentResult = new UAParser(data.userAgent).getResult();
    return this.prisma.device.create({
      data: {
        userId: data.userId,
        hashedRefreshToken: data.hashedRefreshToken,
        name: `${userAgentResult.os.toString()} - ${userAgentResult.browser.toString()}`,
        userAgent: data.userAgent,
        os: userAgentResult.os.toString(),
        device: userAgentResult.device.toString(),
        browser: userAgentResult.browser.toString(),
        platform: DEVICE_PLATFORM.WEB,
        ipAddress: data.ipAddress,
      },
    });
  }

  async updateRefreshToken(deviceId: string, hashedRefreshToken: string) {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: { hashedRefreshToken },
    });
  }

  async deleteDevice(deviceId: string) {
    return this.prisma.device.delete({
      where: { id: deviceId },
    });
  }
}
