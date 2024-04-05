import { existsSync, readFileSync } from 'fs';
import { SyntaxScriptCompiler } from '../compiler/compiler.js';
import { SyxConfig } from '../compiler/types.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../log.js';
import { timer } from '../module/timer.js';

/**
 * Runs compile command.
 * @author efekos
 */
export async function runCompile():Promise<void> {

    if (!existsSync(join(process.cwd(), 'syxconfig.json'))) log.exit.error(`Could not find 'syxconfig.json' file. Try running '${chalk.yellow('syntaxs')} init'. `);

    const config = JSON.parse(readFileSync(join(process.cwd(), 'syxconfig.json')).toString()) as SyxConfig;

    errorChecks([
        [!('compile' in config), 'syxconfig.json.compile: Missing'],
        ['compile' in config && !('root' in config.compile), 'syxconfig.json.compile.root: Missing'],
        ['compile' in config && !('out' in config.compile), 'syxconfig.json.compile.out: Missing'],
        ['compile' in config && !('format' in config.compile), 'syxconfig.json.compile.format: Missing']
    ]);

    const compiler = new SyntaxScriptCompiler(config.compile.root, config.compile.out, config.compile.format);

    log.info('Starting compilation');
    timer.mark('compilerstart');
    await compiler.compile();
    log.info(`Compilation successful in ${timer.sinceMarker('compilerstart')}ms`);
}