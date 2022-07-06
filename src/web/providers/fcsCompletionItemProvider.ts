import * as vscode from "vscode";
import { FcsGrammar, GrammarEntity } from "../grammar/fcsGrammar";
//import { ExtensionData } from "./extensionData";


export class FcsCompletionItemProvider implements vscode.CompletionItemProvider {

    //private extData: ExtensionData;
    private grammar: FcsGrammar;

    // constructor(extData: ExtensionData) {
    //     //this.extData = extData;
    //     this.grammar = extData.grammar;
    // }

    public constructor() {
        this.grammar = new FcsGrammar();
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext):
        vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {


        //console.log("run FcsCompletionItemProvider");

        return this.getSuggestions(document, position, token);
    }

    private getSuggestions(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.CompletionItem[] {

        var grammar: FcsGrammar = this.grammar;

        // text, který je před kurozorem: Fcs.Action.Cl| -> "Fcs.Action.Cl"
        var priorWord: string | undefined = grammar.priorWord(document, position);

        // slovo ve kterém je kurzor: 
        var currentWord: string | undefined = grammar.currentWord(document, position);

        // je tečka před kurzorem?
        var dotBefore: boolean = grammar.dotBefore(document, position, currentWord ? currentWord : "");

        var numberOfDot: number = 0;
        var filteredObjects: GrammarEntity[] = [];

        if (priorWord) {
            numberOfDot = (priorWord.match(/\./g) || []).length;
        }

        // pokud je před kurzor na nějaká tečka, tak se vyfiltrují vhodné položky
        if (numberOfDot > 0) {
            filteredObjects = grammar.grammarNodes.filter(v => v.dot === numberOfDot && v.key.startsWith(priorWord ? priorWord : ""));
        }

        // pokud nebyla tečka v textu před kurzorem nebo nebyl nalezen žádný vhodný node
        if (filteredObjects.length === 0) {
            if (dotBefore) {
                numberOfDot = -1;
            }
            var startWith: string = currentWord ? currentWord : "";
            filteredObjects = grammar.grammarNodes.filter(v => v.dot === numberOfDot && v.key.startsWith(startWith));
        }

        //console.log(priorWord  + " | " + currentWord + " | " + numberOfDot + " | " + filteredObjects.map(v => v.name).join(", "));

        var completionItems: vscode.CompletionItem[] = filteredObjects.map(v => v.getCompletionItem());

        return completionItems;
    }
}