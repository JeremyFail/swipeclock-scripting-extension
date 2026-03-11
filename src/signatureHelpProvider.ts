import * as vscode from 'vscode';
import { globalFunctions, reportingDateProperties } from './completionProvider';

// Type for function overload
interface FunctionOverload {
    signature: string;
    detail: string;
    documentation: string;
    parameterTypes: string[];
}

// Extended function type with optional overloads
interface FunctionWithOverloads {
    name: string;
    signature: string;
    detail: string;
    documentation: string;
    overloads?: FunctionOverload[];
}

interface MemberFunctionSignature {
    signature: string;
    documentation: string;
}

// Build case-insensitive function lookup
const functionsMap = new Map<string, FunctionWithOverloads>();
globalFunctions.forEach(f => {
    functionsMap.set(f.name.toLowerCase(), f as FunctionWithOverloads);
});

const reportingDateFunctionMap = new Map<string, MemberFunctionSignature[]>();
reportingDateProperties.forEach(prop => {
    const propAny = prop as any;
    const overloads = propAny.overloads as Array<{ signature: string; documentation: string }> | undefined;
    if (!overloads || overloads.length === 0) return;

    const callableOverloads = overloads
        .filter(overload => overload.signature.includes('('))
        .map(overload => ({
            signature: overload.signature,
            documentation: overload.documentation
        }));

    if (callableOverloads.length > 0) {
        reportingDateFunctionMap.set(prop.name.toLowerCase(), callableOverloads);
    }
});

/**
 * Parse parameter names from a signature string like "addalert(message)" or "translate(field, list1, list2)".
 */
function parseParametersFromSignature(signature: string): string[] {
    const match = signature.match(/\(([^)]*)\)/);
    if (!match) return [];
    const inner = match[1].trim();
    if (!inner) return [];
    // Split by comma, but be careful of nested parens in strings - keep it simple: split by comma
    return inner.split(',').map(s => s.trim());
}

/**
 * Detect the type of the first argument in the function call.
 * Returns 'string', 'number', or 'unknown'.
 */
function detectFirstArgumentType(argsText: string): 'string' | 'number' | 'unknown' {
    const text = argsText.trim();
    if (!text) return 'unknown';

    let inString = false;
    let stringChar = '';
    let depth = 0;
    let firstArg = '';

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (!inString) {
            if (ch === '"' || ch === "'") {
                inString = true;
                stringChar = ch;
            } else if (ch === '(') {
                depth++;
            } else if (ch === ')') {
                if (depth > 0) depth--;
            } else if (ch === ',' && depth === 0) {
                break;
            }
        } else if (ch === stringChar && text[i - 1] !== '\\') {
            inString = false;
        }
        firstArg += ch;
    }

    const first = firstArg.trim();
    if (!first) return 'unknown';
    if (first.startsWith('"') || first.startsWith("'")) return 'string';
    if (/^[-+]?\d+(\.\d+)?$/.test(first)) return 'number';
    return 'unknown';
}

/**
 * Represents a signature help provider for Swipeclock scripting.
 */
export class SwipeclockSignatureHelpProvider implements vscode.SignatureHelpProvider {
    public static readonly triggerCharacters = ['(', ','];

    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        const lineText = document.lineAt(position).text;
        const prefix = lineText.substring(0, position.character);

        // Find the matching opening paren: walk backwards, count parens to find the one that opens this call
        let depth = 0;
        let callStart = -1;
        for (let i = prefix.length - 1; i >= 0; i--) {
            const ch = prefix[i];
            if (ch === ')') depth++;
            else if (ch === '(') {
                if (depth === 0) {
                    callStart = i;
                    break;
                }
                depth--;
            }
        }
        if (callStart === -1) return null;

        // Function name is the word immediately before '('
        const beforeParen = prefix.substring(0, callStart);
        const nameMatch = beforeParen.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        if (!nameMatch) return null;

        const functionName = nameMatch[1].toLowerCase();

