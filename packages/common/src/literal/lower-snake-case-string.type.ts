// 1. 가독성을 위해 알파벳은 그대로 두되, 접어서 관리 추천
type LowerAlphabet =
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
type AllowedNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

// 허용된 문자 목록
type AllowedChar = LowerAlphabet | AllowedNumber | '_';

/**
 * 재귀적으로 한 글자씩 검사 (구현은 동일)
 */
type IsValidCharRecursive<S extends string> = S extends ''
  ? true
  : S extends `${AllowedChar}${infer Tail}`
    ? IsValidCharRecursive<Tail>
    : false; // 허용되지 않은 문자가 나옴

/**
 * 1단계: Lowercase<S> 체크로 대문자 포함 시 즉시 탈락 (재귀 비용 절약)
 * 2단계: 허용되지 않은 특수문자(@, -, 공백 등) 재귀 검사
 */
export type IsLowerSnakeCase<S extends string> =
  S extends Lowercase<S> ? IsValidCharRecursive<S> : false;

/**
 * 사용자에게 노출할 에러 메시지 타입
 */
type SnakeCaseError<S extends string> =
  S extends Lowercase<S>
    ? `Error: Contains invalid characters (only a-z, 0-9, _ allowed)`
    : `Error: Must be lower case (no uppercase allowed)`;

/**
 * 최종 적용 타입
 */
export type LowerSnakeCaseString<S extends string> =
  IsLowerSnakeCase<S> extends true ? S : SnakeCaseError<S>;
