import { log } from '../log.js';
import { Token, TokenType } from './types.js';

const keywords: Record<string, TokenType> = {
    operator: TokenType.OperatorKeyword,
    compile: TokenType.CompileKeyword,
    import: TokenType.ImportKeyword,
    imports: TokenType.ImportsKeyword,
    export: TokenType.ExportKeyword,
    global: TokenType.GlobalKeyword,
    class: TokenType.ClassKeyword,
    function: TokenType.FunctionKeyword
};

/**
 * Characters that can be lexed into a token if used with '+'.
 * @example +s will mean WhitespaceIdentifier.
 */
const chars = ['s'];

function isAlphabetic(src: string) {
    return src.match(/^[a-zA-Z]+$/);
}

function isSkippable(src: string) {
    return src.match(/\s|\\n|\\t/);
}

function isInt(src: string) {
    return src.match(/^[0-9]+$/);
}

export function tokenizeSyx(source: string): Token[] {
    const tokens: Token[] = [];
    const src = source.split('');

    while (src.length > 0) {
        if (!isSkippable(src[0])) log.debug(`Parsing token: '${src[0]}'`);
        if (src[0] == '(') tokens.push({ type: TokenType.OpenParen, value: src.shift() });
        else if (src[0] == ')') tokens.push({ type: TokenType.CloseParen, value: src.shift() });
        else if (src[0] == '{') tokens.push({ type: TokenType.OpenBrace, value: src.shift() });
        else if (src[0] == '}') tokens.push({ type: TokenType.CloseBrace, value: src.shift() });
        else if (src[0] == '[') tokens.push({ type: TokenType.OpenSquare, value: src.shift() });
        else if (src[0] == ']') tokens.push({ type: TokenType.CloseSquare, value: src.shift() });
        else if (src[0] == ',') tokens.push({ type: TokenType.Comma, value: src.shift() });
        else if (src[0] == ';') tokens.push({ type: TokenType.Semicolon, value: src.shift() });
        else if (src[0] == '<') tokens.push({ type: TokenType.OpenDiamond, value: src.shift() });
        else if (src[0] == '>') tokens.push({ type: TokenType.CloseDiamond, value: src.shift() });
        else if (src[0] == '\'') tokens.push({ type: TokenType.SingleQuote, value: src.shift() });
        else if (src[0] == '"') tokens.push({ type: TokenType.DoubleQuote, value: src.shift() });
        else if (src[0] == '|') tokens.push({ type: TokenType.VarSeperator, value: src.shift() });
        else if (src[0] == '+' && chars.includes(src[1])) {
            if (src[1] === 's') tokens.push({ type: TokenType.WhitespaceIdentifier, value: '+s' });
            else log.exit.error(`Unexpected identifier: '${src[1]}'`);
            src.shift(); src.shift();
        } else if (isInt(src[0])) {
            log.debug('Found int number');
            let ident = '';
            while (src.length > 0 && isInt(src[0])) {
                ident += src.shift();
            }

            tokens.push({ type: TokenType.IntNumber, value: ident });
        } else if (isAlphabetic(src[0])) {
            log.debug('Found identifier');
            let ident = '';
            while (src.length > 0 && isAlphabetic(src[0])) {
                ident += src.shift();
            }

            const reserved = keywords[ident];
            if (reserved !== undefined) log.debug(`Found keyword: '${reserved}'`);
            tokens.push({ type: reserved ?? TokenType.Identifier, value: ident });
        } else if (isSkippable(src[0])) { log.debug('Found skippable char'); src.shift(); }
        else tokens.push({ type: TokenType.Raw, value: src.shift() });
    }

    tokens.push({ type: TokenType.EndOfFile, value: 'EOF' });
    return tokens;
}