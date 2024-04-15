import { SyntaxScriptCompiler, isCompilerError } from '@syntaxs/compiler';
import { existsSync, readFileSync } from 'fs';
import { SyxConfig } from '@syntaxs/compiler';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';
import { timer } from '../module/timer.js';

/**
 * Runs compile command.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export async function runCompile(): Promise<void> {

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
    try {
        await compiler.compile();
        log.info(`Compilation successful in ${timer.sinceMarker('compilerstart')}ms`);
    } catch(e) {
        if(isCompilerError(e)) {
            log.compilerError(e);
            log.error('','',`A complete log including debug messages can be found in ${log.path()}`);
        }
    }
    
}