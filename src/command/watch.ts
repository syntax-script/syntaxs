import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { log } from '../log.js';
import chalk from 'chalk';
import { SyxConfig } from '../compiler/types.js';
import { errorChecks } from '../utils.js';
import { SyntaxScriptCompiler } from '../compiler/compiler.js';
import { timer } from '../module/timer.js';
import { PowerShell } from 'node-powershell';
import { exec } from 'child_process';
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

    const compiler = new SyntaxScriptCompiler(config.compile.root, config.compile.out, config.compile.format);
    let alreadyCompiling = false;

    const dir = join(process.cwd(), config.compile.root);
    
    const watcher = watch(dir);
    watcher.on('all',(e)=>{
        if(alreadyCompiling) return;
        log.info('File change detected, compiling...');
        alreadyCompiling = true;
        compiler.compile().then(()=>{
            log.info('Compiled. Waiting for file changes.');
            alreadyCompiling = false;
        });
    });
}