import chalk from 'chalk';
import { log } from './log.js';

export namespace arg {

    export const full: string[] = process.argv.slice(2);

    const args: Record<string, string> = {};
    const flags: string[] = [];
    let command: string = undefined;

    const argumentRegex = /^-([a-z]+)$/;
    const flagRegex = /^--([a-z]+)$/;

    /**
     * Parses all the arguemnts given at the command line. Exits the process if an argument is given with a wrong syntax.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function resolve(_args: string[] = full) {

        for (let i = 0; i < _args.length; i++) {
            const s = _args[i];

            if (!s.startsWith('-') && command === undefined) command = s;

            if (s.match(argumentRegex)) {
                if (_args[i + 1] === undefined || _args[i + 1].match(argumentRegex) || _args[i + 1].match(flagRegex)) log.exit.error(`Argument ${chalk.gray(s)} not specified`);
                args[s.slice(1)] = _args[i + 1];
                i++;
            }

            if (s.match(flagRegex)) flags.push(s.slice(2));
        }

    }

    /**
     * Returns the command, the first command line argument that isn't a flag nor an argument.
     * @returns The command if present. `''` otherwise. 
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function getCommand() {
        return command ?? '';
    }

    /**
     * Searches for a flag through all the flags given from commnad line.
     * @param {string} flag Flag to search. Do not include hyphens.
     * @returns Whether the flag was given.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function hasFlag(flag: string): boolean {
        return flags.includes(flag);
    }

    /**
     * Searches for an argument given from command line.
     * @param {string} arg Argument name to search. Do not include hyphens.
     * @param {boolean} required Whether this argument is required. Function will end the process if the argument isn't present with this value set to `true`.
     * @returns The argument found.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function getArgument(arg: string, required: boolean = false): string | undefined {
        if (args[arg] === undefined && required) log.exit.error(`Argument ${chalk.gray(arg)} required`);
        return args[arg];
    }

    /**
     * Returns all the flags.
     * @returns an array of given flags.
     * @author efekos
     * @since 0.0.1-alpha
     * @version 1.0.0
     */
    export function getFlags() {
        return flags;
    }

    /**
     * Returns all the arguments.
     * @returns a record of given arguments.
     * @author efekos
     * @since 0.0.1-alpha
     * @version 1.0.0
     */
    export function getArgs() {
        return args;
    }

}