import { log } from '../log.js';

export async function runLogs(){
    log.error('Error message');
    log.success('Success message');
    log.info('Info message');
    log.notice('Notice message');
    log.warn('Warn message');
}