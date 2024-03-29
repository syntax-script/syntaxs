export enum TokenType {
    OpenBrace='open_brace',
    CloseBrace='close_brace',
    DefinitionEnd='definition_end',
    Semicolon='semicolon',
    Comma='comma',
    OpenParen='open_paren',
    CloseParen='close_paren',
    OpenSquare='open_square',
    CloseSquare='close_square',
    OperatorKeyword='keyword_operator',
    CompileKeyword='keyword_compile',
    Identifier='identifier',
    OpenDiamond='open_diamond',
    CloseDiamond='close_dimaond',
    WhitespaceIdentifier='whitespace',
    IntNumber='number_int',
    SingleQuote='quote_single',
    DoubleQuote='quote_double',
    ImportKeyword='keyword_import',
    ExportKeyword='keyword_export',
    Raw='raw',
    VarSeperator='var_sep',
    EndOfFile='eof'
}

export interface Token {
    type:TokenType;
    value:string;
}

export enum NodeType {
    Program='program',

    // stmt
    Operator='operator',
    Compile='compile',
    Import='import',
    Export='export',

    // expr
    PrimitiveType='primitive',
    WhitespaceIdentifier='whitespace_id',
    Variable='var',
    String='string',
    Brace='brace',
    Paren='paren',
    Square='square'
}

export interface ProgramStatement extends Statement{
    type:NodeType.Program,
    body:Statement[] 
}

export interface Statement {
    type:NodeType
}

export interface Expression extends Statement {
    value:string
}

export interface PrimitiveTypeExpression extends Expression {
    type:NodeType.PrimitiveType,
    value:string;
}

export interface VariableExpression extends Expression {
    type:NodeType.Variable,
    value:string;
    index:number;
}

export interface WhitespaceIdentifierExpression extends Expression {
    type:NodeType.WhitespaceIdentifier
}

export interface StringExpression extends Expression {
    type:NodeType.String,
    value:string;
}


export interface BraceExpression extends Expression {
    type:NodeType.Brace,
    body:Statement[]
}


export interface ParenExpression extends Expression {
    type:NodeType.Paren,
    body:Statement[]
}


export interface SquareExpression extends Expression {
    type:NodeType.Square,
    body:Statement[]
}

export interface OperatorStatement extends Statement {
    type:NodeType.Operator,
    body:Statement[];
    regex:Statement[];
}

export interface CompileStatement extends Statement {
    type:NodeType.Compile,
    formats:string[],
    body:Expression[]
}

export interface ImportStatement extends Statement {
    type:NodeType.Import,
    path:string;
}

export interface ExportStatement extends Statement {
    type:NodeType.Export,
    body:Statement
}


export type Node = 
ProgramStatement|OperatorStatement|CompileStatement|ImportStatement|ExportStatement|
StringExpression|PrimitiveTypeExpression|VariableExpression|WhitespaceIdentifierExpression|BraceExpression|SquareExpression|ParenExpression;

export interface SyxConfig {
    name:string;
    description?:string;
    version:string;
    compile:SyxConfigCompile;
}

export interface SyxConfigCompile {
    root:string;
    out:string;
    format:string;
}