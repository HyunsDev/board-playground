import path from 'node:path';

import dotenv from 'dotenv'; // 1. dotenv를 명시적으로 import
import { defineConfig, env } from 'prisma/config';

// 2. 현재 파일(__dirname)과 같은 위치에 있는 .env를 로드하도록 경로 지정
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  schema: path.join('prisma'),
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
