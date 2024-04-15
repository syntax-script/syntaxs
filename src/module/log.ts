import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { CompilerError } from '@syntaxs/compiler';
import { FULL_MODULE_NAME } from '../index.js';
import { arg } from './arg.js';
import chalk from 'chalk';
import { homedir } from 'os';
import { join } from 'path';

function getLocalAppDataPath() {
    switch (process.platform) {
        case 'win32':
            return process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
        case 'darwin':
            return join(homedir(), 'Library', 'Application Support');
        case 'linux':
            return process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share');
        default:
            return null;
    }
}

const dirPath = join(getLocalAppDataPath(), 'syntaxs-logs', 'logs');
const logPath = join(dirPath, new Date().toISOString().replace(/:/g, '-') + '.log');
const logLines: string[] = [];

process.on('exit', () => {
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
    writeFileSync(logPath, logLines.map((s, i) => `${i + 1} ${s}`).join('\n'));
});

export namespace log {

    function date() {
        const d = new Date();

        return `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}]`;
    }

    /**
     * Returns the path that the log will be saved.
     * @returns Path that the log will be saved.
     * @author efekos
     * @since 0.0.2-alpha
     * @version 1.0.0
     */
    export function path(): string {
        return logPath;
    }

    /**
     * Logs every message given as an error.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.1
     * @since 0.0.1-alpha
     */
    export function error(...message: any[]) {
        message.forEach(m => {
            console.error(`${chalk.bgRed(' ERROR ')}`, m);
            logLines.push(`${date()} [ERROR] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    /**
     * Alias for {@link console.log}.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function raw(...message: any[]) {
        message.forEach(m => {
            console.log(m);
            logLines.push(`${date()} [LOG] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    /**
     * Logs every message given as an info.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function info(...message: any[]) {
        message.forEach(m => {
            console.info(`${chalk.bgBlue(' INFO ')}`, m);
            logLines.push(`${date()} [INFO] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    /**
     * Logs a {@link CompilerError} as an error.
     * @param e The error.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function compilerError(e: CompilerError) {
        log.error(`${chalk.gray(`(${e.file}:${e.range.start.line}:${e.range.start.character})`)} ${e.message}`);
        if (e.actions.length > 0) log.error('Possible Solutions:', ...e.actions.map(a => `  ${a.title}`));
    }

    /**
     * Logs every message given as a warning.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function warn(...message: any[]) {
        message.forEach(m => {
            console.warn(`${chalk.whiteBright(chalk.bgYellow(' WARN '))}`, m);
            logLines.push(`${date()} [WARN] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    /**
     * Logs every message given as a debug message. No need to check for debug flag.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function debug(...message: any[]) {
        message.forEach(m => {
            if (arg.hasFlag('debug')) console.debug(`${chalk.whiteBright(chalk.bgYellowBright(' DEBUG '))}`, m);
            logLines.push(`${date()} [DEBUG] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    /**
     * Logs every message given as a notice message.
     * @param {any[]} message Messages to log.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function notice(...message: any[]) {
        message.forEach(m => {
            console.info(`${chalk.whiteBright(chalk.bgBlue(' NOTICE '))}`, m);
            logLines.push(`${date()} [ERROR] ${typeof m === 'object' ? JSON.stringify(m) : m}`);
        });
    }

    export namespace exit {

        /**
         * Alias for {@link log.error}, but exits the process after logging.
         * @param {any[]} message Messages to log.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
         */
        export function error(...message: any[]) {
            log.error(...message);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(1);
        }


        /**
         * Alias for {@link log.compilerError}, but exits the process after logging.
         * @param e The error.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
         */
        export function compilerError(e: CompilerError) {
            log.compilerError(e);
            log.raw('', '', process.cwd(), FULL_MODULE_NAME);
            process.exit(1);
        }

        /**
         * Alias for {@link log.raw}, but exits the process after logging.
         * @param {any[]} message Messages to log.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
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
         * @param {any[]} message Messages to log.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
         */
        export function error(...message: any[]) {
            log.error(...message);
            throw new ProgramError();
        }



        /**
         * Alias for {@link log.compilerError}, but throws an error after logging.
         * @param e The error.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
         */
        export function compilerError(e: CompilerError) {
            log.compilerError(e);
            throw new ProgramError();
        }


        /**
         * Alias for {@link log.raw}, but throws an error after logging.
         * @param {any[]} message Messages to log.
         * @author efekos
         * @version 1.0.0
         * @since 0.0.1-alpha
         */
        export function raw(...message: any[]) {
            log.raw(...message);
            throw new ProgramError();
        }

    }

}

/**
 * An error that is only thrown by {@link log.thrower} functions.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export class ProgramError extends Error { }