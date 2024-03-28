import chalk from 'chalk';
import { arg } from '../module/arg.js';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { tokenize } from '../compiler/lexer.js';
import { log } from '../log.js';
import { timer } from '../module/timer.js';

export async function runTokenize() {
    
    const input = arg.getArgument('input')??arg.getArgument('i');
    const write = arg.getArgument('write')??'';
    
    errorChecks([
        [input===undefined,`Missing argument ${chalk.gray('-input')} or ${chalk.gray('-i')}`]
    ]);

    const inputPath = join(process.cwd(),input);

    errorChecks([
        [!existsSync(inputPath),`File not found: ${inputPath}`]
    ]);


    timer.mark('tokenize');
    const tokens = await tokenize(readFileSync(inputPath).toString());
    if(write==='')log.info('',...JSON.stringify(tokens,undefined,4).split('\n'),'');
    log.info(`Created ${tokens.length} tokens from source file '${inputPath}' in ${timer.sinceMarker('tokenize')/1000}s`);
    if(write!==''){

        timer.mark('writeo');
        await writeFileSync(join(process.cwd(),write),JSON.stringify(tokens,undefined,4));
        log.info(`Wrote the output into the file ${join(process.cwd(),write)} in ${timer.sinceMarker('writeo')/1000}`);
    }
    log.success(`Done in ${timer.sinceStart()/1000}s total.`);
}