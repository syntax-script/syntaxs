export class SyntaxScriptConpiler {
    
    private readonly rootDir:string;
    private readonly outDir:string;
    private readonly mainFileFormat:string;

    constructor(rootDir:string,outDir:string,format:string){
        this.rootDir = rootDir;
        this.outDir = outDir;
        this.mainFileFormat = format;
    }

    public startCompiling() {
        
    }

}