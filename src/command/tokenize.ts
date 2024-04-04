import chalk from 'chalk';
import { arg } from '../module/arg.js';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { existsSync, readFileSync, writeFile, writeFileSync } from 'fs';
import { tokenizeSyx } from '../compiler/lexer.js';
import { log } from '../log.js';
import { timer } from '../module/timer.js';

export async function runTokenize() {

    const input = arg.getArgument('input') ?? arg.getArgument('i');
    const write = arg.getArgument('write') ?? '';

    errorChecks([
        [input === undefined, `Missing argument ${chalk.gray('-input')} or ${chalk.gray('-i')}`]
    ]);

    const inputPath = join(process.cwd(), input);

    errorChecks([
        [!existsSync(inputPath), `File not found: ${inputPath}`]
    ]);


    timer.mark('tokenize');
    const tokens = await tokenizeSyx(readFileSync(inputPath).toString(), false);
    if (write === '') log.info('', ...JSON.stringify(tokens, undefined, 4).split('\n'), '');
    log.info(`Created ${tokens.length} tokens from source file '${inputPath}' in ${timer.sinceMarker('tokenize')}ms`);
    if (write !== '') {

        timer.mark('writeo');
        writeFileSync(join(process.cwd(), write), JSON.stringify(tokens, undefined, 4));
        log.info(`Wrote the output into the file ${join(process.cwd(), write)} in ${timer.sinceMarker('writeo')}ms`);
    }
    log.info(`Done in ${timer.sinceStart()}ms total.`);
}