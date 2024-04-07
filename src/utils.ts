import { log } from './module/log.js';

/**
 * Type of the data passed in to {@link errorChecks}.
 */
export type ErrorCheckData = [boolean, string][];

/**
 * A handler function to check for multiple errors at the same time. For every list entry,
 * if the given boolean if `true`, logs the given `string` using {@link log.error}. After
 * that, exits the process if any error was present.
 * @param {ErrorCheckData} data Error checking data.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export function errorChecks(data: ErrorCheckData) {
    data.forEach(d => { if (d[0]) log.error(d[1]); });
    if (data.some(d => d[0])) process.exit(1);
}