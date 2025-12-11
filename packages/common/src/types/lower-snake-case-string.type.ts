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

type AllowedChar = LowerAlphabet | '_';

/**
 * 영어 소문자와 밑줄(_)로만 구성된 문자열 타입
 */
export type LowerSnakeCaseString<S extends string> = S extends ''
  ? never
  : S extends `${AllowedChar}${infer Tail}`
    ? Tail extends ''
      ? S
      : LowerSnakeCaseString<Tail>
    : never;

export const createLowerSnakeCaseString = <T extends string>(
  key: LowerSnakeCaseString<T>,
): void => {
  console.log(key);
};
