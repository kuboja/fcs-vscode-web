import * as vscode from "vscode";
import { FcsSymbolsAnalyzer } from "../grammar/fcsSymbols";


export class FcsDefinitionProvider implements vscode.DefinitionProvider {

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {
        
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        const word = document.getText(wordRange);
        if (!word) {
            return;
        }

        const symbolsInDoc = FcsSymbolsAnalyzer.getSymbolsInDocument(document, token);

        let link: vscode.DefinitionLink | undefined;

        for (const sym of symbolsInDoc) {
            if (sym.name === word) {

                link = {
                    originSelectionRange: wordRange,
                    targetUri: sym.uri,
                    targetRange: sym.range,
                    targetSelectionRange: sym.selectionRange,
                };

                break;
            }
        }

        if (link) {
            return [link];
        }
    }

}
