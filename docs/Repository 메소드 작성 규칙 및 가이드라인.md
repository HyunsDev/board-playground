# 📘 Repository 메소드 작성 규칙 및 가이드라인

이 문서는 DDD 기반 NestJS 프로젝트에서 레포지토리(Repository) 메소드를 작성할 때 따르는 명명 규칙(Naming Convention)과 반환 타입(Return Type) 전략을 정의합니다.

## 1\. 핵심 원칙 (Core Principles)

1. **자연스러운 문장 구성 (English-like)**

      * 호출부에서 읽었을 때 자연스러운 문장이 되도록 합니다.
      * `userRepository.save(user)` (O) -\> "유저 저장소야, 유저를 저장해."
      * `userRepository.saveUser(user)` (X) -\> "유저 저장소야, 유저 유저를 저장해." (중복 지양)

2. **행위의 의도 명시 (Explicit Intent)**

      * 단순 SQL(`insert`, `update`) 용어보다는 **비즈니스 행위**(`register`, `change`, `issue`)를 나타내는 동사를 사용합니다.

3. **에러 처리 전략 (Error Handling)**

      * **비즈니스 예외** (없음, 중복 등): `neverthrow`의 `Result(Err)`로 반환하여 명시적으로 처리합니다.
      * **기술적 예외** (DB 연결 실패 등): `throw` 하여 Global Filter가 처리하도록 합니다.

-----

## 2\. BaseRepository 기본 메소드

`BaseRepository`가 제공하는 기본 메소드는 가장 범용적인 CRUD 작업을 수행합니다.

| 메소드 서명 | 설명 및 용도 | 반환 타입 |
| :--- | :--- | :--- |
| **`save(entity)`** | **생성 및 수정 통합 (Upsert)**<br>ID가 없으면 생성, 있으면 수정합니다. | `Promise<Result<Entity, ConflictError>>` |
| **`findOneById(id)`** | **단건 조회 (Optional)**<br>ID로 조회하되, 결과가 없을 수 있습니다. | `Promise<Entity \| null>` |
| **`delete(entity)`** | **삭제**<br>특정 엔티티를 삭제합니다. 대상이 없으면 에러입니다. | `Promise<Result<void, NotFoundError>>` |

-----

## 3\. 사용자 정의 메소드 규칙 (Custom Methods)

구체적인 리포지토리(예: `UserRepository`)에서 추가 메소드를 작성할 때 다음 접두어(Prefix) 규칙을 따릅니다.

### A. 조회 (Read) - `Find` vs `Get`

조회 결과의 **필수 여부**에 따라 접두어를 구분합니다.

| 접두어 | 의미 | Null 처리 방식 | 예시 |
| :--- | :--- | :--- | :--- |
| **`find...`** | **"있을 수도, 없을 수도 있음"**<br>탐색 결과가 없어도 에러가 아님. | `T \| null` 반환 | `findOneByEmail`<br>`findRecentLogins` |
| **`get...`** | **"무조건 있어야 함"**<br>결과가 없으면 비즈니스 로직 진행 불가. | `Result<T, NotFoundError>` 반환 | `getById`<br>`getByResetToken` |

## B. 쓰기 (Write) - 도메인 언어 사용

단순 `update` 대신, **무엇을 왜 바꾸는지** 명시합니다.

| 접두어 | 설명 | 예시 |
| :--- | :--- | :--- |
| **`register...`** | 복잡한 절차가 포함된 신규 등록 | `register(user)` |
| **`change...`** | 특정 속성 변경 | `changePassword(id, newPw)` |
| **`activate` / `ban`** | 상태(Status) 변경 | `activate(id)` |
| **`issue...`** | 토큰, 쿠폰 등의 발급 | `issueRefreshToken(user)` |
| **`increase` / `decrease`** | 수치 증감 | `increaseLoginCount(id)` |

### C. 검사 (Check) - Boolean 반환

엔티티 전체를 로딩하지 않고 가볍게 확인만 할 때 사용합니다.

| 접두어 | 설명 | 반환 타입 | 예시 |
| :--- | :--- | :--- | :--- |
| **`exists...`** | 존재 여부 확인 | `Promise<boolean>` | `existsByEmail(email)` |
| **`is...`** | 특정 상태인지 확인 | `Promise<boolean>` | `isEmailVerified(email)` |

-----

## 4\. 반환 타입 가이드라인 (Return Types)

상황별로 어떤 타입을 리턴해야 하는지 정리한 표입니다.

| 상황 | 추천 반환 타입 | 비고 |
| :--- | :--- | :--- |
| **조회 (Optional)** | `Promise<Entity \| null>` | `Result` 사용 X. 호출부에서 `if (!user)` 처리 |
| **조회 (Required)** | `Promise<Result<Entity, NotFoundError>>` | 값이 없으면 `Err(NotFoundError)` |
| **저장/수정** | `Promise<Result<Entity, ConflictError>>` | 성공 시 최신 엔티티, 실패 시 중복 에러 등 |
| **삭제** | `Promise<Result<void, NotFoundError>>` | 성공 시 `void` (혹은 `Ok(undefined)`) |
| **단순 체크** | `Promise<boolean>` | `Result` 사용 X |
