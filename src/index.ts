import { arg } from './module/arg.js';
import { log } from './log.js';
import chalk from 'chalk';
import { runLogs } from './command/logs.js';
import { runHelp } from './command/help.js';
import { runInit } from './command/init.js';
import { runTokenize } from './command/tokenize.js';
import { runParse } from './command/parse.js';
import { timer } from './module/timer.js';
import { runCompile } from './command/compile.js';
import { runWatch } from './command/watch.js';

timer.start();
arg.resolve();

// Virtual dotenv
export const MODULE_VERSION = '0.0.1-alpha';
export const FULL_MODULE_NAME = 'syntaxs@0.0.1-alpha';
export const MODULE_NAME = 'syntaxs';

if (arg.getCommand() === 'version' || arg.hasFlag('v') || arg.hasFlag('version')) log.exit.raw(MODULE_VERSION);

const commandMap: Record<string, () => void> = { logs: runLogs, help: runHelp, init: runInit, tokenize: runTokenize, parse: runParse, compile: runCompile, c: runCompile, watch: runWatch, w: runWatch };

if (commandMap[arg.getCommand()] !== undefined) await commandMap[arg.getCommand()]();
else log.exit.error(`Unknown or missing command, use '${chalk.yellow('syntaxs')} help'`);

process.on('SIGINT', () => { log.raw('', '', process.cwd(), FULL_MODULE_NAME); process.exit(556); });
process.on('beforeExit', (c) => { if (c !== 556) log.raw('', '', process.cwd(), FULL_MODULE_NAME); });