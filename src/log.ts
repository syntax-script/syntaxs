import { FULL_MODULE_NAME } from './index.js';
import { arg } from './module/arg.js';
import chalk from 'chalk';

export namespace log {

    /**
     * Logs every message given as an error.
     * @param message Messages to log.
     */
    export function error(...message: any[]) {
        message.forEach(m => console.error(`${chalk.bgRed(' ERROR ')}`, m));
    }

    /**
     * Alias for {@link console.log}.
     * @param message Messages to log.
     */
    export function raw(...message: any[]) {
        message.forEach(m => console.log(m));
    }

    /**
     * Logs every message given as an info.
     * @param message Messages to log.
     */
    export function info(...message: any[]) {
        message.forEach(m => console.info(`${chalk.bgBlue(' INFO ')}`, m));
    }

    /**
     * Logs every message given as a warning.
     * @param message Messages to log.
     */
    export function warn(...message: any[]) {
        message.forEach(m => console.warn(`${chalk.whiteBright(chalk.bgYellow(' WARN '))}`, m));
    }

    /**
     * Logs every message given as a debug message. No need to check for debug flag.
     * @param message Messages to log.
     */
    export function debug(...message: any[]) {
        if (arg.hasFlag('debug'))
            message.forEach(m => console.debug(`${chalk.whiteBright(chalk.bgYellowBright(' DEBUG '))}`, m));
    }

    /**
     * Logs every message given as a notice message.
     * @param message Messages to log.
     */
    export function notice(...message: any[]) {
        message.forEach(m => console.info(`${chalk.whiteBright(chalk.bgBlue(' NOTICE '))}`, m));
    }

    export namespace exit {

        /**
         * Alias for {@link log.error}, but exits the process after logging.
         * @param message Messages to log.
         */
        export function error(...message: any[]) {
            log.error(...message);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(1);
        }

        /**
         * Alias for {@link log.raw}, but exits the process after logging.
         * @param message Messages to log.
         */
        export function raw(...message: any[]) {
            log.raw(...message);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(0);
        }

    }


    export namespace thrower {

        /**
         * Alias for {@link log.error}, but throws an error after logging.
         * @param message Messages to log.
         */
        export function error(...message: any[]) {
            log.error(...message);
            throw new ProgramError();
        }

        /**
         * Alias for {@link log.raw}, but throws an error after logging.
         * @param message Messages to log.
         */
        export function raw(...message: any[]) {
            log.raw(...message);
            throw new ProgramError();
        }

    }

}

export class ProgramError extends Error {

}