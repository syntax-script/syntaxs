import { existsSync, readFileSync } from 'fs';
import { SyntaxScriptCompiler, isCompilerError } from '@syntaxs/compiler';
import { SyxConfig } from '@syntaxs/compiler';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../module/log.js';
import { watch } from 'chokidar';

/**
 * Runs watch command, starting a watch session.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export function runWatch() {

    if (!existsSync(join(process.cwd(), 'syxconfig.json'))) log.exit.error(`Could not find 'syxconfig.json' file. Try running '${chalk.yellow('syntaxs')} init'. `);

    const config = JSON.parse(readFileSync(join(process.cwd(), 'syxconfig.json')).toString()) as SyxConfig;

    errorChecks([
        [!('compile' in config), 'syxconfig.json.compile: Missing'],
        ['compile' in config && !('root' in config.compile), 'syxconfig.json.compile.root: Missing'],
        ['compile' in config && !('out' in config.compile), 'syxconfig.json.compile.out: Missing'],
        ['compile' in config && !('format' in config.compile), 'syxconfig.json.compile.format: Missing'],
        ['compile' in config && 'root' in config.compile && !existsSync(join(process.cwd(), config.compile.root)), `Could not find root directory '${join(process.cwd(), config.compile.root)}'`],
        ['compile' in config && 'out' in config.compile && !existsSync(join(process.cwd(), config.compile.out)), `Could not find out directory '${join(process.cwd(), config.compile.out)}'`]
    ]);

    const compiler = new SyntaxScriptCompiler(config.compile.root, config.compile.out, config.compile.format);
    let alreadyCompiling = false;
    let initializing = true;

    const dir = join(process.cwd(), config.compile.root);

    /**
     * Starts a compile process if one isn't running.
     */
    function cmpl() {
        if (alreadyCompiling) return;
        log.info('File change detected, compiling...');
        alreadyCompiling = true;
        compiler.compile().then(() => {
            log.info('Compiled. Waiting for file changes.');
            alreadyCompiling = false;
        }).catch(err => log.error('Could not compile. Waiting for file changes.'));
    }

    const watcher = watch(dir, {
        awaitWriteFinish: {
            pollInterval: 10,
            stabilityThreshold: 50
        },
        ignoreInitial: true,
        disableGlobbing: true
    });
    watcher.on('change', () => {
        if (initializing) return;
        cmpl();
    });
    watcher.on('add', () => { log.debug('Added file'); });
    watcher.on('ready', () => {
        initializing = false;
        cmpl();
    });
    watcher.on('error', (e) => {
        if(isCompilerError(e)) log.compilerError(e);
        log.error('Could not compile. Waiting for file changes.');
    });
}