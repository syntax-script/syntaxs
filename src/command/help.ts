import figlet from 'figlet';
import { log } from '../log.js';
import chalk from 'chalk';

export async function runHelp() {
    await console.clear();
    await figlet('syntaxs | 0.0.1-alpha', (e, r) => { log.raw(r); });


    log.raw('');
    log.info(
        '----------------------------------------------------------------------',
        'Commands:',
        '',
        '   help                                         Print this',
        `   version,${chalk.gray('--version')},${chalk.gray('--v')}                        Print version`,
        '   logs                                         Test all log types',
        `   tokenize ${chalk.gray('-input')},${chalk.gray('-i')} <path> ${chalk.gray('-write')} [path]      Tokenize source file`,
        `   parse ${chalk.gray('-input')},${chalk.gray('-i')} <path> ${chalk.gray('-write')} [path]         Parse source file`
    );
}