import { existsSync, readFileSync, readdirSync, stat, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { sysparser, syxparser } from './ast.js';
import { tokenizeSys, tokenizeSyx } from './lexer.js';
import { CompileStatement, ExportStatement, ImportStatement, ImportsStatement, NodeType, OperatorStatement, PrimitiveTypeExpression, Statement, StringExpression, VariableExpression } from './types.js';
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
    public readonly exportData: Record<string, AnyExportable[]> = {};

    constructor(rootDir: string, outDir: string, format: string) {
        this.rootDir = join(process.cwd(), rootDir);
        this.outDir = join(process.cwd(), outDir);
        this.mainFileFormat = format;
    }

    public async compile() {

        console.log('root dir is', this.rootDir);
        await this.compileSyxFiles(this.rootDir);
        await this.compileSysFiles(this.rootDir);

    }

    public compileSyxFiles(folderPath: string) {

        const files = readdirSync(folderPath);
        log.debug('HEREHEREHERE', folderPath, files);

        files.forEach(f => {
            if (f.endsWith('.syx')) this.compileSyx(join(folderPath, f));
            else if (statSync(join(folderPath, f)).isDirectory()) this.compileSyxFiles(join(folderPath, f));
        });
    }

    public compileSyx(file: string) {
        const ast = syxparser.parseTokens(tokenizeSyx(readFileSync(file).toString()));
        const out: AnyExportable[] = [];

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

                const operatorStmtExport: Operator = { imports: {}, outputGenerators: {}, regexMatcher, type: ExportType.Operator };

                //# Handle statements
                operatorStmt.body.forEach(stmt => {
                    if (stmt.type === NodeType.Compile) {
                        const compileStmt = stmt as CompileStatement;

                        compileStmt.formats.forEach(frmt => {
                            if (operatorStmtExport.outputGenerators[frmt] !== undefined) log.exit.error(`Duplicate file format at compile statement \'${frmt}\'`);

                            operatorStmtExport.outputGenerators[frmt] = (src) => {
                                let out = '';

                                log.debug(src);
                                compileStmt.body.forEach(e => {
                                    if (e.type === NodeType.String) {out += e.value;log.debug(e);}
                                    else if (e.type === NodeType.Variable) {
                                        const varExpr = e as VariableExpression;
                                        const v = src.match(new RegExp(regexes[varExpr.value].source,'g'))[varExpr.index];
                                        log.debug(src.match(new RegExp(regexes[varExpr.value].source,'g')));
                                        
                                        if (v === undefined) log.exit.error('Unknown statement/expression.');
                                        out += v;
                                    } else if (e.type === NodeType.WhitespaceIdentifier) out += ' ';
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

    public compileSysFiles(folderPath: string) {
        const files = readdirSync(folderPath);
        log.debug('HEREHEREHERE', folderPath, files);

        files.forEach(f => {
            if (f.endsWith('.sys')) this.compileSys(join(folderPath, f));
            else if (statSync(join(folderPath, f)).isDirectory()) this.compileSysFiles(join(folderPath, f));
        });
    }

    public compileSys(file: string) {
        const ast = sysparser.parseTokens(tokenizeSys(readFileSync(file).toString()));

        //# Handle import statements 
        var imported: AnyExportable[] = [];
        ast.body.forEach(stmt => {
            if (stmt.type == NodeType.Import) {
                const importStmt = stmt as ImportStatement;

                const pathToImport = join(dirname(file), importStmt.path.endsWith('.syx') ? importStmt.path : importStmt.path + '.syx');
                if (!existsSync(pathToImport)) log.exit.error(`File \'${pathToImport}\' from \'${file}\' does not exist.`);
                this.exportData[pathToImport].forEach(exported => {
                    if (imported.some(i => exported.regexMatcher === i.regexMatcher)) log.exit.error(`There are more than one operators with the same syntax imported to \'${file}\'.`);
                    imported.push(exported);
                });
            }
        });

        //# Get the actual file content to compile 
        const src = readFileSync(file).toString().split('');

        while (src.length > 0 && `${src[0]}${src[1]}${src[2]}` !== ':::') {
            src.shift();
        }
        src.shift();
        src.shift();
        src.shift();

        let fileContent = src.join('');
        const imports = [];

        //# Compile
        imported.forEach(i => {

            if (i.type === ExportType.Operator) {
                if (i.outputGenerators[this.mainFileFormat] === undefined) log.exit.error(`Can't compile operator to target language (${this.mainFileFormat}).`);
                log.debug(i.regexMatcher);
                fileContent = fileContent.replace(new RegExp(i.regexMatcher.source, 'g'), i.outputGenerators[this.mainFileFormat]);

                if(i.imports[this.mainFileFormat]!==undefined&&!imports.includes(i.imports[this.mainFileFormat])) imports.push(i.imports[this.mainFileFormat]); 
            }

        });

        writeFileSync(file.replace(this.rootDir, this.outDir).replace(/\.[^/.]+$/, '') + '.' + this.mainFileFormat, imports.map(i=>`import ${i}`).join('\n')+'\n'+fileContent);

    }

}

export enum ExportType {
    Operator
}

export interface Export {
    type: ExportType;
}

export interface Operator extends Export {
    type: ExportType.Operator,
    regexMatcher: RegExp;
    outputGenerators: Record<string, OneParameterMethod<string, string>>;
    imports: Record<string, string>;
}

export type OneParameterMethod<V, R> = (v: V) => R;
export type ReturnerMethod<R> = () => R;

export type AnyExportable = Operator;

export const regexes: Record<string, RegExp> = {
    int: /([0-9]+)/,
    string: /('[\u0000-\uffff]*'|"[\u0000-\uffff]*")/,
    boolean: /(true|false)/,
    '+s': /\s*/
};

export function escapeRegex(src: string): string {
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}