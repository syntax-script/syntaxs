import { existsSync, readFileSync, writeFileSync } from 'fs';
import { arg } from '../module/arg.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';
import { syxparser } from '@syntaxs/compiler';
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

    errorChecks([
        [input === undefined, `Missing argument ${chalk.gray('-input')} or ${chalk.gray('-i')}`]
    ]);

    const inputPath = join(process.cwd(), input);

    errorChecks([
        [!existsSync(inputPath), `File not found: ${inputPath}`]
    ]);


    timer.mark('parse');
    const parsed = syxparser.parseTokens(tokenizeSyx(readFileSync(inputPath).toString(), false), false);
    if (write === '') log.info('', ...JSON.stringify(parsed, undefined, 4).split('\n'), '');
    log.info(`Created ${parsed.body.length} statements from source file '${inputPath}' in ${timer.sinceMarker('parse')}ms`);
    if (write !== '') {

        timer.mark('writeo');
        writeFileSync(join(process.cwd(), write), JSON.stringify(parsed, undefined, 4));
        log.info(`Wrote the output into the file '${join(process.cwd(), write)}' in ${timer.sinceMarker('writeo')}ms`);
    }
    log.info(`Done in ${timer.sinceStart()}ms total.`);
}