import { log } from '../log.js';
import { BraceExpression, CompileStatement, Expression, FunctionStatement, ImportsStatement, Node, NodeType, OperatorStatement, PrimitiveTypeExpression, ProgramStatement, StringExpression, Token, TokenType, VariableExpression } from './types.js';

export namespace syxparser {

    let tokens: Token[];

    function canGo(): boolean {
        return tokens[0].type !== TokenType.EndOfFile;
    }

    let program: ProgramStatement;

    let watchMode: boolean;

    export function parseTokens(t: Token[], watch: boolean): ProgramStatement {
        tokens = t;
        watchMode = watch;

        program = { body: [], type: NodeType.Program };

        while (canGo()) {
            log.debug(JSON.stringify(tokens[0]));
            parseStatement();
        }

        return program;

    }

    function at(i: number = 0): Token {
        return tokens[i];
    }

    const exportable = [NodeType.Operator, NodeType.Function, NodeType.Keyword];

    export function parseStatement(put: boolean = true): Node {
        if (keywords.includes(at().type)) {
            const tt = at().type;
            tokens.shift();

            if (tt == TokenType.ImportKeyword) {
                const ex = parseExpression(false, false);
                if (ex.type !== NodeType.String) (watchMode ? log.thrower : log.exit).error('Expected string after import statement.');
                return node({ type: NodeType.Import, path: (ex as Expression).value }, put);
            } else if (tt == TokenType.OperatorKeyword) {
                const statement: OperatorStatement = { type: NodeType.Operator, regex: [], body: [] };


                while (at().type !== TokenType.OpenBrace) {
                    statement.regex.push(parseExpression(false));
                }

                const braceExpr = parseExpression(false) as BraceExpression;

                if (braceExpr.body.some(r => r.type == NodeType.Operator || r.type == NodeType.Import || r.type == NodeType.Export)) (watchMode ? log.thrower : log.exit).error('Statement not allowed.');

                statement.body = braceExpr.body;

                return node(statement, put);
            } else if (tt == TokenType.CompileKeyword) {
                const statement: CompileStatement = { type: NodeType.Compile, formats: [], body: [] };

                log.debug(at());
                if (at().type != TokenType.OpenParen) (watchMode ? log.thrower : log.exit).error('Expected parens after \'compile\' statement.');

                tokens.shift(); // skip OpenParen
                while (at().type != TokenType.CloseParen) {
                    const t = tokens.shift();

                    if (t.type == TokenType.Comma && at().type != TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after comma.');
                    else if (t.type == TokenType.Comma && statement.formats.length == 0) (watchMode ? log.thrower : log.exit).error('Can\'t start with comma.');
                    else if (t.type == TokenType.Comma) { }
                    else if (t.type == TokenType.Identifier) statement.formats.push(t.value);
                    else { log.debug(t); (watchMode ? log.thrower : log.exit).error('Unexpected token.'); }
                }
                tokens.shift(); // skip CloseParen

                while (at().type != TokenType.Semicolon) {
                    statement.body.push(parseExpression(false, false) as Expression);
                }
                tokens.shift(); // skip Semicolon

                return node(statement, put);
            } else if (tt == TokenType.ExportKeyword) {
                const stmt = parseStatement(false);
                if (!exportable.includes(stmt.type)) (watchMode ? log.thrower : log.exit).error('Expected exportable statement after export.');
                return node({ type: NodeType.Export, body: stmt }, put);
            } else if (tt == TokenType.ImportsKeyword) {
                const statement: ImportsStatement = { type: NodeType.Imports, formats: [], module: '' };

                log.debug(at());
                if (at().type != TokenType.OpenParen) (watchMode ? log.thrower : log.exit).error('Expected parens after \'imports\' statement.');

                tokens.shift(); // skip OpenParen
                while (at().type != TokenType.CloseParen) {
                    const t = tokens.shift();

                    if (t.type == TokenType.Comma && at().type != TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after comma.');
                    else if (t.type == TokenType.Comma && statement.formats.length == 0) (watchMode ? log.thrower : log.exit).error('Can\'t start with comma.');
                    else if (t.type == TokenType.Comma) { }
                    else if (t.type == TokenType.Identifier) statement.formats.push(t.value);
                    else { log.debug(t); (watchMode ? log.thrower : log.exit).error('Unexpected token.'); }
                }
                tokens.shift(); // skip CloseParen

                const moduleExpr = parseExpression(false, false);

                if (moduleExpr.type !== NodeType.String) (watchMode ? log.thrower : log.exit).error('Expected string after parens of imports statement.');

                statement.module = (moduleExpr as StringExpression).value;

                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected \';\' after imports statement.');
                tokens.shift();

                return node(statement, put);
            } else if (tt == TokenType.FunctionKeyword) {
                const statement: FunctionStatement = { type: NodeType.Function, arguments: [], name: '', body: [] };

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
                    statement.body.push(parseStatement(false));
                }
                tokens.shift();

                return node(statement, put);
            } else if (tt == TokenType.KeywordKeyword) {
                const ex = parseExpression(false, false, true);
                if (ex.type !== NodeType.String) { (watchMode ? log.thrower : log.exit).error('Expected identifier after keyword statement.'); return; }
                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after statement.');
                tokens.shift(); // skip semicolon
                return node({ type: NodeType.Keyword, word: ex.value }, put);
            }

        }
        else parseExpression();
    }

    function node(node: Node, put: boolean) {
        if (put) program.body.push(node);
        return node;
    }

