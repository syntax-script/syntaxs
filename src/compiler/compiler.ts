import { readFileSync, readdirSync, stat, statSync } from 'fs';
import { join } from 'path';
import { syxparser } from './ast.js';
import { tokenizeSyx } from './lexer.js';
import { CompileStatement, ExportStatement, ImportsStatement, NodeType, OperatorStatement, PrimitiveTypeExpression, Statement, StringExpression, VariableExpression } from './types.js';
import { log } from '../log.js';

export class SyntaxScriptCompiler {

    /**
     * Root dir to scan for .syx and .sys files
     */
    private readonly rootDir: string;
    /**
     * Out dir to output files.
     */
    private readonly outDir: string;
    private readonly mainFileFormat: string;

    /**
     * Stores exports for every .syx file.
     */
    public readonly exportData: Record<string, AnyExport[]> = {};

    constructor(rootDir: string, outDir: string, format: string) {
        this.rootDir = join(process.cwd(), rootDir);
        this.outDir = join(process.cwd(), outDir);
        this.mainFileFormat = format;
    }

    public async compile() {
        
        console.log('root dir is',this.rootDir);
        await this.compileSyxFiles(this.rootDir);

    }

    public compileSyxFiles(folderPath: string) {

        const files = readdirSync(folderPath);
        log.debug('HEREHEREHERE',folderPath,files);

        files.forEach(f=>{
            if(f.endsWith('.syx')) this.compileSyx(join(folderPath,f));
            else if (statSync(join(folderPath,f)).isDirectory())this.compileSyxFiles(join(folderPath,f));
        });
    }

    public compileSyx(file: string) {
        const ast = syxparser.parseTokens(tokenizeSyx(readFileSync(file).toString()));
        const out: AnyExport[] = [];

        ast.body.forEach(statement => {
            if (statement.type !== NodeType.Export) return;
            const exported = (statement as ExportStatement).body;

            if (exported.type === NodeType.Operator) {
                const operatorStmt = exported as OperatorStatement;

                //# Generate regexMatcher
                let regexMatcher: RegExp = new RegExp('');
                operatorStmt.regex.forEach(regexStatement => {

                    if (regexStatement.type === NodeType.PrimitiveType) {
                        regexMatcher = new RegExp(regexMatcher.source + regexes[(regexStatement as PrimitiveTypeExpression).value].source);
                    }
                    if (regexStatement.type === NodeType.WhitespaceIdentifier) {
                        regexMatcher = new RegExp(regexMatcher.source + regexes['+s'].source);
                    }
                    if (regexStatement.type === NodeType.String) {
                        regexMatcher = new RegExp(regexMatcher.source + escapeRegex((regexStatement as StringExpression).value));
                    }

                });

                const operatorStmtExport: OperatorExport = { imports: {}, outputGenerators: {}, regexMatcher, type: ExportType.Operator };

                //# Handle statements
                operatorStmt.body.forEach(stmt => {
                    if (stmt.type === NodeType.Compile) {
                        const compileStmt = stmt as CompileStatement;

                        compileStmt.formats.forEach(frmt => {
                            if (operatorStmtExport.outputGenerators[frmt] !== undefined) log.exit.error(`Duplicate file format at compile statement \'${frmt}\'`);

                            operatorStmtExport.outputGenerators[frmt] = (src) => {
                                let out = '';

                                compileStmt.body.forEach(e => {
                                    if (e.type === NodeType.String) out += e.value;
                                    else if (e.type === NodeType.Variable) {
                                        const varExpr = e as VariableExpression;
                                        const v = src.match(regexes[varExpr.value])[varExpr.index];
                                        if (v === undefined) log.exit.error('Missing variable.');
                                        out += v;
                                    }
                                });

                                return out;
                            };

                        });

                    } else if (stmt.type === NodeType.Imports) {
                        const importStmt = stmt as ImportsStatement;

                        importStmt.formats.forEach(frmt => {
                            if (operatorStmtExport.imports[frmt] !== undefined) log.exit.error(`Duplicate file format at imports statement \'${frmt}\'`);
                            operatorStmtExport.imports[frmt] = importStmt.module;
                        });

                    } else log.exit.error(`Unexpected \'${stmt.type}\' statement insdie operator statement.`);
                });

                out.push(operatorStmtExport);
            } else log.exit.error(`Unexpected \'${statement.type}\' statement after export statement.`);


        });

        
        this.exportData[file] = out;
    }

}

export enum ExportType {
    Operator
}

export interface Export {
    type: ExportType;
}

export interface OperatorExport extends Export {
    type: ExportType.Operator,
    regexMatcher: RegExp;
    outputGenerators: Record<string, OneParameterMethod<string, string>>;
    imports: Record<string, string>;
}

export type OneParameterMethod<V, R> = (v: V) => R;
export type ReturnerMethod<R> = () => R;

export type AnyExport = OperatorExport;

export const regexes: Record<string, RegExp> = {
    int: /[0-9]+/,
    string: /('(\p{Any}{*})'|"(\p{Any}{*})")/,
    boolean: /true|false/,
    '+s': /(\s+)?/
};

export function escapeRegex(src:string):string{
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}