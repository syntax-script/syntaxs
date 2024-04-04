import { MODULE_NAME, MODULE_VERSION } from '../index.js';
import chalk from 'chalk';
import figlet from 'figlet';
import { log } from '../log.js';

export async function runHelp() {
    await console.clear();
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
        '   watch                                        Compile code in watch mode'
    );
}