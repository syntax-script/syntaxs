# syntaxs `v0.0.1-alpha`

Main library required to use SyntaxScript.

> This project is still in alpha. If you would like to contribute to this project, or get help about using it, please consider [our discord server](https://discord.gg/tPSn7HPc).

# Introduction

Syntax Script is designed to be a programming langauge that you make. You can define any syntax you want, add any function you want, add any
expression you would like to exist, add any keyword you want. And the good thing is that you don't have to write a runtime! You can compile
the same code into any language you want. For example, let's see some basic operators.

```syx
// Addition expression
export operator <decimal>+s'+'+s<decimal> {
    compile(ts,js,mts,mjs,cts,cjs,tsx,jsx,java,py,javascript,typescript,kotlin) decimal|0 '+' decimal|1;
}

// Subtraction expression
export operator <decimal>+s'-'+s<decimal> {
    compile(ts,js,mts,mjs,cts,cjs,tsx,jsx,java,py,javascript,typescript,kotlin) decimal|0 '-' decimal|1;
}

// Multiplication expression
export operator <decimal>+s'*'+s<decimal> {
    compile(ts,js,mts,mjs,cts,cjs,tsx,jsx,java,py,javacsript,typescript,kotlin) decimal|0 '*' decimal|1;
}

// Division expression
export operator <decimal>+s'/'+s<decimal> {
    compile(ts,js,mts,mjs,cts,cjs,tsx,jsx,java,javascript,typescript,kotlin) decimal|0 '/' decimal|1;
    compile(py) decimal|0'//'decimal|1;
    imports(py) 'math';
}
```

All you need to do is import this file from a syntax script file, and you'll have a language that only supports four mathemetical operations.

# Installation

```bat
npm i -g syntaxs
```

# Usage

```bat
syntaxs help -- help command
syntaxs init -- create config file
syntaxs compile -- compile
```