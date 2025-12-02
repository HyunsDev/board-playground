<p align="center">
  <img src="assets/logo-title.png" height="64" alt="Board Playground Logo" />
</p>

<p align="center">다양한 기술스택을 사용하는 게시판 시스템</p>

## Working In Process

현재 이 프로젝트는 개발 중인 상태입니다. 현재 단계에서는 사용할 수 없거나, 문제가 발생할 수 있습니다.

## 구조

### apps

- `apps/api`: NestJS 기반 API 서버
- `apps/api-e2e`: API e2e 테스트 모듈
- `apps/web`: Next.js 프론트엔드

### packages

- `packages/contract`: ts-rest로 정의한 API 계약/스키마
- `packages/db`: Prisma 스키마
- `packages/ui`: 프론트엔드가 재사용하는 React UI 컴포넌트
- `packages/eslint-config`, `packages/jest-config`, `packages/typescript-config`: 워크스페이스 공통 설정

## 목표

### 개발

- 모노레포 사용
- ts-rest를 사용한 **contract-first** API 개발

### 프론트엔드

-

### 백엔드

- DDD(도메인 주도 개발)
- CQRS
- Prisma
- PostgreSQL
- Neverthrow

## 라이센스

board-playground는 [GPLv3 라이센스](./LICENSE) 를 적용받습니다.
