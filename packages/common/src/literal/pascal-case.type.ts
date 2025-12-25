// 1. 알파벳 정의 (소문자)
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

// 2. 알파벳 정의 (대문자) - 파스칼케이스는 첫 글자 및 단어 시작에 대문자가 필요함
type UpperAlphabet =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

type AllowedNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

// 3. 허용된 문자 목록 (알파벳 대소문자 + 숫자)
// 스네이크케이스와 달리 '_'가 빠지고 대문자가 추가됩니다.
type AllowedChar = LowerAlphabet | UpperAlphabet | AllowedNumber;

/**
 * 재귀적으로 한 글자씩 검사하여 허용되지 않은 문자가 있는지 확인
 */
type IsValidCharRecursive<S extends string> = S extends ''
  ? true
  : S extends `${AllowedChar}${infer Tail}`
    ? IsValidCharRecursive<Tail>
    : false;

/**
 * PascalCase 검증 로직
 * 1. 빈 문자열인지 확인 (빈 문자열은 불가)
 * 2. 첫 글자가 대문자(UpperAlphabet)인지 확인
 * 3. 나머지 글자가 허용된 문자(AllowedChar)로만 구성되어 있는지 재귀 검사
 */
export type IsPascalCase<S extends string> = S extends ''
  ? false
  : S extends `${infer First}${infer Rest}`
    ? First extends UpperAlphabet
      ? IsValidCharRecursive<Rest>
      : false
    : false;

/**
 * 사용자에게 노출할 에러 메시지 타입
 * - 상황에 따라 구체적인 에러 원인을 알려줍니다.
 */
type PascalCaseError<S extends string> = S extends ''
  ? `Error: String cannot be empty`
  : S extends `${infer First}${string}`
    ? First extends UpperAlphabet
      ? `Error: Contains invalid characters (only a-z, A-Z, 0-9 allowed)` // 첫 글자는 맞는데 뒤에서 실패한 경우
      : `Error: Must start with an Uppercase letter` // 첫 글자부터 틀린 경우
    : `Error: Invalid input`;

/**
 * 최종 적용 타입
 * - 검증 통과 시 문자열 S 반환
 * - 실패 시 에러 메시지 반환
 */
export type PascalCaseString<S extends string> =
  IsPascalCase<S> extends true ? S : PascalCaseError<S>;
