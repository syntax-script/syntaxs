import { arg } from './module/arg.js';
import chalk from 'chalk';
import { environment } from './env.js';
import { log } from './module/log.js';
import { runClean } from './command/clean.js';
import { runCompile } from './command/compile.js';
import { runHelp } from './command/help.js';
import { runInit } from './command/init.js';
import { runParse } from './command/parse.js';
import { runTokenize } from './command/tokenize.js';
import { runWatch } from './command/watch.js';
import { timer } from './module/timer.js';

timer.start();
arg.resolve();

log.invisible(
    'Module info:', ` version: ${environment.MODULE_VERSION}`, ` name: ${environment.MODULE_NAME}`, ` full: ${environment.FULL_MODULE_NAME}`,
    'Runtime info:', ` start time: ${new Date().toISOString()}`, ` args: ${JSON.stringify(arg.full)}`, ` location: ${process.cwd()}`, ` env: ${JSON.stringify(process.env)}`,
    'Resolved argument info:', ` command: ${arg.getCommand()}`, ` flags: ${JSON.stringify(arg.getFlags())}`, ` args: ${JSON.stringify(arg.getArgs())}`
);

if (arg.getCommand() === 'version' || arg.hasFlag('v') || arg.hasFlag('version')) {
    log.invisible('version command found');
    log.raw(environment.MODULE_VERSION);
    process.exit(556);
}

const commandMap: Record<string, () => void> = { help: runHelp, init: runInit, tokenize: runTokenize, parse: runParse, compile: runCompile, c: runCompile, watch: runWatch, w: runWatch, clean: runClean };

log.invisible('adding SIGINT, beforeExit and exit listeners');
process.on('SIGINT', () => { log.raw('', '', process.cwd(), environment.FULL_MODULE_NAME); process.exit(556); });
process.on('beforeExit', (c) => { if (c !== 556) log.raw('', '', process.cwd(), environment.FULL_MODULE_NAME); });


log.invisible(`Searching method for command '${arg.getCommand()}'`);
if (commandMap[arg.getCommand()] !== undefined) await commandMap[arg.getCommand()]();
else log.exit.error(`Unknown or missing command, use '${chalk.yellow('syntaxs')} help'`);
