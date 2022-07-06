import * as vscode from "vscode";


export enum GrammarKind {
    constant,
    function,
    functionEmpty,
    object,
    property,
    module,
    order,
    orderWithoutParameters,
}

export class GrammarEntity {
    public dot: number;
    public key: string;
    public description: string | undefined;
    public kind: GrammarKind = GrammarKind.constant;

    public constructor(init?: Partial<GrammarEntity>) {
        this.dot = 0;
        this.key = "";
        Object.assign(this, init);
    }

    private _completionItem: vscode.CompletionItem | undefined;

    public getCompletionItem(): vscode.CompletionItem {
        if (this._completionItem !== undefined) {
            return this._completionItem;
        }

        var itemLabel: string = this.name;
        var itemKind: vscode.CompletionItemKind = this.getCompletionItemKind();

        var item: vscode.CompletionItem = new vscode.CompletionItem(itemLabel, itemKind);
        item.detail = this.description;

        if (this.kind === GrammarKind.function) {
            item.insertText = new vscode.SnippetString(itemLabel + "( ${1} )");
        } else if (this.kind === GrammarKind.functionEmpty) {
            item.insertText = itemLabel + "()";
        } else if (this.kind === GrammarKind.object) {
            item.insertText = new vscode.SnippetString(itemLabel + "{ ${1} }");
        } else if (this.kind === GrammarKind.order) {
            item.insertText = itemLabel + " ";
        }

        this._completionItem = item;

        return item;
    }

    private getCompletionItemKind(): vscode.CompletionItemKind {
        switch (this.kind) {
            case GrammarKind.constant:
                return vscode.CompletionItemKind.Constant;
            case GrammarKind.function:
                return vscode.CompletionItemKind.Function;
            case GrammarKind.functionEmpty:
                return vscode.CompletionItemKind.Function;
            case GrammarKind.object:
                return vscode.CompletionItemKind.Class;
            case GrammarKind.property:
                return vscode.CompletionItemKind.Property;
            case GrammarKind.module:
                return vscode.CompletionItemKind.Module;
            case GrammarKind.order:
                return vscode.CompletionItemKind.Keyword;
            case GrammarKind.orderWithoutParameters:
                return vscode.CompletionItemKind.Keyword;

            default:
                return vscode.CompletionItemKind.Property;
        }
    }

    public get name(): string {
        var nodes: string[] = this.key.split(".");
        if (this.dot > 0 && nodes && nodes.length > 0) {
            let name: string = "";
            for (var i = this.dot; i < nodes.length; i++) {
                name += (i > this.dot ? "." : "") + nodes[i];
            }
            return name;
        } else {
            return this.key;
        }
    }
}

export class FcsGrammar {

    private _grammarNodes: GrammarEntity[] | undefined;

    get grammarNodes(): GrammarEntity[] {
        if (this._grammarNodes) {
            return this._grammarNodes;
        } else {
            this._grammarNodes = grammarNodes;
            return grammarNodes;
        }
    }


    /** Match last word in text preceded by space or open paren/bracket. */
    // private priorWordPattern = /[\s\(\[]([A-Za-z0-9_\.]+)\s*$/;
    private priorWordPattern = /([A-Za-z][A-Za-z0-9_\.]*)$$/;

    public dotBefore(doc: vscode.TextDocument, pos: vscode.Position, currentWord: string): boolean {
        var text: string = doc.lineAt(pos.line).text;
        var currentWordLength: number = (currentWord) ? currentWord.length : 0;
        return text.substring(pos.character - 1 - currentWordLength, pos.character - currentWordLength) === ".";
    }

    /**
     * Get the previous word adjacent to the current position by getting the
     * substring of the current line up to the current position then use a compiled
     * regular expression to match the word nearest the end.
     */
    public priorWord(doc: vscode.TextDocument, pos: vscode.Position): string | undefined {
        var line: vscode.TextLine = doc.lineAt(pos.line);
        var text: string = line.text;
        const match: RegExpExecArray | null = this.priorWordPattern.exec(text.substring(0, pos.character));
        return (match !== null && match.length > 1) ? match[1] : undefined;
    }

