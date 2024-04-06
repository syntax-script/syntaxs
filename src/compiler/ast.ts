import { BraceExpression, CompileStatement, ExportStatement, Expression, FunctionStatement, ImportsStatement, KeywordStatement, Node, NodeType, OperatorStatement, ParenExpression, PrimitiveTypeExpression, ProgramStatement, SquareExpression, StringExpression, Token, TokenType, VariableExpression } from './types.js';
import { log } from '../log.js';

const valueTypeDefinitions = {
    boolean: { value: 'boolean', regex: /^(true|false)$/ },
    keyword: { value: 'keyword' }
};

export const SyxRuleRegistry: Record<string, { value: string, regex?: RegExp; }> = {

    /**
     * Determines whether it is possible to return a value using functons.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    'function-value-return-enabled': valueTypeDefinitions.boolean,

    /**
     * Determines the keyword that should be used to return values from a function, similiar to `return` keyword
     * from popular languages such as ts,js,py,java etc.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    'function-value-return-keyword': valueTypeDefinitions.keyword
};


export namespace syxparser {

    let tokens: Token[];

    /**
     * Determintes whether the parser can keep parsing tokens.
     * @returns Whether there is a token left.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function canGo(): boolean {
        return tokens[0].type !== TokenType.EndOfFile;
    }

    let program: ProgramStatement;

    let watchMode: boolean;

    /**
     * Parses the token list given into statements and expressions.
     * @param t Token list to parse.
     * @param watch Whether is it watch mode or not. Errors will exit process if it isn't watch mode, throwing an error otherwise.
     * @returns Main {@link ProgramStatement} containing all other statements.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function parseTokens(t: Token[], watch: boolean): ProgramStatement {
        tokens = t;
        watchMode = watch;

        const eof = t.find(r => r.type === TokenType.EndOfFile);
        program = { body: [], type: NodeType.Program, pos: 0, end: eof.end };


        while (canGo()) {
            log.debug(JSON.stringify(tokens[0]));
            parseStatement();
        }

        return program;

    }

    /**
     * Returns the token at given index. Alias for `tokens[i]`.
     * @param i Token index. Defaults to 0.
     * @returns The token at given index.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function at(i: number = 0): Token {
        return tokens[i];
    }

    const exportable = [NodeType.Operator, NodeType.Function, NodeType.Keyword];

    /**
     * Parses a statement from the most recent token. Will call {@link parseExpression} if no statement is present.
     * @param put Whether the result should be added to the program statement.
     * @returns A node that is either a statement or an expression if a statement wasn't present.
     * @author efekos
     * @version 1.0.1
     * @since 0.0.1-alpha
     */
    export function parseStatement(put: boolean = true): Node {
        if (keywords.includes(at().type)) {
            const token = at();
            tokens.shift();

            if (token.type === TokenType.ImportKeyword) {

                const ex = parseExpression(false, false);
                if (ex.type !== NodeType.String) (watchMode ? log.thrower : log.exit).error('Expected string after import statement.');
                return node({ type: NodeType.Import, path: (ex as Expression).value ,pos:token.pos,end:ex.end}, put);

            } else if (token.type === TokenType.OperatorKeyword) {
                const statement: OperatorStatement = { type: NodeType.Operator, regex: [], body: [],pos:token.pos,end:token.end };


                while (at().type !== TokenType.OpenBrace) {
                    const ex = parseExpression(false);
                    statement.regex.push(ex);
                    statement.end = ex.end;
                }

                const braceExpr = parseExpression(false) as BraceExpression;

                if (braceExpr.body.some(r => r.type === NodeType.Operator || r.type === NodeType.Import || r.type === NodeType.Export)) (watchMode ? log.thrower : log.exit).error('Statement not allowed.');

                statement.body = braceExpr.body;

                return node(statement, put);
            } else if (token.type === TokenType.CompileKeyword) {
                const statement: CompileStatement = { type: NodeType.Compile, formats: [], body: [], pos:token.pos, end:token.pos+3 };

                log.debug(at());
                if (at().type !== TokenType.OpenParen) (watchMode ? log.thrower : log.exit).error('Expected parens after \'compile\' statement.');

                tokens.shift(); // skip OpenParen
                while (at().type !== TokenType.CloseParen) {
                    const t = tokens.shift();

                    if (t.type === TokenType.Comma && at().type !== TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after comma.');
                    else if (t.type === TokenType.Comma && statement.formats.length === 0) (watchMode ? log.thrower : log.exit).error('Can\'t start with comma.');
                    else if (t.type === TokenType.Comma) statement.end++;
                    else if (t.type === TokenType.Identifier) {statement.formats.push(t.value);statement.end+=t.value.length;}
                    else { log.debug(t); (watchMode ? log.thrower : log.exit).error('Unexpected token.'); }
                }
                tokens.shift(); // skip CloseParen

                while (at().type !== TokenType.Semicolon) {
                    const ex = parseExpression(false, false);
                    statement.body.push(ex as Expression);
                    statement.end += (ex.end-ex.pos);
                }
                tokens.shift(); // skip Semicolon

                return node(statement, put);
            } else if (token.type === TokenType.ExportKeyword) {
                const stmt = parseStatement(false);
                if (!exportable.includes(stmt.type)) (watchMode ? log.thrower : log.exit).error('Expected exportable statement after export.');
                return node({ type: NodeType.Export, body: stmt,pos:token.pos,end:stmt.end }, put);
            } else if (token.type === TokenType.ImportsKeyword) {
                const statement: ImportsStatement = { type: NodeType.Imports, formats: [], module: '', pos:token.pos,end:token.end+3 };

                log.debug(at());
                if (at().type !== TokenType.OpenParen) (watchMode ? log.thrower : log.exit).error('Expected parens after \'imports\' statement.');

                tokens.shift(); // skip OpenParen
                while (at().type !== TokenType.CloseParen) {
                    const t = tokens.shift();

                    if (t.type === TokenType.Comma && at().type !== TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after comma.');
                    else if (t.type === TokenType.Comma && statement.formats.length === 0) (watchMode ? log.thrower : log.exit).error('Can\'t start with comma.');
                    else if (t.type === TokenType.Comma) { }
                    else if (t.type === TokenType.Identifier) statement.formats.push(t.value);
                    else { log.debug(t); (watchMode ? log.thrower : log.exit).error('Unexpected token.'); }
                }
                tokens.shift(); // skip CloseParen

                const moduleExpr = parseExpression(false, false);

                if (moduleExpr.type !== NodeType.String) {(watchMode ? log.thrower : log.exit).error('Expected string after parens of imports statement.');return;}

                statement.module = moduleExpr.value;
                statement.end += (moduleExpr.end-moduleExpr.pos);

                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected \';\' after imports statement.');
                tokens.shift();

                return node(statement, put);
            } else if (token.type === TokenType.FunctionKeyword) {
                const statement: FunctionStatement = { type: NodeType.Function, arguments: [], name: '', body: [],pos:token.pos,end:token.end };

                if (at().type !== TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after function statement.');
                statement.name = at().value;
                tokens.shift();

                while (at().type !== TokenType.OpenBrace) {
                    const expr = parseExpression(false, false);
                    if (expr.type !== NodeType.PrimitiveType) (watchMode ? log.thrower : log.exit).error('Expected argument types after function name.');
                    statement.arguments.push((expr as PrimitiveTypeExpression).value);
                }
                tokens.shift();

                while (at().type !== TokenType.CloseBrace) {
                    const stmt = parseStatement(false);
                    statement.body.push(stmt);
                    statement.end = stmt.end;
                }
                tokens.shift();

                return node(statement, put);
            } else if (token.type === TokenType.KeywordKeyword) {
                const ex = parseExpression(false, false, true);
                if (ex.type !== NodeType.String) { (watchMode ? log.thrower : log.exit).error('Expected identifier after keyword statement.'); return; }
                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after statement.');
                tokens.shift(); // skip semicolon
                return node({ type: NodeType.Keyword, word: ex.value,pos:token.pos,end:ex.end+1 }, put);
            } else if (token.type === TokenType.RuleKeyword) {
                const ruleExpr = parseExpression(false, false);
                if (ruleExpr.type !== NodeType.String) { (watchMode ? log.thrower : log.exit).error('Expected string after \'rule\'.'); return; }
                if (at().value !== ':') (watchMode ? log.thrower : log.exit).error('Expected \':\' after rule name.');
                tokens.shift();
                if (!(ruleExpr.value in SyxRuleRegistry)) (watchMode ? log.thrower : log.exit).error(`Unknown rule '${ruleExpr.value}'.`);
                const rule = SyxRuleRegistry[ruleExpr.value];

                if (rule.value === 'boolean') {
                    const boolEx = parseExpression(false, false, true);
                    if (!(boolEx.type === NodeType.String && rule.regex.test(boolEx.value))) { (watchMode ? log.thrower : log.exit).error('Expected boolean as rule value.'); return; }


                    if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after rule statement.');
                    tokens.shift();
                    return node({ type: NodeType.Rule, rule: ruleExpr.value, value: boolEx.value,pos:token.pos,end:boolEx.end }, put);
                } else if (rule.value === 'keyword') {
                    const keyEx = parseExpression(false, false, true);
                    if (!(
                        keyEx.type === NodeType.String &&
                        program.body.some(s =>
                            (s.type === NodeType.Keyword && (s as KeywordStatement).word === keyEx.value) ||
                            (s.type === NodeType.Export && (s as ExportStatement).body.type === NodeType.Keyword && ((s as ExportStatement).body as KeywordStatement).word === keyEx.value)
                        )
                    )) { (watchMode ? log.thrower : log.exit).error('Unknown keyword.'); return; }

                    if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after rule statement.');
                    tokens.shift();
                    return node({ type: NodeType.Rule, rule: ruleExpr.value, value: keyEx.value,pos:token.pos,end:keyEx.end }, put);
                }
            }

        }
        else parseExpression();
    }

    /**
     * An alias function to handle different cases of calling {@link parseStatement} and {@link parseExpression}.
     * @param node The node.
     * @param put Whether the node should be added to current program.
     * @returns The node.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function node<T extends Node>(node: T, put: boolean): T {
        if (put) program.body.push(node);
        return node;
    }

    /**
     * Parses the most recent expression at the token list. Goes to {@link parseStatement} if a keyword is found.
     * @param put Whether the result should be put into current program.
     * @param statements Whether statements should be allowed. Function will stop if a keyword found with this value set to `true`.
     * @param expectIdentifier Whether identifiers should be allowed. Unknown identifiers will stop the function with this value set to `false`, returning the identifier as a {@link StringExpression} otherwise.
     * @returns The parsed node.
     * @author efekos
     * @version 1.0.1
     * @since 0.0.1-alpha
     */
    export function parseExpression(put: boolean = true, statements: boolean = true, expectIdentifier: boolean = false): Node {
        const tt = at().type;
        log.debug(`Parsing expr ${tt}`);

        if (tt === TokenType.SingleQuote) {
            let s = '';
            const startPos = at().pos;
            let endPos = startPos;

            tokens.shift();
            while (at().type !== TokenType.SingleQuote) {
                const _t = tokens.shift();
                s += _t.value;
                endPos += (_t.end - _t.pos);
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s, pos: startPos, end: endPos }, put);

        } else if (tt === TokenType.DoubleQuote) {
            let s = '';

            const startPos = at().pos;
            let endPos = startPos;

            tokens.shift();
            while (at().type !== TokenType.DoubleQuote) {
                const _t = tokens.shift();
                s += _t.value;
                endPos += (_t.end - _t.pos);
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s, pos: startPos, end: endPos }, put);

        } else if (tt === TokenType.OpenDiamond) {

            const newToken = at(1);
            if (newToken.type !== TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after \'<\'.');
            if (!newToken.value.match(primitiveTypes)) (watchMode ? log.thrower : log.exit).error(`Expected primitive type, found '${newToken.value}'`);
            if (at(2).type !== TokenType.CloseDiamond) (watchMode ? log.thrower : log.exit).error(`Expected '>' after primitive type, found '${at(2).value}'`);
            tokens.shift();
            tokens.shift();
            tokens.shift();

            return node({ type: NodeType.PrimitiveType, value: newToken.value, pos:newToken.pos-1, end: newToken.end+1 }, put);
        } else if (tt === TokenType.WhitespaceIdentifier) {
            const p = tokens.shift().pos;
            return node({ type: NodeType.WhitespaceIdentifier, value: '+s', pos:p,end:p+1 }, put);
        } else if (tt === TokenType.OpenBrace) {
            const p =tokens.shift().pos;

            const expr: BraceExpression = { type: NodeType.Brace, body: [], value: '{', pos:p, end:p };

            while (at().type !== TokenType.CloseBrace) {
                const stmt = parseStatement(false);
                expr.body.push(stmt);
                expr.end += stmt.end-stmt.pos;
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt === TokenType.OpenParen) {
            tokens.shift();
            const p =tokens.shift().pos;


            const expr: ParenExpression = { type: NodeType.Paren, body: [], value: '(', pos:p,end:p };

            while (at().type !== TokenType.OpenParen) {
                const stmt = parseStatement(false);
                expr.body.push(stmt);
                expr.end += stmt.end-stmt.pos;
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt === TokenType.OpenSquare) {
            tokens.shift();
            const p =tokens.shift().pos;

            const expr: SquareExpression = { type: NodeType.Square, body: [], value: '[' ,pos:p,end:p};

            while (at().type !== TokenType.CloseSquare) {
                const stmt = parseStatement(false);
                expr.body.push(stmt);
                expr.end += stmt.end-stmt.pos;
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt === TokenType.Identifier && at(1).type === TokenType.VarSeperator) {

            if (at(2).type !== TokenType.IntNumber) (watchMode ? log.thrower : log.exit).error(`Expected index after variable '${at().value}|'`);
            
            const expr: VariableExpression = { index: parseInt(at(2).value), type: NodeType.Variable, value: at().value,pos:at().pos,end:at().end+1+(at(2).end*at(2).pos) };
            tokens.shift(); // id
            tokens.shift(); // sep
            tokens.shift(); // index
            return node(expr, put);
        } else if (keywords.includes(tt)) {
            if (!statements) (watchMode ? log.thrower : log.exit).error('Unexpected statement.');
            return parseStatement();
        } else if (tt === TokenType.Identifier && expectIdentifier) {
            const {value,pos,end} = tokens.shift();
            return node({ type: NodeType.String, value,pos,end  }, put);
        }
        else (watchMode ? log.thrower : log.exit).error(`Unexpected expression: '${at().value}'`);


    }

    const primitiveTypes = /^(int|string|boolean|decimal)$/;

    const keywords = [TokenType.ImportKeyword, TokenType.ExportKeyword, TokenType.CompileKeyword, TokenType.OperatorKeyword, TokenType.ImportsKeyword, TokenType.GlobalKeyword, TokenType.FunctionKeyword, TokenType.KeywordKeyword, TokenType.RuleKeyword];

}



export namespace sysparser {

    let tokens: Token[];

    /**
     * Determintes whether the parser can keep parsing tokens.
     * @returns Whether there is a token left.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function canGo(): boolean {
        return tokens[0].type !== TokenType.EndOfFile;
    }

    let program: ProgramStatement;
    let watchMode: boolean;

    /**
     * Parses the token list given into statements and expressions.
     * @param t Token list to parse.
     * @param watch Whether is it watch mode or not. Errors will exit process if it isn't watch mode, throwing an error otherwise.
     * @returns Main {@link ProgramStatement} containing all other statements.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function parseTokens(t: Token[], watch: boolean): ProgramStatement {
        tokens = t;
        watchMode = watch;

        const eof = t.find(r => r.type === TokenType.EndOfFile);
        program = { body: [], type: NodeType.Program, pos: 0, end: eof.end };

        while (canGo()) {
            log.debug(tokens[0]);
            parseStatement();
        }

        return program;

    }

    /**
     * Returns the token at given index. Alias for `tokens[i]`.
     * @param i Token index. Defaults to 0.
     * @returns The token at given index.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function at(i: number = 0): Token {
        return tokens[i];
    }


    /**
     * Parses a statement from the most recent token. Will call {@link parseExpression} if no statement is present.
     * @param put Whether the result should be added to the program statement.
     * @returns A node that is either a statement or an expression if a statement wasn't present.
     * @author efekos
     * @version 1.0.1
     * @since 0.0.1-alpha
     */
    export function parseStatement(put: boolean = true): Node {
        if (keywords.includes(at().type)) {
            const token = at();
            tokens.shift();

            if (token.type === TokenType.ImportKeyword) {
                const ex = parseExpression(false);
                if (ex.type !== NodeType.String) (watchMode ? log.thrower : log.exit).error('Expected string after import statement.');
                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after import statement.');
                tokens.shift();
                return node({ type: NodeType.Import, path: (ex as Expression).value,pos:token.pos,end:ex.end }, put);
            }

        }
        else parseExpression();
    }

    /**
     * An alias function to handle different cases of calling {@link parseStatement} and {@link parseExpression}.
     * @param node The node.
     * @param put Whether the node should be added to current program.
     * @returns The node.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    function node(node: Node, put: boolean) {
        if (put) program.body.push(node);
        return node;
    }

    /**
     * Parses the most recent expression at the token list. Goes to {@link parseStatement} if a keyword is found.
     * @param put Whether the result should be put into current program.
     * @param statements Whether statements should be allowed. Function will stop if a keyword found with this value set to `true`.
     * @param expectIdentifier Whether identifiers should be allowed. Unknown identifiers will stop the function with this value set to `false`, returning the identifier as a {@link StringExpression} otherwise.
     * @returns The parsed node.
     * @author efekos
     * @version 1.0.1
     * @since 0.0.1-alpha
     */
    export function parseExpression(put: boolean = true, statements: boolean = true): Node {
        const tt = at().type;
        log.debug(`Parsing expr ${tt}`);

        if (tt === TokenType.SingleQuote) {
            let s = '';
            const startPos = at().pos;
            let endPos = startPos;

            tokens.shift();
            while (at().type !== TokenType.SingleQuote) {
                const _t = tokens.shift();
                s += _t.value;
                endPos += (_t.end - _t.pos);
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s, pos: startPos, end: endPos }, put);

        } else if (tt === TokenType.DoubleQuote) {
            let s = '';

            const startPos = at().pos;
            let endPos = startPos;

            tokens.shift();
            while (at().type !== TokenType.DoubleQuote) {
                const _t = tokens.shift();
                s += _t.value;
                endPos += (_t.end - _t.pos);
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s, pos: startPos, end: endPos }, put);

        } else if (keywords.includes(tt)) {
            if (!statements) (watchMode ? log.thrower : log.exit).error('Unexpected statement.');
            return parseStatement();
        }
        else (watchMode ? log.thrower : log.exit).error(`Unexpected expression: '${at().value}'`);


    }

    const keywords = [TokenType.ImportKeyword];

}
