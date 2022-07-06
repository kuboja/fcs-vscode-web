import * as vscode from "vscode";


export enum FcsSymbolKind {
    unknown,
    gBlock,
    gClass,
    variable,
    function
}


export class FcsSymbolInformation {

    /**
     * The name of this symbol.
     */
    public name: string;

    public detail?: string;

    /**
     * The name of the symbol containing this symbol.
     */
    public containerName: string;

    /**
     * The kind of this symbol.
     */
    public kind: FcsSymbolKind;

    /**
     * Tags for this symbol.
     */
    public tags?: readonly vscode.SymbolTag[];

    /**
     * The location of this symbol.
     */
    public readonly location: vscode.Location;
    
    public readonly uri: vscode.Uri;

    public readonly range: vscode.Range;

    public readonly selectionRange: vscode.Range;

    constructor(name: string, kind: FcsSymbolKind, containerName: string, uri: vscode.Uri, range: vscode.Range, selectionRange?: vscode.Range) {
        this.name = name;
        this.kind = kind;
        this.containerName = containerName;
        this.uri = uri;
        this.range = range;
        this.location = new vscode.Location(uri, range);
        this.selectionRange = selectionRange ?? range;
    }

    public getSymbolInformation() {
        return new vscode.SymbolInformation(this.name, this.getVscodeSymbolKind(), this.containerName, this.location);
    }

    public getDocumentSymbol() {
        return new vscode.DocumentSymbol(this.name, this.detail ?? "", this.getVscodeSymbolKind(), this.range, this.selectionRange);
    }

    public getVscodeSymbolKind() {
        switch (this.kind) {
            case FcsSymbolKind.gBlock: return vscode.SymbolKind.Object;
            case FcsSymbolKind.gClass: return vscode.SymbolKind.Class;
            case FcsSymbolKind.variable: return vscode.SymbolKind.Variable;
            case FcsSymbolKind.function: return vscode.SymbolKind.Function;
            default: return vscode.SymbolKind.Variable;
        }
    }

    //public kspSymbolType: fcsSymbolType = fcsSymbolType.Unknown;
    // public isConst: boolean = false;
    // public description: string = "";
    // public lineNumber: number = -1;
    // public column: number = -1;
}


export class FcsSymbolsAnalyzer {

