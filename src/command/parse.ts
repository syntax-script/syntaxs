import { existsSync, readFileSync, writeFileSync } from 'fs';
import { isCompilerError, syxparser } from '@syntaxs/compiler';
import { arg } from '../module/arg.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';
import { timer } from '../module/timer.js';
import { tokenizeSyx } from '@syntaxs/compiler';

/**
 * Runs parse command.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export function runParse() {

    const input = arg.getArgument('input') ?? arg.getArgument('i');
    const write = arg.getArgument('write') ?? '';

    log.invisible('checking for -input');
    errorChecks([
        [input === undefined, `Missing argument ${chalk.gray('-input')} or ${chalk.gray('-i')}`]
    ]);

    const inputPath = join(process.cwd(), input);

    log.invisible('checking for file');
    errorChecks([
        [!existsSync(inputPath), `File not found: ${inputPath}`]
    ]);


    timer.mark('parse');
    try {
        log.invisible('parsing tokens');
        const parsed = syxparser.parseTokens(tokenizeSyx(readFileSync(inputPath).toString()), inputPath);
        if (write === '') log.info('', ...JSON.stringify(parsed, undefined, 4).split('\n'), '');
        log.info(`Created ${parsed.body.length} statements from source file '${inputPath}' in ${timer.sinceMarker('parse')}ms`);
        if (write !== '') {

            timer.mark('writeo');
            writeFileSync(join(process.cwd(), write), JSON.stringify(parsed, undefined, 4));
            log.info(`Wrote the output into the file '${join(process.cwd(), write)}' in ${timer.sinceMarker('writeo')}ms`);
        }
        log.info(`Done in ${timer.sinceStart()}ms total.`);
    } catch (error) {
        if (isCompilerError(error)) {
            log.compilerError(error);
            log.error('', `A complete log including debug messages can be found in ${log.path()}`);
        }
    }
}