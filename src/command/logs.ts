import { log } from '../module/log.js';

/**
 * Runs logs command.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export function runLogs() {
    log.error('Error message');
    log.info('Info message');
    log.notice('Notice message');
    log.warn('Warn message');
}