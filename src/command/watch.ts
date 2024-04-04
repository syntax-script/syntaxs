import { existsSync, readFileSync } from 'fs';
import { SyntaxScriptCompiler } from '../compiler/compiler.js';
import { SyxConfig } from '../compiler/types.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import { join } from 'path';
import { log } from '../log.js';
import { watch } from 'chokidar';

export async function runWatch() {

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

    const compiler = new SyntaxScriptCompiler(config.compile.root, config.compile.out, config.compile.format, true);
    let alreadyCompiling = false;
    let initializing = true;

    const dir = join(process.cwd(), config.compile.root);

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
    watcher.on('error', () => {
        log.error('Could not compile. Waiting for file changes.');
    });
}