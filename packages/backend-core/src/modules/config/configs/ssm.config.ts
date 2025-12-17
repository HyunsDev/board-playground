import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { Logger } from '@nestjs/common'; // Logger import
import { registerAs } from '@nestjs/config';
import z from 'zod';

// 1. 환경변수 검증 스키마
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  AWS_REGION: z.string().default('ap-northeast-2'), // default 이동
});

// 2. 최종 Config 구조 스키마
export const ssmResultSchema = z.object({
  aws: z.object({
    s3: z.object({
      bucketName: z.string().min(1, 'S3 Bucket Name is required'),
    }),
  }),
});

// Config 타입 추출 (Service에서 사용하기 위함)
export type SsmConfig = z.infer<typeof ssmResultSchema>;

export const ssmConfig = registerAs('ssm', async (): Promise<SsmConfig> => {
  const logger = new Logger('SsmConfigFactory'); // 컨텍스트 이름 지정

  // 환경변수 파싱 및 검증
  const parsedEnv = envSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    logger.error('❌ Invalid Environment Variables for SSM setup');
    throw new Error(parsedEnv.error.message);
  }

  const { NODE_ENV, AWS_REGION } = parsedEnv.data;

  // 로컬 개발이 아니라면, 실제 AWS 혹은 LocalStack을 바라보게 설정
  const rootPath = `/board-playground/${NODE_ENV === 'production' ? 'prod' : 'dev'}`;

  logger.log(`Connecting to SSM Parameter Store... (Region: ${AWS_REGION}, Path: ${rootPath})`);

  const client = new SSMClient({
    region: AWS_REGION,
  });

  try {
    const command = new GetParametersByPathCommand({
      Path: rootPath,
      Recursive: true,
      WithDecryption: true, // 보안 문자열(SecureString)이 있을 수 있으므로 true 권장
    });

    const { Parameters } = await client.send(command);

    if (!Parameters || Parameters.length === 0) {
      logger.warn(`No parameters found in path: ${rootPath}`);
    }

    // Map 변환
    const paramMap = new Map<string, string>();
    Parameters?.forEach((p) => {
      if (p.Name && p.Value) {
        paramMap.set(p.Name, p.Value);
      }
    });

    logger.debug(`Fetched ${paramMap.size} parameters`);

    // [명시적 매핑]
    const rawConfig = {
      aws: {
        s3: {
          bucketName: paramMap.get(`${rootPath}/s3/bucket-name`),
        },
      },
    };

    // [Zod 검증]
    const validatedConfig = ssmResultSchema.parse(rawConfig);

    logger.log('SSM Configuration loaded and validated successfully');

    return validatedConfig;
  } catch (error) {
    logger.error(
      `❌ Failed to load SSM configuration: ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
});
