import chalk from 'chalk';
import { log } from '../log.js';

export namespace arg {

    export const full: string[] = process.argv.slice(2);

    const args: Record<string, string> = {};
    const flags: string[] = [];
    let command: string = undefined;

    const argumentRegex = /^-([a-z]+)$/;
    const flagRegex = /^--([a-z]+)$/;

    export function resolve() {

        for (let i = 0; i < full.length; i++) {
            const s = full[i];

            if (!s.startsWith('-') && command === undefined) command = s;

            if (s.match(argumentRegex)) {
                if (full[i + 1] === undefined || full[i + 1].match(argumentRegex) || full[i + 1].match(flagRegex)) log.exit.error(`Argument ${chalk.gray(s)} not specified`);
                args[s.slice(1)] = full[i + 1];
                i++;
            }

            if (s.match(flagRegex)) flags.push(s.slice(2));
        }

    }

    export function getCommand() {
        return command ?? '';
    }

    export function hasFlag(flag: string): boolean {
        return flags.includes(flag);
    }

    export function getArgument(arg: string,required:boolean = false): string | undefined {
        if(args[arg]===undefined&&required) log.exit.error(`Argument ${chalk.gray(arg)} required`);
        return args[arg];
    }

}