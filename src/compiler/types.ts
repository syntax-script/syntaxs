enum TokenType {
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
    KeywordKeyword,
    RuleKeyword
}

interface Token {
    type: TokenType;
    value: string;
}

enum NodeType {
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
    Rule,

    // expr
    PrimitiveType,
    WhitespaceIdentifier,
    Variable,
    String,
    Brace,
    Paren,
    Square
}

interface ProgramStatement extends Statement {
    type: NodeType.Program,
    body: Statement[];
}

interface Statement {
    type: NodeType;
}

interface Expression extends Statement {
    value: string;
}

interface PrimitiveTypeExpression extends Expression {
    type: NodeType.PrimitiveType,
    value: string;
}

interface VariableExpression extends Expression {
    type: NodeType.Variable,
    value: string;
    index: number;
}

interface WhitespaceIdentifierExpression extends Expression {
    type: NodeType.WhitespaceIdentifier;
}

interface StringExpression extends Expression {
    type: NodeType.String,
    value: string;
}


interface BraceExpression extends Expression {
    type: NodeType.Brace,
    body: Statement[];
}


interface ParenExpression extends Expression {
    type: NodeType.Paren,
    body: Statement[];
}


interface SquareExpression extends Expression {
    type: NodeType.Square,
    body: Statement[];
}

interface OperatorStatement extends Statement {
    type: NodeType.Operator,
    body: Statement[];
    regex: Statement[];
}

interface KeywordStatement extends Statement {
    word: string;
    type: NodeType.Keyword;
}

interface ImportsStatement extends Statement {
    type: NodeType.Imports,
    formats: string[];
    module: string;
}

interface CompileStatement extends Statement {
    type: NodeType.Compile,
    formats: string[],
    body: Expression[];
}

interface RuleStatement extends Statement {
    type: NodeType.Rule;
    rule: string;
    value: unknown;
}

interface ImportStatement extends Statement {
    type: NodeType.Import,
    path: string;
}

interface ExportStatement extends Statement {
    type: NodeType.Export,
    body: Statement;
}

interface FunctionStatement extends Statement {
    type: NodeType.Function,
    name: string,
    arguments: string[];
    body: Statement[];
}


type Node =
    ProgramStatement | OperatorStatement | CompileStatement | ImportStatement | ExportStatement | ImportsStatement | FunctionStatement | KeywordStatement | RuleStatement |
    StringExpression | PrimitiveTypeExpression | VariableExpression | WhitespaceIdentifierExpression | BraceExpression | SquareExpression | ParenExpression;

interface SyxConfig {
    name: string;
    description?: string;
    version: string;
    compile: SyxConfigCompile;
}

interface SyxConfigCompile {
    root: string;
    out: string;
    format: string;
}

export {

    // Enums/Types
    TokenType,NodeType,Token,Node,

    // Statements
    Statement,ProgramStatement,OperatorStatement,KeywordStatement,ImportsStatement,CompileStatement,ImportStatement,ExportStatement,FunctionStatement,RuleStatement,

    // Expressions
    Expression,PrimitiveTypeExpression,VariableExpression,WhitespaceIdentifierExpression,StringExpression,BraceExpression,ParenExpression,SquareExpression,

    // Config
    SyxConfig,SyxConfigCompile
    
};