import * as vscode from 'vscode';
import { FcsCompletionItemProvider } from './providers/fcsCompletionItemProvider';
import { FcsDefinitionProvider } from './providers/FcsDefinitionProvider';
import { FcsSymbolProvider } from './providers/FcsSymbolProvider';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    registerSymbolManager(context);
}


function registerSymbolManager(context: vscode.ExtensionContext): void {

    let fcsLang = { language: "fcs", scheme: "" };

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(fcsLang, new FcsCompletionItemProvider(), ".")
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(fcsLang, new FcsSymbolProvider())
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(fcsLang, new FcsDefinitionProvider())
    );


}

// this method is called when the extension is deactivated
export function deactivate() { }
