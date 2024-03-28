import { arg } from './util/arg.js';
import { log } from './log.js';
import chalk from 'chalk';
import { runLogs } from './command/logs.js';
import { runHelp } from './command/help.js';
import { runInit } from './command/init.js';
import { runTokenize } from './command/tokenize.js';
import { runParse } from './command/parse.js';

arg.resolve();

if (arg.getCommand() === 'version' || arg.hasFlag('v') || arg.hasFlag('version')) log.exit.raw('0.0.1-alpha');

const commandMap:Record<string,()=>void> = {logs:runLogs,help:runHelp,init:runInit,tokenize:runTokenize,parse:runParse};

if(commandMap[arg.getCommand()]!==undefined) await commandMap[arg.getCommand()]();
else log.exit.error(`Unknown or missing command, use '${chalk.yellow('syntaxs')} help'`);

log.raw('', '', process.cwd(), 'syntaxs@0.0.1-alpha');