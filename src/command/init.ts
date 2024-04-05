import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { arg } from '../module/arg.js';
import chalk from 'chalk';
import { errorChecks } from '../utils.js';
import inquirer from 'inquirer';
import { join } from 'path';
import { log } from '../log.js';

export interface InitContext {
    name: string;
    description: string;
    version: string;
    input: string;
    output: string;
}

/**
 * Runs init command.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export async function runInit() {
    if (existsSync(join(process.cwd(), 'syxconfig.json'))) log.exit.error('There is already a \'syxconfig.json\' file, delete it.');

    if (arg.hasFlag('y')) errorChecks([
        [existsSync(join(process.cwd(), 'src')), `Folder already exists: src. Define another folder by running without ${chalk.gray('--y')}.`],
        [existsSync(join(process.cwd(), 'out')), `Folder already exists: out. Define another folder by running without ${chalk.gray('--y')}.`]
    ]);

    const context: InitContext = !arg.hasFlag('y') ? await inquirer.prompt([
        {
            type: 'input',
            message: 'Name',
            default: process.cwd().split('\\').pop(),
            name: 'name'
        },
        {
            type: 'input',
            message: 'Description',
            name: 'description'
        },
        {
            type: 'input',
            message: 'Version',
            default: '1.0.0',
            name: 'version'
        },
        {
            type: 'input',
            message: 'Root directory',
            default: './src',
            name: 'input'
        },
        {
            type: 'input',
            message: 'Out directory',
            default: './out',
            name: 'output'
        }
    ]) : { name: process.cwd().split('\\').pop(), description: '', version: '', input: './src', output: './out' };

    const file = { name: context.name, description: context.description, version: context.version, compiler: { root: context.input, out: context.output, outFormat: 'ts' } };

    const fileToWrite = JSON.stringify(file, undefined, 4);

    log.info('', ...fileToWrite.split('\n'), '');
    const r: { r: boolean; } = await inquirer.prompt({
        message: 'Are you okay with this output?',
        type: 'confirm',
        name: 'r'
    });

    if (r.r) {
        writeFileSync(join(process.cwd(), 'syxconfig.json'), fileToWrite, { encoding: 'utf8' });
        log.info('Created syxconfig.json file.');

        if (!existsSync(join(process.cwd(), context.input))) {
            await mkdirSync(join(process.cwd(), context.input), { recursive: true });
            log.info('Created root folder.');
        }
        if (!existsSync(join(process.cwd(), context.output))) {
            await mkdirSync(join(process.cwd(), context.output), { recursive: true });
            log.info('Created out folder.');
        }

    }

}