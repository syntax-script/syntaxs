import { CompileStatement, ExportStatement, FunctionStatement, ImportStatement, ImportsStatement, KeywordStatement, NodeType, OperatorStatement, PrimitiveTypeExpression, StringExpression, VariableExpression } from './types.js';
import { dirname, join } from 'path';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { sysparser, syxparser } from './ast.js';
import { tokenizeSys, tokenizeSyx } from './lexer.js';
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
    private readonly watchMode: boolean;

    /**
     * Stores exports for every .syx file.
     */
    public readonly exportData: Record<string, AnyExportable[]> = {};

    constructor(rootDir: string, outDir: string, format: string, watch: boolean = false) {
        this.rootDir = join(process.cwd(), rootDir);
        this.outDir = join(process.cwd(), outDir);
        this.mainFileFormat = format;
        this.watchMode = watch;
    }

    public async compile() {

        await this.compileSyxFiles(this.rootDir);
        await this.compileSysFiles(this.rootDir);
        return Promise.resolve();
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
        const ast = syxparser.parseTokens(tokenizeSyx(readFileSync(file).toString(), this.watchMode), this.watchMode);
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
                            if (operatorStmtExport.outputGenerators[frmt] !== undefined) (this.watchMode ? log.thrower : log.exit).error(`Duplicate file format at compile statement \'${frmt}\'`);

                            operatorStmtExport.outputGenerators[frmt] = (src) => {
                                let out = '';

                                log.debug(src);
                                compileStmt.body.forEach(e => {
                                    if (e.type === NodeType.String) { out += e.value; log.debug(e); }
                                    else if (e.type === NodeType.Variable) {
                                        const varExpr = e as VariableExpression;
                                        const v = src.match(new RegExp(regexes[varExpr.value].source, 'g'))[varExpr.index];
                                        log.debug(src.match(new RegExp(regexes[varExpr.value].source, 'g')));

                                        if (v === undefined) (this.watchMode ? log.thrower : log.exit).error('Unknown statement/expression.');
                                        out += v;
                                    } else if (e.type === NodeType.WhitespaceIdentifier) out += ' ';
                                });

                                return out;
                            };

                        });

                    } else if (stmt.type === NodeType.Imports) {
                        const importStmt = stmt as ImportsStatement;

                        importStmt.formats.forEach(frmt => {
                            if (operatorStmtExport.imports[frmt] !== undefined) (this.watchMode ? log.thrower : log.exit).error(`Duplicate file format at imports statement \'${frmt}\'`);
                            operatorStmtExport.imports[frmt] = importStmt.module;
                        });

                    } else (this.watchMode ? log.thrower : log.exit).error(`Unexpected \'${stmt.type}\' statement insdie operator statement.`);
                });

                out.push(operatorStmtExport);
            } else if (exported.type === NodeType.Function) {
                const stmt = exported as FunctionStatement;
                const statementExport: Function = { type: ExportType.Function, args: stmt.arguments.map(s => regexes[s]), name: stmt.name, formatNames: {}, imports: {} };

                stmt.body.forEach(statement => {

                    if (statement.type === NodeType.Compile) {
                        const compileStatement = statement as CompileStatement;
                        if (compileStatement.body[0].type !== NodeType.String) (this.watchMode ? log.thrower : log.exit).error('Expected a string after compile statement parens');
                        compileStatement.formats.forEach(each => {
                            if (statementExport.formatNames[each] !== undefined) (this.watchMode ? log.thrower : log.exit).error(`Encountered multiple compile statements for target language '${each}'`);
                            statementExport.formatNames[each] = compileStatement.body[0].value;
                        });
                    } else if (statement.type === NodeType.Imports) {
                        const importsStatement = statement as ImportsStatement;
                        importsStatement.formats.forEach(each => {
                            if (statementExport.imports[each] !== undefined) (this.watchMode ? log.thrower : log.exit).error(`Encountered multiple import statements for target language '${each}'`);
                            statementExport.imports[each] = importsStatement.module;
                        });
                    }

                });


                out.push(statementExport);
            } else if (exported.type === NodeType.Keyword) {
                const stmt = exported as KeywordStatement;

                out.push({ type: ExportType.Keyword, word: stmt.word });
            } else (this.watchMode ? log.thrower : log.exit).error(`Unexpected \'${statement.type}\' statement after export statement.`);

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
        const ast = sysparser.parseTokens(tokenizeSys(readFileSync(file).toString()), this.watchMode);

        //# Handle import statements 
        var imported: AnyExportable[] = [];
        ast.body.forEach(stmt => {
            if (stmt.type == NodeType.Import) {
                const importStmt = stmt as ImportStatement;

                const pathToImport = join(dirname(file), importStmt.path.endsWith('.syx') ? importStmt.path : importStmt.path + '.syx');
                if (!existsSync(pathToImport)) (this.watchMode ? log.thrower : log.exit).error(`File \'${pathToImport}\' from \'${file}\' does not exist.`);
                this.exportData[pathToImport].forEach(exported => {
                    if (exported.type === ExportType.Operator)
                        if (imported.filter(r => r.type === ExportType.Operator).some(i => exported.regexMatcher === (i as Operator).regexMatcher)) (this.watchMode ? log.thrower : log.exit).error(`There are more than one operators with the same syntax imported to \'${file}\'.`);
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
                if (i.outputGenerators[this.mainFileFormat] === undefined) (this.watchMode ? log.thrower : log.exit).error(`Can't compile operator to target language (${this.mainFileFormat}).`);
                log.debug(i.regexMatcher);
                fileContent = fileContent.replace(new RegExp(i.regexMatcher.source, 'g'), i.outputGenerators[this.mainFileFormat]);

                if (i.imports[this.mainFileFormat] !== undefined && !imports.includes(i.imports[this.mainFileFormat])) imports.push(i.imports[this.mainFileFormat]);
            } else if (i.type === ExportType.Function) {
                if (i.formatNames[this.mainFileFormat] === undefined) (this.watchMode ? log.thrower : log.exit).error(`Can't compile function to target language (${this.mainFileFormat}).`);
                log.debug(i);
                fileContent = fileContent.replace(new RegExp(i.name + '\\(' + i.args.map(m => m.source).join(',') + '\\)', 'g'), (m) => m.replace(i.name, i.formatNames[this.mainFileFormat]));
            }

        });

        writeFileSync(file.replace(this.rootDir, this.outDir).replace(/\.[^/.]+$/, '') + '.' + this.mainFileFormat, imports.map(i => `import ${i}`).join('\n') + '\n' + fileContent);

    }

}

export enum ExportType {
    Operator,
    Function,
    Keyword
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

export interface Function extends Export {
    type: ExportType.Function;
    name: string;
    args: RegExp[];
    formatNames: Record<string, string>;
    imports: Record<string, string>;
}

export interface Keyword extends Export {
    type: ExportType.Keyword;
    word: string;
}

export type OneParameterMethod<V, R> = (v: V) => R;
export type ReturnerMethod<R> = () => R;

export type AnyExportable = Operator | Function | Keyword;

export const regexes: Record<string, RegExp> = {
    int: /([0-9]+)/,
    string: /('[\u0000-\uffff]*'|"[\u0000-\uffff]*")/,
    boolean: /(true|false)/,
    decimal: /([0-9]+(\.[0-9]+)?)/,
    '+s': /\s*/
};

export function escapeRegex(src: string): string {
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}