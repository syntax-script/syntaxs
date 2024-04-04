import { FULL_MODULE_NAME } from './index.js';
import { arg } from './module/arg.js';
import chalk from 'chalk';

export namespace log {

    export function error(...message: any[]) {
        message.forEach(m => console.log(`${chalk.bgRed(' ERROR ')}`, m));
    }

    export function raw(...message: any[]) {
        message.forEach(m => console.log(m));
    }

    export function info(...message: any[]) {
        message.forEach(m => console.log(`${chalk.bgBlue(' INFO ')}`, m));
    }

    export function warn(...message: any[]) {
        message.forEach(m => console.log(`${chalk.whiteBright(chalk.bgYellow(' WARN '))}`, m));
    }

    export function debug(...message: any[]) {
        if (arg.hasFlag('debug'))
            message.forEach(m => console.log(`${chalk.whiteBright(chalk.bgYellowBright(' DEBUG '))}`, m));
    }

    export function notice(...message: any[]) {
        message.forEach(m => console.log(`${chalk.whiteBright(chalk.bgBlue(' NOTICE '))}`, m));
    }

    export namespace exit {
        export function error(...message: any[]) {
            log.error(...message);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(1);
        }

        export function raw(...message: any[]) {
            log.raw(...message);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(0);
        }

    }


    export namespace thrower {
        export function error(...message: any[]) {
            log.error(...message);
            throw new ProgramError();
        }

        export function raw(...message: any[]) {
            log.raw(...message);
            throw new ProgramError();
        }

    }

}

export class ProgramError extends Error {

}