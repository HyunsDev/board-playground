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

type AllowedChar = LowerAlphabet | '_' | ':';

export type IsCodeLiteral<S extends string> = S extends ''
  ? false
  : S extends `${AllowedChar}${infer Tail}`
    ? Tail extends ''
      ? true
      : IsCodeLiteral<Tail>
    : false;

/**
 * 조건에 맞으면 그 문자열 타입 그대로(S) 반환, 아니면 never (에러 유발)
 */
export type CodeLiteral<S extends string> = IsCodeLiteral<S> extends true ? S : never;
