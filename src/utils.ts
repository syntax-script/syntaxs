import { log } from './log.js';

export type ErrorCheckData = [boolean, string][];

/**
 * A handler function to check for multiple errors at the same time. For every list entry,
 * if the given boolean if `true`, logs the given `string` using {@link log.error}. After
 * that, exits the process if any error was present.
 * @param data Error checking data.
 * @author efekos
 */
export function errorChecks(data: ErrorCheckData) {
    data.forEach(d => { if (d[0]) log.error(d[1]); });
    if (data.some(d => d[0])) process.exit(1);
}