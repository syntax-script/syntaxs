import { log } from './log.js';

export type ErrorCheckData = [boolean, string][];

export function errorChecks(data: ErrorCheckData) {
    data.forEach(d => { if (d[0]) log.error(d[1]); });
    if (data.some(d => d[0])) process.exit(1);
}