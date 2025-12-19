<p align="center">
  <img src="assets/logo-title.png" height="64" alt="Board Playground Logo" />
</p>

<p align="center">다양한 기술스택을 사용하는 게시판 시스템</p>

## Working In Process

현재 이 프로젝트는 개발 중인 상태입니다. 현재 단계에서는 사용할 수 없거나, 문제가 발생할 수 있습니다.

## 기술 구조

### 전체 구조

- `pnpm` + `turborepo`

### 백엔드

- Repo: `pnpm`, `turborepo`
- Backend: `NestJS`
- Database: `Prisma`, `PostgreSQL`
- Cache: `Redis`, `@nestjs/cache-manager`
- API: `ts-rest`, `zod`
- Architecture: `DDD`, `CQRS`
- CQRS: `@nestjs/crqs`
- TaskQueue: `BullMQ`
- Error: `Neverthrow`
- Authentication: `AccessToken`(JWT) / `RefreshToken(Key Rotation)`, `passport`
- Health: `@nestjs/terminus`
- Id: `uuidv7`
- Logging: `pino`
- Infra: `AWS`
- Build: `Docker`
- CI/CD: `Github Actions`

### 프론트엔드

## 라이센스

board-playground는 [GPLv3 라이센스](./LICENSE) 를 적용받습니다.
