import chalk from 'chalk';

export const formatDuration = (ms?: string) => (ms ? chalk.gray(`+${ms}ms`) : '');
export const formatReqId = (id?: string) => (id ? chalk.gray(`[${id.slice(-7)}]`) : '');
export const formatContext = (ctx?: string) => (ctx ? chalk.yellow(`[${ctx}]`) : '');
