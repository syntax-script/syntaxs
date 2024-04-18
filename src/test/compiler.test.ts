import { KeywordStatement, TokenType, syxparser, tokenizeSys, tokenizeSyx } from '@syntaxs/compiler';
import { describe, it } from 'es-test/lib/testRunner.js';
import { expect } from 'chai';

describe('Compiler module',()=>{

    const tokens = tokenizeSyx('keyword hello;');

    it('should provide correct ranges',()=>{
       
        const r = tokens[0].range;

        expect(r).to.have.property('start').to.be.a('object');
        expect(r).to.have.property('end').to.be.a('object');
        expect(r.start).to.have.property('line').to.be.a('number');
        expect(r.start).to.have.property('character').to.be.a('number');
        expect(r.end).to.have.property('character').to.be.a('number');
        expect(r.end).to.have.property('line').to.be.a('number');
        expect(r).to.deep.equal({end:{line:1,character:7},start:{line:1,character:0}});

    });

    it('should provide correct tokenization',()=>{
        const t = tokenizeSyx('class } > ) ] , compile " export function global random import imports 1 keyword { < ( [ operator * rule ; \' | +s');
        const tList = [
            TokenType.ClassKeyword,TokenType.CloseBrace,TokenType.CloseDiamond,TokenType.CloseParen,TokenType.CloseSquare,TokenType.Comma,TokenType.CompileKeyword,TokenType.DoubleQuote,
            TokenType.ExportKeyword,TokenType.FunctionKeyword,TokenType.GlobalKeyword,TokenType.Identifier,TokenType.ImportKeyword,TokenType.ImportsKeyword,TokenType.IntNumber,TokenType.KeywordKeyword,
            TokenType.OpenBrace,TokenType.OpenDiamond,TokenType.OpenParen,TokenType.OpenSquare,TokenType.OperatorKeyword,TokenType.Raw,TokenType.RuleKeyword,TokenType.Semicolon,TokenType.SingleQuote,
            TokenType.VarSeperator,TokenType.WhitespaceIdentifier,TokenType.EndOfFile
        ];

        expect(t).to.be.a('array');
        expect(t).to.have.lengthOf(tList.length);
        expect(t.map(tt=>tt.type)).to.be.deep.equal(tList);

        const sys = tokenizeSys('import \' " ; :::');
        const sysList = [TokenType.ImportKeyword,TokenType.SingleQuote,TokenType.DoubleQuote,TokenType.Semicolon,TokenType.EndOfFile];

        expect(sys).to.be.a('array');
        expect(sys).to.have.lengthOf(sysList.length);
        expect(sys.map(tt=>tt.type)).to.be.deep.equal(sysList);
    });

    it('should provide correct parsing',()=>{

        const tokens = tokenizeSyx('keyword ruleish;');
        const ast = syxparser.parseTokens(tokens,'TEST_FILE');
        const stmt:KeywordStatement = {type:7,modifiers:[],range:{end:{line:1,character:15},start:{line:1,character:0}},word:'ruleish'};

        expect(ast).to.be.a('object');
        expect(ast).to.have.property('type').to.be.a('number');
        expect(ast).to.have.property('modifiers').to.be.a('array');
        expect(ast).to.have.property('body').to.be.a('array');
        expect(ast).to.have.property('range').to.be.a('object');
        expect(ast.body[0]).to.be.a('object').to.be.deep.equal(stmt);

    });
});