    /**
     * Get the word at the current position.
     */
    public currentWord(doc: vscode.TextDocument, pos: vscode.Position): string | undefined {
        const range: vscode.Range | undefined = doc.getWordRangeAtPosition(pos);
        return (range !== undefined && !range.isEmpty) ? doc.getText(range) : undefined;
    }

}

const grammarNodes: GrammarEntity[] = [

    new GrammarEntity({ dot: 0, key: "Atan2", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Log10", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Exp", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Sqrt", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Sin", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Asin", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Cos", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Tan", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Abs", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Argb", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Max", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Min", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Round", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 0, key: "Truncate", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 0, key: "False", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 0, key: "True", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 0, key: "PI", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 0, key: "import", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "model_shell3d", kind: GrammarKind.orderWithoutParameters }),
    new GrammarEntity({ dot: 0, key: "list_envelopes", kind: GrammarKind.orderWithoutParameters }),
    new GrammarEntity({ dot: 0, key: "explode_envelopes", kind: GrammarKind.orderWithoutParameters }),

    new GrammarEntity({ dot: 0, key: "print", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "browse_report", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "browse_image", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "exportesaxml", kind: GrammarKind.order }),
    
    new GrammarEntity({ dot: 0, key: "#fli_json", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_report", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_image", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_dxf", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_rtf", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_ifc", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_html", kind: GrammarKind.order }),
    new GrammarEntity({ dot: 0, key: "#fli_esazip", kind: GrammarKind.order }),

    new GrammarEntity({ dot: 0, key: "Math", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 1, key: "Math.PI", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "Math.E", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "Math.ToInteger", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Math.CylinderFieldBiCubicResamplingAndInterpolation", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 1, key: "Math.CylinderFieldBiCubic", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 1, key: "Math.Interval", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Math.IntervalSet", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Math.Subtraction", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Math.Interval1D", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Math.Interval1D.Union", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Math.Interval1D.Intersection", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Math.Interval1D.IsEmptyInterval", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Math.Interval1D.Empty", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 0, key: "CssAlignment", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.None", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.TopLeft", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.Top", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.TopRight", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.Left", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.Centre", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.Right", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.BottomLeft", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.Bottom", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "CssAlignment.BottomRight", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 0, key: "VariableSymbol", kind: GrammarKind.object }),

    new GrammarEntity({ dot: 0, key: "GCS", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 1, key: "GCS.Rx", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Ry", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Rz", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Tx", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Ty", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Tz", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.Origin", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "GCS.Axes", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "GCS.Axes.Rx", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "GCS.Axes.Ry", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "GCS.Axes.Rz", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "GCS.GetLCS", kind: GrammarKind.functionEmpty }),
    new GrammarEntity({ dot: 2, key: "GCS.GetLCS().PointToGcs", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "GCS.GetLCS().GcsToLcs", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 0, key: "Fcs", kind: GrammarKind.module }),

    new GrammarEntity({ dot: 1, key: "Fcs.Symbol", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Pow", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Log", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Log10", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Exp", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Max", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Min", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Abs", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Sin", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Cos", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Tan", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Cot", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Asin", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Acos", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Atan", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Acotan", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Sinh", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Cosh", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Tanh", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Coth", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Sqrt", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Brace", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Constant", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Undefined", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Match", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Greater", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.GreaterOrEqual", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Between", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.LessOrEqual", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Less", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Conditional", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Switch", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Symbol.Case", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.EngineeringQuantity", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Coefficient", description: "coefficient [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Factor", description: "factor [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Multiplier", description: "multiplier [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.FactorPerLength", description: "factor per length [1/m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.FactorPerArea", description: "factor per area [1/m²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.StructureSlope", description: "structural slope [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.StructureAngle", description: "structural angle [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Slope", description: "slope [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Angle", description: "angle [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionAngle", description: "cross section angle [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Length", description: "length [m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Area", description: "area [m²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Volume", description: "volume [m³]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.StructureLength", description: "structural length [m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.DoorLength", description: "door length [m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionLength", description: "cross section length [m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionArea", description: "cross section area [m²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionModulus", description: "cross section modulus [m³]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionInertia", description: "cross section inertia [m⁴]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.CrossSectionWarpInertia", description: "cross section inertia in warping [m⁶]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Force", description: "force [kgm/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.BeamInternalForce", description: "beam internal force [kgm/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.BeamBendingMoment", description: "beam bending moment [kgm²/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.ShellInternalForce", description: "shell internal force [kg/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.ShellBendingMoment", description: "shell bending moment [kgm/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.LoadForce", description: "load force [kgm/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.LoadMoment", description: "load moment [kgm²/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.LoadForcePerLength", description: "load force per length intensity [kg/s²]"    }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.LoadMomentPerLength", description: "load moment per length intensity [kgm/s²]"    }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.LoadForcePerArea", description: "load force per area intensity [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.MassDensity", description: "volumetric mass density [kg/m³]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Mass", description: "mass [kg]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Speed", description: "speed [m/s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Velocity", description: "velocity [m/s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Acceleration", description: "acceleration [m/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.SpecificWeight", description: "specific weight [kg/m²s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Pressure", description: "pressure [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Stress", description: "stress [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.MaterialStrength", description: "material strenght [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.MaterialYieldLimit", description: "material yield strenght [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.MaterialUltimateLimit", description: "material ultimate strenght [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.MaterialElasticModulus", description: "material modulus of elasticity [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Time", description: "time [s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.ConcreteAge", description: "concrete age [s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Displacement", description: "displacement [m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Rotation", description: "rotation [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.DeformationTorque", description: "torque deformation [1/m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Curvature", description: "curvature [1/m]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.DeformationEnergy", description: "deformation energy [kgm²/s²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.EnergyDensity", description: "energy density [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.DeformationStrain", description: "strain [-]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.FluidVelocity", description: "fluid velocity [m/s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.FluidVorticity", description: "fluid vorticity [1/s]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.FluidPressure", description: "fluid pressure [kg/ms²]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.Temperature", description: "temperature [K]" }),
    new GrammarEntity({ dot: 2, key: "Fcs.EngineeringQuantity.HeatFlux", description: "heat flux [kg/s³})]" }),

    new GrammarEntity({ dot: 0, key: "Unit", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 1, key: "Unit.List", description: "List of units", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 1, key: "Unit.rad", description: "[radian] (1 rad = 1 )" }),
    new GrammarEntity({ dot: 1, key: "Unit.mrad", description: "[miliradian] (1 mrad = 0.001 )" }),
    new GrammarEntity({ dot: 1, key: "Unit.deg", description: "[degree] (1 deg = 0.0174532925199433 )" }),
    new GrammarEntity({ dot: 1, key: "Unit.grad", description: "[grad] (1 grad = 0.015707963267949 )" }),
    new GrammarEntity({ dot: 1, key: "Unit.m", description: "[metre] (1 m = 1 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.nm", description: "[nanometre] (1 nm = 1E-09 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.mm", description: "[milimetre] (1 mm = 0.001 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.cm", description: "[centimetre] (1 cm = 0.01 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.km", description: "[kilometre] (1 km = 1000 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.in", description: "[inch] (1 in = 0.0254 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.ft", description: "[feet] (1 ft = 0.3048 m)" }),
    new GrammarEntity({ dot: 1, key: "Unit.m2", description: "[metre square] (1 m² = 1 m²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.mm2", description: "[milimetre square] (1 mm² = 1E-06 m²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.cm2", description: "[centimetre square] (1 cm² = 0.0001 m²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.in2", description: "[inch square] (1 in² = 0.00064516 m²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.m3", description: "[cubic metre] (1 m³ = 1 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.mm3", description: "[cubic milimetre] (1 mm³ = 1E-09 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.cm3", description: "[cubic centimetre] (1 cm³ = 1E-06 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.in3", description: "[cubic inch] (1 in³ = 1.6387064E-05 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.ft3", description: "[cubic foot] (1 ft³ = 0.028316846592 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.bsh", description: "[bushel] (1 bsh = 0.035239072 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.l", description: "[litre] (1 l = 0.001 m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.N", description: "[newton] (1 N = 1 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kN", description: "[kilonewton] (1 kN = 1000 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.MN", description: "[meganewton] (1 MN = 1000000 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kp", description: "[kilopond] (1 kp = 9.80665 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.lbf", description: "[pound-force] (1 lbf = 4.44822162 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kip", description: "[kilopound] (1 kip = 4448.22162 kgm/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.Nm", description: "[newtonmetre] (1 Nm = 1 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kNm", description: "[kilonewtonmetre] (1 kNm = 1000 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.MNm", description: "[meganewtonmetre] (1 MNm = 1000000 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.lbfin", description: "[inch-pound] (1 lbfin = 0.112984829148 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.lbfft", description: "[foot-pound] (1 lbfft = 1.355817949776 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kipft", description: "[foot-kilopound] (1 kipft = 1355.817949776 kgm²/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.Pa", description: "[pascal] (1 Pa = 1 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kPa", description: "[kilopascal] (1 kPa = 1000 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.MPa", description: "[megapascal] (1 MPa = 1000000 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.psi", description: "[pound per square inch] (1 psi = 6894.8 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.psf", description: "[pound per square feet] (1 psf = 47.8802595 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.ksi", description: "[kilo-pound per square inch] (1 ksi = 6894800 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.N_m", description: "[newton per meter] (1 N·m = 1 kg/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kN_m", description: "[kilonewton per meter] (1 kN/m = 1000 kg/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.N_m2", description: "[newton per square meter] (1 N/m² = 1000 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kN_m2", description: "[kilonewton per square meter] (1 kN/m² = 1000 kg/ms²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kg", description: "[kilogram] (1 kg = 1 kg)" }),
    new GrammarEntity({ dot: 1, key: "Unit.gr", description: "[gram] (1 gr = 0.001 kg)" }),
    new GrammarEntity({ dot: 1, key: "Unit.t", description: "[metric ton] (1 t = 1000 kg)" }),
    new GrammarEntity({ dot: 1, key: "Unit.lbm", description: "[pound-mass] (1 lbm = 0.45359237 kg)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kg_m3", description: "[kilogram per cubic metre] (1 kg/m³ = 1 kg/m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.t_m3", description: "[ton per cubic metre] (1 t/m³ = 1000 kg/m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kg_l ", description: "[kilogram per litre] (1 kg/l  = 1000 kg/m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.lbm_ft3", description: "[poud per cubic foot] (1 lbm/ft³ = 16.0184633739601 kg/m³)" }),
    new GrammarEntity({ dot: 1, key: "Unit.s", description: "[second] (1 s = 1 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.ms", description: "[milisecond] (1 ms = 0.001 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.min", description: "[minute] (1 min = 60 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.hr", description: "[hour] (1 hr = 3600 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.day", description: "[day] (1 day = 86400 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.week", description: "[week] (1 week = 604800 s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.A", description: "[ampere] (1 A = 1 A)" }),
    new GrammarEntity({ dot: 1, key: "Unit.mA", description: "[miliampere] (1 mA = 0.001 A)" }),
    new GrammarEntity({ dot: 1, key: "Unit.kA", description: "[kiloampere] (1 kA = 1000 A)" }),
    new GrammarEntity({ dot: 1, key: "Unit.C", description: "[degree of celsius] (1 C = 1 K)" }),
    new GrammarEntity({ dot: 1, key: "Unit.K", description: "[kelvin] (1 K = 1 K)" }),
    new GrammarEntity({ dot: 1, key: "Unit.F", description: "[fahrenheit] (1 F = 0.555555555555556 K)" }),
    new GrammarEntity({ dot: 1, key: "Unit.R", description: "[rankine] (1 R = 0.555555555555556 K)" }),
    new GrammarEntity({ dot: 1, key: "Unit.mol", description: "[mole] (1 mol = 1 mol)" }),
    new GrammarEntity({ dot: 1, key: "Unit.cd", description: "[candela] (1 cd = 1 cd)" }),
    new GrammarEntity({ dot: 1, key: "Unit.m_s", description: "[metre per second] (1 m/s = 1 m/s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.km_h", description: "[kilometre per hour] (1 km/h = 0.277777777777778 m/s)" }),
    new GrammarEntity({ dot: 1, key: "Unit.g", description: "[gravitational acceleration] (1 g = 9.80665 m/s²)" }),
    new GrammarEntity({ dot: 1, key: "Unit.m_s2", description: "[metre per second squared] (1 m/s² = 1 m/s²)" }),

    new GrammarEntity({ dot: 1, key: "Fcs.Units", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Units.Setup", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Units.DefaultSI", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Units.DefaultFEM", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Units.DefaultSteel", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Units.DefaultImperialUS", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Drawing", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Drawing.Rgb", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Drawing.Argb", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Profiling", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Profiling.StartExpressionProfiler", kind: GrammarKind.functionEmpty }),
    new GrammarEntity({ dot: 2, key: "Fcs.Profiling.StopExpressionProfiler", kind: GrammarKind.functionEmpty }),

    new GrammarEntity({ dot: 1, key: "Fcs.Process", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Process.LaunchExe", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Process.Function", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Types", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Types.Array", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Geometry", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Vertex3D", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Point3D", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Vector3D", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Matrix33", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Tools", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Tools.CreateDefaultLcsByTwoPoints", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Tools.CreateDefaultLcsByTwoPointsAndZ", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Tools.GetLinesIntersection", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Tools.GetLinesIntersection2", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Tools.CreateDefaultMatrixByVectorX", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Measure", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Measure.OrientedAngleOfVectors", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Measure.PositiveOrientedAngleOfVectors", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Measure.AngleOfVectors", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Measure.DistanceOfPoints", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Measure.DistanceOfPointFromPlane", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.BoundingBox", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Lcs", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Intersection", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Intersection.LineAndPlane", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Intersection.Lines2", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Intersection.Lines", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Intersection.PointAndArea", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Geometry.Boolean2D", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Boolean2D.Subtract", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Boolean2D.Intersect", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Geometry.Boolean2D.Add", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Converters", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.StringToMd5Hash", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.IntegerToRomanic", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.ByteArrayToBase64", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.EnumerableRange", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.ToSequence", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.ToArray", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.ToJson", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Converters.ParseJson", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Object", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Object.HasProperty", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Object.HasPropertyValue", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Object.HasPropertyChainValue", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Object.FindProperty", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Object.FindPropertyChainValue", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Beam", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Beam.Hinges", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Beam.Hinges.None", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 2, key: "Fcs.Beam.Hinges.Braces", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 2, key: "Fcs.Beam.Hinge", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Nx", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Vy", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Vz", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Mx", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.My", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Mz", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiNx", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiVy", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiVz", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiMx", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiMy", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.SemiMz", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.None", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Full", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Bend", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.FreeRotation", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.General", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.Beam.Hinge.Dof", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 4, key: "Fcs.Beam.Hinge.Dof.Free", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 4, key: "Fcs.Beam.Hinge.Dof.Stiff", kind: GrammarKind.property }),
    new GrammarEntity({ dot: 4, key: "Fcs.Beam.Hinge.Dof.Semistiff", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 1, key: "Fcs.Analysis", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Analysis.BeamSection", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Analysis.BeamSection.CharacteristicsSolver", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Analysis.ResultCase", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Analysis.ResultMonitor.New", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Analysis.Monitor", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Analysis.Result", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Analysis.Result.Beam", kind: GrammarKind.module }),

    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.N", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Vy", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Vz", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Mx", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.My", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.My_mid", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Mz", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Mz_mid", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Beam.Central", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.N", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.Vy", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.Vz", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.Mx", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.My", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.Mz", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.My_mid", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 5, key: "Fcs.Analysis.Result.Beam.Central.Mz_mid", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 3, key: "Fcs.Analysis.Result.Displacement", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Displacement.X", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Displacement.Y", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Displacement.Z", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Displacement.Total", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 3, key: "Fcs.Analysis.Result.Rotation", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Rotation.X", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Rotation.Y", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Rotation.Z", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 4, key: "Fcs.Analysis.Result.Rotation.Total", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Reporting", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Setup", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Document", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Chapter", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Paragraph", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Text", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Html", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Symbol", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.LocalizedText", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Table", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Table.Row", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.Image", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.RendererHtml", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Reporting.RendererText", kind: GrammarKind.object }),

    new GrammarEntity({ dot: 1, key: "Fcs.Diagnostics", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.Format", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.Clock", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.Clock2", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.TestSuite", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.Test", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Diagnostics.TraceDepth", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Diagnostics.TraceDepth.None", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.Diagnostics.TraceDepth.Firm", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.Diagnostics.TraceDepth.Info", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.Diagnostics.TraceDepth.Trace", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.Diagnostics.TraceDepth.Debug", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Presentation", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Presentation.DxfUpdateRenderer", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Presentation.ImageRenderer", kind: GrammarKind.object }),

    new GrammarEntity({ dot: 1, key: "Fcs.Web", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Web.RestClient", kind: GrammarKind.object }),



    new GrammarEntity({ dot: 1, key: "Fcs.Assembly", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.All", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.AllMembers", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.AllBeams", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.AllShells", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.AllVertexSupports", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.ByName", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamByName", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamByPath", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamNameAndRelativeInterval", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamNameAndAbsoluteInterval", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamsWithCrossSectionName", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamsByLayer", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.ShellsByLayer", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamsInLayer", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.ShellsInLayer", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.MembersInLayer", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.MembersInLayers", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.MembersInLayers", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BeamsInLayers", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.ShellsInLayers", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.Union", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.BucketDefinition", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Assembly.Collector", kind: GrammarKind.object }),

    new GrammarEntity({ dot: 1, key: "Fcs.Action", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Action.Class", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Action.LoadCombination", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Action.LoadCase", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Action.ResultClass", kind: GrammarKind.object }),

    new GrammarEntity({ dot: 1, key: "Fcs.IntensitySystem", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.IntensitySystem.WorldGcs", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.IntensitySystem.Gcs", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.IntensitySystem.LoadLcs", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.IntensitySystem.SurfaceLcs", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Mesh", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Mesh.ConnectRules", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Mesh.ConnectRules.ConnectClub", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 3, key: "Fcs.Mesh.ConnectRules.WeldNodes", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 3, key: "Fcs.Mesh.ConnectRules.HangingNodes", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Mesh.Element", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.Mesh.Element.Quadrilateral", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.Mesh.Element.TrianglePair", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Parameter", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ListType", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ListTypeOption", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemDouble", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemInteger", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemArray", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemList", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemAction", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemString", kind: GrammarKind.object }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemClass", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcs.Parameter.ItemComment", kind: GrammarKind.constant }),

    new GrammarEntity({ dot: 1, key: "Fcs.Exception", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcs.Exception.Throw", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 0, key: "Fcm", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 1, key: "Fcm.Mesh", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcm.Mesh.ConnectRules", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcm.Mesh.AutoConnect", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcm.Mesh.WeldNodes", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcm.Mesh.ElementSize", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 2, key: "Fcm.Mesh.DefaultElementType2D", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 1, key: "Fcm.GetAnalysis", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Fcm.GetFileNamePath", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 1, key: "Fcm.ResourceReader", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.ReadAsBase64", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.ReadAsString", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.ReadJsonAsDynamicObject", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.ReadJsonAsDynamicObjectArray", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.ReadGridValues", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 2, key: "Fcm.ResourceReader.Path", kind: GrammarKind.function }),

    new GrammarEntity({ dot: -1, key: "ToString", kind: GrammarKind.functionEmpty }),

    new GrammarEntity({ dot: -1, key: "Select", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "SelectIterate", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "SelectMany", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "SelectManyFn", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Aggregate", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "AggregateIterate", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Max", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "MaxBy", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "IndexOfMax", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Min", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "MinBy", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "IndexOfMin", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "OrderByAscending", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "OrderByAscendingMore", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "OrderByDescending", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "OrderByDescendingMore", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Where", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Find", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "FindOrDefault", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Take", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Skip", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Reverse", kind: GrammarKind.functionEmpty, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Zip", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "CollectBy", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "CumulativeSums", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Sum", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "SumItems", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Buckets", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "IsEmpty", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Count", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Empty", kind: GrammarKind.constant, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "GetSpacings", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "GetCumulativeSums", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Any", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "All", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "Mul", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "MultiplyElements", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "MaskedSpanSums", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "MergeDoubles", kind: GrammarKind.function, description: "Array function" }),
    new GrammarEntity({ dot: -1, key: "JoinStrings", kind: GrammarKind.function, description: "Array string function" }),
    new GrammarEntity({ dot: -1, key: "JoinStringsWith", kind: GrammarKind.function, description: "Array string function" }),
    new GrammarEntity({ dot: -1, key: "JoinStringsFn", kind: GrammarKind.function, description: "Array string function" }),
    new GrammarEntity({ dot: -1, key: "JoinStringsWithFn", kind: GrammarKind.function, description: "Array string function" }),

    new GrammarEntity({ dot: -1, key: "Substring", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Contains", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "EndsWith", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "IndexOf", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "LastIndexOf", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Trim", kind: GrammarKind.functionEmpty, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Insert", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Replace", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Remove", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "ToLower", kind: GrammarKind.functionEmpty, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "ToUpper", kind: GrammarKind.functionEmpty, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "StartsWith", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "PadLeft", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "PadRight", kind: GrammarKind.function, description: "String function" }),
    new GrammarEntity({ dot: -1, key: "Length", kind: GrammarKind.constant, description: "String function" }),


    new GrammarEntity({ dot: 1, key: "Fcs.SteelLib", kind: GrammarKind.module }),

    new GrammarEntity({ dot: 2, key: "Fcs.SteelLib.Design", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.BendingAxial.RunBendingAxialCheck", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Buckling.RunBucklingCheckY", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Buckling.RunBucklingCheckZ", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Compression.RunCompressionCheck", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Moment.RunMomentAxisCheck", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Moment.RunMomentCheck", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Shear.RunShearCheckY", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Shear.RunShearCheckZ", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Design.Tension.RunTensionCheck", kind: GrammarKind.function }),

    new GrammarEntity({ dot: 2, key: "Fcs.SteelLib.Sections", kind: GrammarKind.module }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.CircleSection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.CircleSection.GetPropertiesCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.CircleSection.GetPropertiesTube", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.CircleSection.GetPropertiesTubeCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Csection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Csection.GetPropertiesCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.IpeSection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.IpeSection.GetPropertiesCustomMateria", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Materials.CreateNormalMaterialProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Properties.ByName", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.RectangleSection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.RectangleSection.GetPropertiesCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.RibSection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.RibSection.GetPropertiesWithZet", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Shape.GetZet", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.ThinSection.CombineGeometries", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.ThinSection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.ThinSection.Reflection", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.CreateGeometry", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.CreateGeometryCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.CreateSection", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesCC12", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesCC30", kind: GrammarKind.constant }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesLee", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesLeeCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesRhs", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesRhsCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesStiffener", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetPropertiesStiffenerLam", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.UniversalThinSection.GetSectionStiffener", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Usection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Usection.GetPropertiesCustomMaterial", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Zsection.GetProperties", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Zsection.GetPropertiesLaminate", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Zsection.GetSection", kind: GrammarKind.function }),
    new GrammarEntity({ dot: 3, key: "Fcs.SteelLib.Sections.Zsection.GetSectionCustomMaterial", kind: GrammarKind.function }),


];