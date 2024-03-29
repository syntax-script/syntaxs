import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { log } from '../log.js';
import chalk from 'chalk';
import { SyxConfig } from '../compiler/types.js';
import { errorChecks } from '../utils.js';

export function runCompile() {

    if (!existsSync(join(process.cwd(), 'syxconfig.json'))) log.exit.error(`Could not find 'syxconfig.json' file. Try running '${chalk.yellow('syntaxs')} init'. `);

    const config = JSON.parse(readFileSync(join(process.cwd(), 'syxconfig.json')).toString()) as SyxConfig;
   
    errorChecks([
        [!('compile' in config),'syxconfig.json.compile: Missing'],
        ['compile' in config &&!('root' in config.compile),'syxconfig.json.compile.root: Missing'],
        ['compile' in config &&!('out' in config.compile),'syxconfig.json.compile.out: Missing'],
        ['compile' in config &&!('format' in config.compile),'syxconfig.json.compile.format: Missing']
    ]);

    log.info('Compiler isn\'t done yet. See you later!');

}