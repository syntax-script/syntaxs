/**
 * Every token type a syntax script declaration file can contain. If something can't be recognized as a token,
 * it will be tokenized as {@link TokenType.Raw} to let strings include any character.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
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
    KeywordKeyword,
    RuleKeyword
}

/**
 * Base token interface.
 * @version 1.0.0
 * @since 0.0.1-alpha
 * @author efekos
 */
export interface Token {
    type: TokenType;
    value: string;
}

/**
 * Every node type a syntax script declaration file can contain.
 * @author efekos
 * @since 0.0.1-alpha
 * @version 1.0.0
 */
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

/**
 * Main program statement. Uses type {@link NodeType.Program}. Contains every statement included in a file.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface ProgramStatement extends Statement {
    type: NodeType.Program,
    body: Statement[];
}

/**
 * Base statement interface.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface Statement {
    type: NodeType;
}

/**
 * Base expression type. Must contain a string value as a difference from it's superclass, {@link Statement}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface Expression extends Statement {
    value: string;
}

/**
 * An expression that represents a primitive type. Uses type {@link NodeType.PrimitiveType}. Contains name of the primitive type as value.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface PrimitiveTypeExpression extends Expression {
    type: NodeType.PrimitiveType,
    value: string;
}

/**
 * An expression that represents a primitive type variable, probably used in a {@link CompileStatement}. Uses type {@link NodeType.Variable}.
 * Contains name of the primitive type a value, and also an index indicating which part of the regex exactly.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface VariableExpression extends Expression {
    type: NodeType.Variable,
    value: string;
    index: number;
}

/**
 * An expression that represents a whitespace identifier. Whitespace identifiers are used to reference to any amount of spaces.
 * Uses type {@link NodeType.WhitespaceIdentifier}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface WhitespaceIdentifierExpression extends Expression {
    type: NodeType.WhitespaceIdentifier;
}

/**
 * An expression that represents a literal string value. Uses type {@link NodeType.String}. Contains the value of the string.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface StringExpression extends Expression {
    type: NodeType.String,
    value: string;
}

/**
 * An expression that represents multiple statements inside braces (`{}`). Uses type {@link NodeType.Brace}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface BraceExpression extends Expression {
    type: NodeType.Brace,
    body: Statement[];
}

/**
 * An expression that represents multiple statements inside parens (`()`). Uses type {@link NodeType.Paren}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface ParenExpression extends Expression {
    type: NodeType.Paren,
    body: Statement[];
}



/**
 * An expression that represents multiple statements inside square parens (`[]`). Uses type {@link NodeType.Square}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface SquareExpression extends Expression {
    type: NodeType.Square,
    body: Statement[];
}

/**
 * Operator statement that represensts an operator usable anywhere, such as a binary expression. Uses type {@link NodeType.Operator}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface OperatorStatement extends Statement {
    type: NodeType.Operator,
    body: Statement[];
    regex: Statement[];
}

/**
 * Keyword statement that registers an identifier as a keyword. This keyword can be used in several places. Uses type {@link NodeType.Keyword}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface KeywordStatement extends Statement {
    word: string;
    type: NodeType.Keyword;
}

/**
 * Imports statements indicate that a certain module should be imported to the file if the parent statement is used in .sys file.
 * Uses type {@link NodeType.Imports}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface ImportsStatement extends Statement {
    type: NodeType.Imports,
    formats: string[];
    module: string;
}

/**
 * Compile statements determine what should be the result of an operator or a function when compiling to certain languages.
 * Uses typq {@link NodeType.Compile}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface CompileStatement extends Statement {
    type: NodeType.Compile,
    formats: string[],
    body: Expression[];
}

/**
 * Rule statements define a specific rule about the source language, such as keyword usages or enabling/disabling certain
 * features of the language. Uses type {@link NodeType.Rule}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface RuleStatement extends Statement {
    type: NodeType.Rule;
    rule: string;
    value: unknown;
}

/**
 * Import statements are used to import a .syx file from a .sys file. They can be used to import other .syx files from a
 * .syx file as well. Uses type {@link NodeType.Import}
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface ImportStatement extends Statement {
    type: NodeType.Import,
    path: string;
}

/**
 * Export statements are used to export a certain statement, such as an operator or a keyword. Uses type {@link NodeType.Export}
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface ExportStatement extends Statement {
    type: NodeType.Export,
    body: Statement;
}

/**
 * Function statements are used to define possible function calls. How the function is called depends on the place this statement is
 * used. Uses type {@link NodeType.Function}.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface FunctionStatement extends Statement {
    type: NodeType.Function,
    name: string,
    arguments: string[];
    body: Statement[];
}


/**
 * Represents any interface that is a node.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export type Node =
    ProgramStatement | OperatorStatement | CompileStatement | ImportStatement | ExportStatement | ImportsStatement | FunctionStatement | KeywordStatement | RuleStatement |
    StringExpression | PrimitiveTypeExpression | VariableExpression | WhitespaceIdentifierExpression | BraceExpression | SquareExpression | ParenExpression;

/**
 * Represents a syxconfig.json file. This file contains a few properties for the compiler.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface SyxConfig {
    name: string;
    description?: string;
    version: string;
    compile: SyxConfigCompile;
}

/**
 * Represents the `compile` property of a syxconfig.json file. This part contains information especially about the compiler.
 * @author efekos
 * @version 1.0.0
 * @since 0.0.1-alpha
 */
export interface SyxConfigCompile {
    root: string;
    out: string;
    format: string;
}