    private static readonly regFunctionDefinition: RegExp = /^([a-zA-Z][a-zA-Z0-9_]*)\s*(:?=)\s*(?:\(\s*)?([a-zA-Z][a-zA-Z0-9\s,]*)=>/;
    private static readonly regVariableDefinition: RegExp = /^([a-zA-Z][a-zA-Z0-9_]*)\s*(:?=)/;
    private static readonly regGnameDefinition: RegExp = /^g(?:block|class)\s+\{([a-zA-Z][a-zA-Z0-9_]*)\}/;

    public static getSymbolsInDocument(document: vscode.TextDocument, token?: vscode.CancellationToken): FcsSymbolInformation[] {
        const allSybols: FcsSymbolInformation[] = [];
        const lineCount: number = Math.min(document.lineCount, 10000);

        //console.log("Start");
        //let time = Date.now();
        //let couter = 0;

        for (let line: number = 0; line < lineCount; line++) {
            if (token && token.isCancellationRequested) { break; }

            const { text } = document.lineAt(line);

            if (text.length === 0 || text[0] === " " || text[0] === "#") { continue; }

            let sName = "";
            let nameRange: vscode.Range | undefined = undefined;
            let sKind = FcsSymbolKind.variable;

            if (text.startsWith("gblock ") || text.startsWith("gclass ")) {
                let gname = text.match(FcsSymbolsAnalyzer.regGnameDefinition);
                
                if (gname && gname.length > 0) {
                    sName = (gname.length > 1) ? gname[1] : gname[0];
                    
                    if (text.startsWith("gblock ")) {
                        sKind = FcsSymbolKind.gBlock;
                    }
                    else {
                        sKind = FcsSymbolKind.gClass;
                    }
                    
                    const startIndex = text.indexOf(sName);
                    nameRange = new vscode.Range(line, startIndex, line, startIndex + sName.length);
                }
            }

            if (text.includes(":=") || text.includes("=")) {
                const fnName = this.getFunctionName(text);
                if (fnName) {
                    sName = fnName;
                    sKind = FcsSymbolKind.function;
                    nameRange = new vscode.Range(line, 0, line, sName.length);
                } else {
                    sName = this.getVariableName(text) ?? "";
                    sKind = FcsSymbolKind.variable;
                    nameRange = new vscode.Range(line, 0, line, sName.length);
                }
            }

            if (sName && sName.length > 0) {
                const posStart = new vscode.Position(line, 0);
                const posEnd = this.endOfDefinition(document, line);
                const range = new vscode.Range(posStart, posEnd);

                line = posEnd.line;

                allSybols.push(new FcsSymbolInformation(
                    sName,
                    sKind,
                    "",
                    document.uri,
                    range,
                    nameRange
                ));
                
            }
            //couter++;
        }

        //console.log("End - Count: " + couter + " - Time: " + ( Date.now() - time ));
        //let sorted= result.sort(((s1, s2) => FcsSymbolProvider.copmareStrings(s1.name, s2.name)));
        return allSybols;
    }

    public static getFunctionName(text: string) {
        if (!text.includes("=>")){
            return;
        }
        
        let functionName = text.match(FcsSymbolsAnalyzer.regFunctionDefinition);

        if (functionName && functionName.length > 0) {
            return (functionName.length > 1) ? functionName[1] : functionName[0];
        }
    }

    public static getVariableName(text: string) {
        let variableName = text.match(FcsSymbolsAnalyzer.regVariableDefinition);
        if (variableName && variableName.length > 0) {
            return (variableName.length > 1) ? variableName[1] : variableName[0];
        }
    }

    public static compareStrings(a: string, b: string): number {
        let nameA = a.toUpperCase(); // ignore upper and lowercase
        let nameB = b.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    }

    private static endOfDefinition(document: vscode.TextDocument, startLine: number) {
        let text: string = document.lineAt(startLine).text;

        let lengthOfLine = text.length;
        let numberOfLine = 1;
        let endPosition: { line: number; position: number } | undefined;
        let line = startLine;

        let endOfLine = text;
        let lastPosition = 0;

        while (endOfLine.includes("(") || endOfLine.includes("{") || endOfLine.includes("[")) {

            let firstBracket = this.findOpeningBracket(text, lastPosition);

            if (firstBracket !== undefined) {
                endPosition = this.findClosingBracket(document, line, firstBracket.position, firstBracket.bracket);

                if (endPosition !== undefined) {
                    let textLine: string = text;
                    lastPosition = endPosition.position;
                    if (endPosition.line !== line) {
                        textLine = document.lineAt(endPosition.line).text;
                        lastPosition = 0;
                        text = textLine;
                        line = endPosition.line;
                    }
                    endOfLine = textLine.substr(endPosition.position);

                    continue;
                }
            }

            break;
        }

        if (endPosition !== undefined) {
            lengthOfLine = document.lineAt(endPosition.line).text.length;
            numberOfLine = endPosition.line - line + 1;
        }

        return new vscode.Position(line + numberOfLine - 1, lengthOfLine);
    }

    private static findOpeningBracket(text: string, startPos: number): { position: number; bracket: Brackets } | undefined {
        let posPar = text.indexOf("(", startPos);
        let posSqr = text.indexOf("[", startPos);
        let posCur = text.indexOf("{", startPos);
        let max = Math.max(posPar, posSqr, posCur);

        if (max === -1) { return undefined; }

        switch (max) {
            case posPar: return { position: max, bracket: Brackets.parenthesis };
            case posSqr: return { position: max, bracket: Brackets.squareBracket };
            case posCur: return { position: max, bracket: Brackets.curlyBracket };
            default: return undefined;
        }
    }

    private static findClosingBracket(document: vscode.TextDocument, startLine: number, startPosition: number, bracketType: Brackets): { line: number; position: number } | undefined {
        const rExp = Bracket.regExForBoth(bracketType);
        const leftBracket = Bracket.leftBracket(bracketType);

        const lineCount: number = Math.min(document.lineCount, 10000);

        rExp.lastIndex = startPosition + 1;

        let deep = 1;
        let pos: RegExpExecArray | null;

        for (let iLine: number = startLine; iLine < lineCount; iLine++) {

            let str = document.lineAt(iLine).text;

            while ((pos = rExp.exec(str))) {
                if (!(deep += str[pos.index] === leftBracket ? 1 : -1)) {
                    return { line: iLine, position: pos.index };
                }
            }
        }

        return undefined;
    }
}

enum Brackets {
    parenthesis,
    squareBracket,
    curlyBracket,
}

class Bracket {

    public static leftBracket(bracketType: Brackets): string {
        switch (bracketType) {
            case Brackets.parenthesis: return "(";
            case Brackets.squareBracket: return "[";
            case Brackets.curlyBracket: return "{";
        }
    }

    public static rightBracket(bracketType: Brackets): string {
        switch (bracketType) {
            case Brackets.parenthesis: return ")";
            case Brackets.squareBracket: return "]";
            case Brackets.curlyBracket: return "}";
        }
    }

    public static regExForBoth(bracketType: Brackets): RegExp {
        switch (bracketType) {
            case Brackets.parenthesis: return /\(|\)/g;
            case Brackets.squareBracket: return /\[|\]/g;
            case Brackets.curlyBracket: return /\{|\}/g;
        }
    }
}