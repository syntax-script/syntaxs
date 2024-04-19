import { SyntaxScriptCompiler, isCompilerError } from '@syntaxs/compiler';
import { existsSync, readFileSync } from 'fs';
import { SyxConfig } from '@syntaxs/compiler';
import { arg } from '../module/arg.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';
import { timer } from '../module/timer.js';

/**
 * Runs compile command.
 * @author efekos
 * @version 1.0.1
 * @since 0.0.1-alpha
 */
export async function runCompile(): Promise<void> {

    log.invisible('checking for syxconfig.json in process.cwd');
    if (!existsSync(join(process.cwd(), 'syxconfig.json'))) log.exit.error(`Could not find 'syxconfig.json' file. Try running '${chalk.yellow('syntaxs')} init'. `);

    const config = JSON.parse(readFileSync(join(process.cwd(), 'syxconfig.json')).toString()) as SyxConfig;

    log.invisible('checking for required properties in config');
    errorChecks([
        [!('compile' in config), 'syxconfig.json.compile: Missing'],
        [!arg.getArgument('root')&&!arg.getArgument('r')&& 'compile' in config && !('root' in config.compile), 'syxconfig.json.compile.root: Missing'],
        [!arg.getArgument('out')&&!arg.getArgument('o')&&'compile' in config && !('out' in config.compile), 'syxconfig.json.compile.out: Missing'],
        [!arg.getArgument('language')&&!arg.getArgument('lang')&&!arg.getArgument('lng')&&!arg.getArgument('l')&&'compile' in config && !('format' in config.compile), 'syxconfig.json.compile.format: Missing']
    ]);

    log.invisible('creating compiler instance');
    const compiler = new SyntaxScriptCompiler(arg.getArgument('root')??arg.getArgument('r')??config.compile.root, arg.getArgument('out')??arg.getArgument('o')??config.compile.out, arg.getArgument('language')??arg.getArgument('lang')??arg.getArgument('lng')??arg.getArgument('l')??config.compile.format);

    log.info('Starting compilation');
    timer.mark('compilerstart');
    try {
        log.invisible('compiling');
        await compiler.compile();
        log.info(`Compilation successful in ${timer.sinceMarker('compilerstart')}ms`);
    } catch (e) {
        log.invisible('there is an error');
        log.invisible(`${JSON.stringify(e)}`);
        if (isCompilerError(e)) {
            log.invisible('this is a compiler error, logging the error');
            log.compilerError(e);
            log.error('', '', `A complete log including debug messages can be found in ${log.path()}`);
        }
    }

}