        // reportingdate.<member>(...) overload-style signatures
        const objectMemberMatch = beforeParen.match(/(employee|reportingdate)\.\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$/i);
        if (objectMemberMatch) {
            const objectName = objectMemberMatch[1].toLowerCase();
            const memberName = objectMemberMatch[2].toLowerCase();
            if (objectName === 'reportingdate') {
                const memberSignatures = reportingDateFunctionMap.get(memberName);
                if (memberSignatures && memberSignatures.length > 0) {
                    const argsSoFar = prefix.substring(callStart + 1, prefix.length);
                    let activeParameter = 0;
                    let inString = false;
                    let stringChar = '';
                    for (let i = 0; i < argsSoFar.length; i++) {
                        const c = argsSoFar[i];
                        if (!inString) {
                            if (c === '"' || c === "'") {
                                inString = true;
                                stringChar = c;
                            } else if (c === ',') {
                                activeParameter++;
                            }
                        } else if (c === stringChar && (i === 0 || argsSoFar[i - 1] !== '\\')) {
                            inString = false;
                        }
                    }

                    const signatures = memberSignatures.map(sigInfo => {
                        const paramNames = parseParametersFromSignature(sigInfo.signature);
                        const parameters: vscode.ParameterInformation[] = paramNames.map(
                            name => new vscode.ParameterInformation(name)
                        );

                        const sig = new vscode.SignatureInformation(
                            sigInfo.signature,
                            new vscode.MarkdownString(sigInfo.documentation)
                        );
                        sig.parameters = parameters;
                        return sig;
                    });

                    const help = new vscode.SignatureHelp();
                    help.signatures = signatures;
                    help.activeSignature = 0;
                    help.activeParameter = Math.min(activeParameter, Math.max(0, signatures[0]?.parameters.length - 1 || 0));
                    return help;
                }
            }
        }

        const fn = functionsMap.get(functionName);
        if (!fn) return null;

        // Get arguments text so far
        const argsSoFar = prefix.substring(callStart + 1, prefix.length);
        
        // Count commas between ( and cursor to get active parameter index
        let activeParameter = 0;
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < argsSoFar.length; i++) {
            const c = argsSoFar[i];
            if (!inString) {
                if (c === '"' || c === "'") {
                    inString = true;
                    stringChar = c;
                } else if (c === ',') {
                    activeParameter++;
                }
            } else if (c === stringChar && (i === 0 || argsSoFar[i - 1] !== '\\')) {
                inString = false;
            }
        }

        // If function has overloads, detect which one to use based on first argument type
        let selectedOverload: FunctionOverload | null = null;
        let signatures: vscode.SignatureInformation[] = [];
        
        if (fn.overloads && fn.overloads.length > 0) {
            // Detect the type of the first argument
            const firstArgType = detectFirstArgumentType(argsSoFar);
            
            // Find matching overload by first argument type
            if (firstArgType !== 'unknown') {
                selectedOverload = fn.overloads.find(overload => 
                    overload.parameterTypes[0] === firstArgType
                ) || null;
            }
            
            // If still unknown (e.g. split with time arg), pick by argument count
            if (!selectedOverload && argsSoFar.trim()) {
                const argCount = argsSoFar.split(',').length;
                selectedOverload = fn.overloads.find(overload => 
                    overload.parameterTypes.length === argCount
                ) || fn.overloads.find(overload => 
                    overload.parameterTypes.length >= argCount
                ) || null;
            }
            
            // Build signatures for all overloads
            let activeSignatureIndex = 0;
            fn.overloads.forEach((overload, index) => {
                const paramNames = parseParametersFromSignature(overload.signature);
                const parameters: vscode.ParameterInformation[] = paramNames.map(
                    name => new vscode.ParameterInformation(name)
                );
                
                const sig = new vscode.SignatureInformation(
                    overload.signature,
                    new vscode.MarkdownString(overload.documentation)
                );
                sig.parameters = parameters;
                signatures.push(sig);
                
                // If this is the selected overload, mark it as active
                if (selectedOverload === overload) {
                    activeSignatureIndex = index;
                }
            });
            
            // If we couldn't detect the type, default to first overload
            if (!selectedOverload && signatures.length > 0) {
                activeSignatureIndex = 0;
            }
            
            const help = new vscode.SignatureHelp();
            help.signatures = signatures;
            help.activeSignature = activeSignatureIndex;
            help.activeParameter = Math.min(activeParameter, Math.max(0, signatures[activeSignatureIndex]?.parameters.length - 1 || 0));
            
            return help;
        } else {
            // No overloads - use default signature
            const paramNames = parseParametersFromSignature(fn.signature);
            const parameters: vscode.ParameterInformation[] = paramNames.map(
                name => new vscode.ParameterInformation(name)
            );

            const sig = new vscode.SignatureInformation(fn.signature, new vscode.MarkdownString(fn.documentation));
            sig.parameters = parameters;

            const help = new vscode.SignatureHelp();
            help.signatures = [sig];
            help.activeSignature = 0;
            help.activeParameter = Math.min(activeParameter, Math.max(0, paramNames.length - 1));

            return help;
        }
    }
}
