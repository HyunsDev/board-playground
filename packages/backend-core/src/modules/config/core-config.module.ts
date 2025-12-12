import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { z } from 'zod';

import { coreConfig, coreConfigSchema } from './configs/core.config';
import { httpConfig, httpConfigSchema } from './configs/http.config';

export interface CoreConfigOptions {
  /**
   * HTTP 관련 설정(PORT, COOKIE_SECRET)을 포함할지 여부
   * @default false
   */
  isHttp?: boolean;

  /**
   * 앱 별로 추가적인 환경변수가 있다면 병합하여 검증
   * 예: JWT Secret 등
   */
  extraLoad?: ConfigFactory[];

  /**
   * validate 함수에서 호출할 추가 Zod 스키마
   */
  extraSchemas?: z.ZodType[];
}

@Module({})
export class CoreConfigModule {
  static forRoot(options: CoreConfigOptions = {}): DynamicModule {
    const { isHttp = false, extraLoad = [], extraSchemas = [] } = options;

    // 1. 로드할 Config Factory 결정
    const load: ConfigFactory[] = [coreConfig, ...extraLoad];
    if (isHttp) {
      load.push(httpConfig);
    }

    // 2. 검증할 Zod Schema 병합
    // 기본 Core 스키마에서 시작
    let mergedSchema = coreConfigSchema;

    // HTTP가 켜져있으면 병합
    if (isHttp) {
      mergedSchema = mergedSchema.merge(httpConfigSchema);
    }

    // 사용자 정의 스키마(JWT 등)가 있으면 intersection으로 병합
    let finalSchema: z.ZodType = mergedSchema;
    if (extraSchemas.length > 0) {
      finalSchema = extraSchemas.reduce((acc, schema) => acc.and(schema), mergedSchema);
    }

    return {
      module: CoreConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: load,
          validate: (config) => {
            const result = finalSchema.safeParse(config);
            if (!result.success) {
              console.error('❌ [Config] Invalid environment variables:', result.error.format());
              throw new Error('Invalid environment variables');
            }
            return result.data as Record<string, unknown>;
          },
          envFilePath: ['.env.local', '.env'],
        }),
      ],
      exports: [ConfigModule],
    };
  }
}
