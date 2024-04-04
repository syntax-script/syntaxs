export enum TokenType {
    OpenBrace,
    CloseBrace,
    DefinitionEnd,
    Semicolon,
    Comma,
    OpenParen,
    CloseParen,
    OpenSquare,
    CloseSquare,
    OperatorKeyword,
    CompileKeyword,
    Identifier,
    OpenDiamond,
    CloseDiamond,
    WhitespaceIdentifier,
    IntNumber,
    SingleQuote,
    DoubleQuote,
    ImportKeyword,
    ExportKeyword,
    Raw,
    VarSeperator,
    GlobalKeyword,
    FunctionKeyword,
    ClassKeyword,
    ImportsKeyword,
    EndOfFile,
    KeywordKeyword
}

export interface Token {
    type:TokenType;
    value:string;
}

export enum NodeType {
    Program,

    // stmt
    Operator,
    Compile,
    Import, // Import some file
    Imports, // imports() method
    Export,
    Function,
    Global,
    Keyword,

    // expr
    PrimitiveType,
    WhitespaceIdentifier,
    Variable,
    String,
    Brace,
    Paren,
    Square
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

export interface KeywordStatement extends Statement {
    word:string;
    type:NodeType.Keyword
}

export interface ImportsStatement extends Statement {
    type:NodeType.Imports,
    formats:string[];
    module:string;
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

export interface FunctionStatement extends Statement {
    type:NodeType.Function,
    name:string,
    arguments:string[];
    body:Statement[];
}


export type Node = 
ProgramStatement|OperatorStatement|CompileStatement|ImportStatement|ExportStatement|ImportsStatement|FunctionStatement|KeywordStatement|
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