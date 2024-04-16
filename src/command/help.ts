import { MODULE_NAME, MODULE_VERSION } from '../index.js';
import chalk from 'chalk';
import figlet from 'figlet';
import { log } from '../module/log.js';

/**
 * Runs help command.
 * @author efekos
 * @version 1.0.1
 * @since 0.0.1-alpha
 */
export async function runHelp() {
    log.invisible('clearing console');
    await console.clear();
    log.invisible('creating figlet');
    await figlet(`${MODULE_NAME} | ${MODULE_VERSION}`, (e, r) => { log.raw(r); });


    log.raw('');
    log.info(
        '----------------------------------------------------------------------',
        'Commands:',
        '',
        '   help                                         Print this',
        `   version,${chalk.gray('--version')},${chalk.gray('--v')}                        Print version`,
        '   logs                                         Test all log types',
        `   tokenize ${chalk.gray('-input')},${chalk.gray('-i')} <path> ${chalk.gray('-write')} [path]      Tokenize source file`,
        `   parse ${chalk.gray('-input')},${chalk.gray('-i')} <path> ${chalk.gray('-write')} [path]         Parse source file`,
        '   compile                                      Compile code',
        '   watch                                        Compile code in watch mode',
        '   clean                                        Clean cache folder'
    );
}