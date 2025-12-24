const reset = '\x1b[0m';

const wrap = (codes: number[]) => (text: string): string =>
  `${codes.map((code) => `\x1b[${code}m`).join('')}${text}${reset}`;

export const ansi = {
  green: wrap([32]),
  red: wrap([31]),
  yellow: wrap([33]),
  cyan: wrap([36]),
  gray: wrap([90]),
  white: wrap([37]),
  black: wrap([30]),
  bold: wrap([1]),
  boldGreen: wrap([1, 32]),
  boldRed: wrap([1, 31]),
  boldYellow: wrap([1, 33]),
  boldWhite: wrap([1, 37]),
  bgRedWhiteBold: wrap([41, 37, 1]),
  bgGreenBlackBold: wrap([42, 30, 1]),
};
