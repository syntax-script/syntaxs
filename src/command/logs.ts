import { log } from '../log.js';

/**
 * Runs logs command.
 */
export function runLogs() {
    log.error('Error message');
    log.info('Info message');
    log.notice('Notice message');
    log.warn('Warn message');
}