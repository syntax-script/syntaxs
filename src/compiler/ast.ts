import { log } from '../log.js';
import { BraceExpression, Expression, Node, NodeType, OperatorStatement, ProgramStatement, Token, TokenType } from './types.js';

export namespace parser {

    let tokens: Token[];

    function canGo(): boolean {
        return tokens[0].type !== TokenType.EndOfFile;
    }

    let program: ProgramStatement;

    export function parseTokens(t: Token[]): ProgramStatement {
        tokens = t;

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

    export function parseStatement(put: boolean = true): Node {
        if (keywords.includes(at().type)) {
            const tt = at().type;
            tokens.shift();

            if (tt == TokenType.ImportKeyword) {
                const ex = parseExpression(false);
                if (ex.type !== NodeType.String) log.exit.error('Expected string after import statement.');
                return node({ type: NodeType.Import, path: (ex as Expression).value }, put);
            } else if (tt == TokenType.OperatorKeyword) {
                const statement: OperatorStatement = { type: NodeType.Operator, regex: [], body: [] };
                
                
                while (at().type!==TokenType.OpenBrace) {
                    statement.regex.push(parseExpression(false));
                }

                const braceExpr = parseExpression(false) as BraceExpression;

                statement.body = braceExpr.body;

                return node(statement, put);
            }

        }
        else parseExpression();
    }

    function node(node: Node, put: boolean) {
        if (put) program.body.push(node);
        return node;
    }

    export function parseExpression(put: boolean = true): Node {
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
            if (newToken.type !== TokenType.Identifier) log.exit.error('Expected identifier after \'<\'.');
            if (!newToken.value.match(primitiveTypes)) log.exit.error(`Expected primitive type, found '${newToken.value}'`);
            if (at(2).type !== TokenType.CloseDiamond) log.exit.error(`Expected '>' after primitive type, found '${at(2).value}'`);
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

        }
        else if (keywords.includes(tt)) { return parseStatement(); } // skip keywords for statements
        else log.exit.error(`Unexpected expression: '${at().value}'`);


    }

    const primitiveTypes = /^(int|string|array|boolean)$/;

    const keywords = [TokenType.ImportKeyword, TokenType.ExportKeyword, TokenType.CompileKeyword, TokenType.OperatorKeyword];

}