    export function parseExpression(put: boolean = true, statements: boolean = true, expectIdentifier: boolean = false): Node {
        const tt = at().type;
        log.debug(`Parsing expr ${tt}`);

        if (tt == TokenType.SingleQuote) {
            let s = '';

            tokens.shift();
            while (at().type != TokenType.SingleQuote) {
                s += tokens.shift().value;
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s }, put);

        } else if (tt == TokenType.DoubleQuote) {
            let s = '';

            tokens.shift();
            while (at().type != TokenType.DoubleQuote) {
                s += tokens.shift().value;
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s }, put);

        } else if (tt == TokenType.OpenDiamond) {

            const newToken = at(1);
            if (newToken.type !== TokenType.Identifier) (watchMode ? log.thrower : log.exit).error('Expected identifier after \'<\'.');
            if (!newToken.value.match(primitiveTypes)) (watchMode ? log.thrower : log.exit).error(`Expected primitive type, found '${newToken.value}'`);
            if (at(2).type !== TokenType.CloseDiamond) (watchMode ? log.thrower : log.exit).error(`Expected '>' after primitive type, found '${at(2).value}'`);
            tokens.shift();
            tokens.shift();
            tokens.shift();

            return node({ type: NodeType.PrimitiveType, value: newToken.value }, put);
        } else if (tt == TokenType.WhitespaceIdentifier) {
            tokens.shift();
            return node({ type: NodeType.WhitespaceIdentifier, value: '+s' }, put);
        } else if (tt == TokenType.OpenBrace) {
            tokens.shift();

            const expr: BraceExpression = { type: NodeType.Brace, body: [], value: '{' };

            while (at().type != TokenType.CloseBrace) {
                expr.body.push(parseStatement(false));
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt == TokenType.OpenParen) {
            tokens.shift();

            const expr: BraceExpression = { type: NodeType.Brace, body: [], value: '(' };

            while (at().type != TokenType.OpenParen) {
                expr.body.push(parseStatement(false));
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt == TokenType.OpenSquare) {
            tokens.shift();

            const expr: BraceExpression = { type: NodeType.Brace, body: [], value: '[' };

            while (at().type != TokenType.CloseSquare) {
                expr.body.push(parseStatement(false));
            }
            tokens.shift();
            return node(expr, put);

        } else if (tt == TokenType.Identifier && at(1).type == TokenType.VarSeperator) {

            if (at(2).type != TokenType.IntNumber) (watchMode ? log.thrower : log.exit).error(`Expected index after variable '${at().value}|'`);

            const expr: VariableExpression = { index: parseInt(at(2).value), type: NodeType.Variable, value: at().value };
            tokens.shift(); // id
            tokens.shift(); // sep
            tokens.shift(); // index
            return node(expr, put);
        } else if (keywords.includes(tt)) {
            if (!statements) (watchMode ? log.thrower : log.exit).error('Unexpected statement.');
            return parseStatement();
        } else if (tt == TokenType.Identifier && expectIdentifier) {
            return node({ type: NodeType.String, value: tokens.shift().value }, put);
        }
        else (watchMode ? log.thrower : log.exit).error(`Unexpected expression: '${at().value}'`);


    }

    const primitiveTypes = /^(int|string|boolean|decimal)$/;

    const keywords = [TokenType.ImportKeyword, TokenType.ExportKeyword, TokenType.CompileKeyword, TokenType.OperatorKeyword, TokenType.ImportsKeyword, TokenType.GlobalKeyword, TokenType.FunctionKeyword, TokenType.KeywordKeyword];

}



export namespace sysparser {

    let tokens: Token[];

    function canGo(): boolean {
        return tokens[0].type !== TokenType.EndOfFile;
    }

    let program: ProgramStatement;
    let watchMode: boolean;

    export function parseTokens(t: Token[], watch: boolean): ProgramStatement {
        tokens = t;
        watchMode = watch;

        program = { body: [], type: NodeType.Program };

        while (canGo()) {
            log.debug(tokens[0]);
            parseStatement();
        }

        return program;

    }

    function at(i: number = 0): Token {
        return tokens[i];
    }


    export function parseStatement(put: boolean = true): Node {
        if (keywords.includes(at().type)) {
            const tt = at().type;
            tokens.shift();

            if (tt == TokenType.ImportKeyword) {
                const ex = parseExpression(false);
                if (ex.type !== NodeType.String) (watchMode ? log.thrower : log.exit).error('Expected string after import statement.');
                if (at().type !== TokenType.Semicolon) (watchMode ? log.thrower : log.exit).error('Expected semicolon after import statement.');
                tokens.shift();
                return node({ type: NodeType.Import, path: (ex as Expression).value }, put);
            }

        }
        else parseExpression();
    }

    function node(node: Node, put: boolean) {
        if (put) program.body.push(node);
        return node;
    }

    export function parseExpression(put: boolean = true, statements: boolean = true): Node {
        const tt = at().type;
        log.debug(`Parsing expr ${tt}`);

        if (tt == TokenType.SingleQuote) {
            let s = '';

            tokens.shift();
            while (at().type != TokenType.SingleQuote) {
                s += tokens.shift().value;
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s }, put);

        } else if (tt == TokenType.DoubleQuote) {
            let s = '';

            tokens.shift();
            while (at().type != TokenType.DoubleQuote) {
                s += tokens.shift().value;
            }
            tokens.shift();
            return node({ type: NodeType.String, value: s }, put);

        } else if (keywords.includes(tt)) {
            if (!statements) (watchMode ? log.thrower : log.exit).error('Unexpected statement.');
            return parseStatement();
        }
        else (watchMode ? log.thrower : log.exit).error(`Unexpected expression: '${at().value}'`);


    }

    const keywords = [TokenType.ImportKeyword];

}
