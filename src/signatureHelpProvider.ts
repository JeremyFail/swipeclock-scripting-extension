import * as vscode from 'vscode';
import { globalFunctions } from './completionProvider';

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

// Build case-insensitive function lookup
const functionsMap = new Map<string, FunctionWithOverloads>();
globalFunctions.forEach(f => {
    functionsMap.set(f.name.toLowerCase(), f as FunctionWithOverloads);
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
    // Trim whitespace
    const trimmed = argsText.trim();
    if (!trimmed) return 'unknown';
    
    // Check if it starts with a quote (string)
    // Note: round() and time-rounding functions require a string (e.g. "N15" or "7:45am-8:00am=8:00am"); time literals like 7:00am are not valid for round.
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
        return 'string';
    }
    
    // Check if it starts with a digit or minus sign (number)
    if (/^[-+]?\d/.test(trimmed)) {
        return 'number';
    }
    
    // Check if it's a variable that might be a number (like hours, totalhours, etc.)
    const numVars = ['hours', 'minutes', 'seconds', 'totalhours', 'weekhours', 'pphours', 'hourstodate', 
                     'totalhoursot', 'hourstodateot', 'breakseconds', 'punchset'];
    const varMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (varMatch && numVars.includes(varMatch[1].toLowerCase())) {
        return 'number';
    }
    
    // Check if it's a variable that's likely a string (like department, category, etc.)
    const stringVars = ['department', 'location', 'category', 'firstname', 'lastname', 'title', 'code'];
    if (varMatch && stringVars.includes(varMatch[1].toLowerCase())) {
        return 'string';
    }
    
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
            
            // Find matching overload
            if (firstArgType !== 'unknown') {
                selectedOverload = fn.overloads.find(overload => 
                    overload.parameterTypes[0] === firstArgType
                ) || null;
            }
            
            // Build signatures for all overloads
            let activeSignatureIndex = 0;
            fn.overloads.forEach((overload, index) => {
                const paramNames = parseParametersFromSignature(overload.signature);
                const parameters: vscode.ParameterInformation[] = paramNames.map(name => ({
                    label: name,
                    documentation: new vscode.MarkdownString(overload.documentation)
                }));
                
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
            const parameters: vscode.ParameterInformation[] = paramNames.map(name => ({
                label: name,
                documentation: new vscode.MarkdownString(fn.documentation)
            }));

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
