import * as vscode from "vscode";
import { FcsSymbolsAnalyzer } from "../grammar/fcsSymbols";


export class FcsSymbolProvider implements vscode.DocumentSymbolProvider {

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {

        let symbolsInDoc = FcsSymbolsAnalyzer.getSymbolsInDocument(document, token);

        return symbolsInDoc.map(s => s.getDocumentSymbol());
    }

}

