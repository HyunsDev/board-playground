// ----------------------------------------------------------------------
// 1. 기초 문자셋 정의
// ----------------------------------------------------------------------
type LowerAlpha =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Underscore = '_';

// 단어의 "나머지 부분"에 올 수 있는 문자 (첫 글자 제외)
type BodyChar = LowerAlpha | Digit | Underscore;

// ----------------------------------------------------------------------
// 2. 단어(Word) 내부 검증 로직
// ----------------------------------------------------------------------

// 이미 Lowercase 체크를 통과했으므로, 여기서는 "허용되지 않은 특수문자(-, @ 등)"만 걸러내면 됨
type IsValidBody<S extends string> = S extends ''
  ? true
  : S extends `${BodyChar}${infer Rest}`
    ? IsValidBody<Rest>
    : false;

// 각 단어(Item) 검증:
// 1. 영어 소문자로 시작해야 함 (숫자/언더바 시작 불가)
// 2. 나머지는 BodyChar로 구성
type IsValidWord<S extends string> = S extends `${LowerAlpha}${infer Tail}`
  ? IsValidBody<Tail>
  : false;

// ----------------------------------------------------------------------
// 3. 구조(Structure) 및 Depth 검증 로직
// ----------------------------------------------------------------------
type CheckStructure<
  S extends string,
  D extends number,
  Count extends unknown[] = [unknown],
> = S extends `${infer Head}:${infer Rest}`
  ? IsValidWord<Head> extends true
    ? CheckStructure<Rest, D, [...Count, unknown]>
    : false
  : IsValidWord<S> extends true
    ? [number] extends [D]
      ? true
      : Count['length'] extends D
        ? true
        : false
    : false;

// ----------------------------------------------------------------------
// 4. 메인 타입 (최적화 적용)
// ----------------------------------------------------------------------

/**
 * IsCodeLiteral
 * * 최적화 포인트:
 * S extends Lowercase<S> 조건을 가장 먼저 배치하여,
 * 대문자가 하나라도 섞여 있으면 무거운 재귀 로직(CheckStructure)을 타지 않고 즉시 false 반환
 */
export type IsCodeLiteral<S extends string, D extends number = number> =
  S extends Lowercase<S>
    ? CheckStructure<S, D> // 대문자가 없으면 구조 검사 진행
    : false; // 대문자 있으면 즉시 탈락

/**
 * CodeLiteral
 * 조건에 맞으면 문자열 리터럴 S 반환, 틀리면 never
 */
export type CodeLiteral<S extends string, D extends number = number> =
  IsCodeLiteral<S, D> extends true ? S : never;
