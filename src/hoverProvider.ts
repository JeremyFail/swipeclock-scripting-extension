import * as vscode from 'vscode';
import {
    employeeProperties,
    reportingDateProperties,
    globalFunctions,
    globalProperties
} from './completionProvider';

// Build lookup maps (case-insensitive)
const employeePropsMap = new Map<string, { detail: string; documentation: string }>();
employeeProperties.forEach(p => {
    employeePropsMap.set(p.name.toLowerCase(), { detail: p.detail, documentation: p.documentation });
});
for (let i = 1; i <= 9; i++) {
    ['department', 'location', 'home', 'payrate'].forEach(prefix => {
        const key = `${prefix}${i}`.toLowerCase();
        if (!employeePropsMap.has(key)) {
            employeePropsMap.set(key, {
                detail: 'string/number',
                documentation: `${prefix}${i} (may require account setting to be enabled)`
            });
        }
    });
}

interface MemberOverload {
    signature: string;
    detail: string;
    documentation: string;
}

const reportingPropsMap = new Map<string, { detail: string; documentation: string; overloads?: MemberOverload[] }>();
reportingDateProperties.forEach(p => {
    reportingPropsMap.set(p.name.toLowerCase(), {
        detail: p.detail,
        documentation: p.documentation,
        overloads: (p as any).overloads
    });
});

interface FunctionOverload {
    signature: string;
    detail: string;
    documentation: string;
    parameterTypes?: string[];
}

interface FunctionWithOverloads {
    signature: string;
    detail: string;
    documentation: string;
    overloads?: FunctionOverload[];
}

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

function getImmediateCallArgsFromLine(lineText: string, wordEndChar: number): string | null {
    const afterWord = lineText.substring(wordEndChar);
    const openMatch = afterWord.match(/^\s*\(/);
    if (!openMatch) return null;

    let depth = 0;
    let inString = false;
    let stringChar = '';
    let args = '';

    for (let i = openMatch[0].length - 1; i < afterWord.length; i++) {
        const ch = afterWord[i];

        if (!inString) {
            if (ch === '"' || ch === "'") {
                inString = true;
                stringChar = ch;
            } else if (ch === '(') {
                depth++;
                if (depth > 1) args += ch;
                continue;
            } else if (ch === ')') {
                depth--;
                if (depth === 0) return args;
            }
        } else if (ch === stringChar) {
            inString = false;
        }

        if (depth >= 1 && !(depth === 1 && ch === '(')) {
            args += ch;
        }
    }

    return null;
}

const functionsMap = new Map<string, FunctionWithOverloads>();
globalFunctions.forEach(f => {
    functionsMap.set(f.name.toLowerCase(), {
        signature: f.signature,
        detail: f.detail,
        documentation: f.documentation,
        overloads: (f as any).overloads
    });
});

const globalPropsMap = new Map<string, { detail: string; documentation: string }>();
globalProperties.forEach(p => {
    globalPropsMap.set(p.name.toLowerCase(), { detail: p.detail, documentation: p.documentation });
});

const objectDocs: Record<string, { detail: string; documentation: string }> = {
    employee: {
        detail: 'Global employee object',
        documentation: 'Access employee properties using **employee.**_propertyName_ (e.g. employee.department, employee.firstname).'
    },
    reportingdate: {
        detail: 'Global reportingdate object',
        documentation: 'Access reporting date/timecard properties using **reportingdate.**_propertyName_ (e.g. reportingdate.date, reportingdate.totalhours).'
    }
};

const operatorsMap = new Map<string, { detail: string; documentation: string }>([
    ['and', { detail: 'logical AND', documentation: 'Logical AND (also **&&**)' }],
    ['or', { detail: 'logical OR', documentation: 'Logical OR (also **||**)' }],
    ['&&', { detail: 'logical AND', documentation: 'Logical AND (also **and**)' }],
    ['||', { detail: 'logical OR', documentation: 'Logical OR (also **or**)' }],
    ['contains', { detail: 'string contains', documentation: 'Checks if the string contains another string. Example: `employee.department contains "OPS"`' }],
    ['startswith', { detail: 'string starts with', documentation: 'Checks if the string starts with another string.' }],
    ['endswith', { detail: 'string ends with', documentation: 'Checks if the string ends with another string.' }]
]);

/**
 * Provides documentation on hover for Swipeclock scripting properties and functions.
 */
export class SwipeclockHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return null;

        const word = document.getText(wordRange).toLowerCase();
        const lineText = document.lineAt(position).text;
        const prefix = lineText.substring(0, wordRange.start.character);

        // employee.<property>
        if (/employee\.\s*$/i.test(prefix)) {
            const prop = employeePropsMap.get(word);
            if (prop) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`**employee.${word}** — \`${prop.detail}\`\n\n`);
                md.appendText(prop.documentation);
                return new vscode.Hover(md, wordRange);
            }
        }

        // reportingdate.<property>
        if (/reportingdate\.\s*$/i.test(prefix)) {
            const prop = reportingPropsMap.get(word);
            if (prop) {
                const md = new vscode.MarkdownString();
                const suffix = lineText.substring(wordRange.end.character);
                const isFunctionCallContext = /^\s*\(/.test(suffix);

                if (prop.overloads && prop.overloads.length > 0) {
                    const selectedOverload = isFunctionCallContext
                        ? (prop.overloads.find(overload => overload.signature.includes('(')) ?? prop.overloads[0])
                        : (prop.overloads.find(overload => !overload.signature.includes('(')) ?? prop.overloads[0]);

                    md.appendMarkdown(`**reportingdate.${word}** — \`${prop.detail}\`\n\n`);
                    md.appendMarkdown(`*${selectedOverload.detail}*\n\n`);
                    md.appendCodeblock(selectedOverload.signature, 'swipeclock');
                    md.appendMarkdown('\n\n');
                    md.appendText(selectedOverload.documentation);
                } else {
                    md.appendMarkdown(`**reportingdate.${word}** — \`${prop.detail}\`\n\n`);
                    md.appendText(prop.documentation);
                }

                return new vscode.Hover(md, wordRange);
            }
        }

        // Global function
        const fn = functionsMap.get(word);
        if (fn) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**${word}**\n\n`);
            
            // If function has overloads, show all of them
            if (fn.overloads && fn.overloads.length > 0) {
                const argsText = getImmediateCallArgsFromLine(lineText, wordRange.end.character);
                if (argsText !== null) {
                    const firstArgType = detectFirstArgumentType(argsText);
                    const selectedOverload = firstArgType === 'unknown'
                        ? fn.overloads[0]
                        : (fn.overloads.find(overload => overload.parameterTypes?.[0] === firstArgType) ?? fn.overloads[0]);

                    md.appendMarkdown(`*${selectedOverload.detail}*\n\n`);
                    md.appendCodeblock(selectedOverload.signature, 'swipeclock');
                    md.appendMarkdown('\n\n');
                    md.appendMarkdown(selectedOverload.documentation);
                } else {
                    fn.overloads.forEach((overload, index) => {
                        if (index > 0) md.appendMarkdown('\n---\n\n');
                        md.appendMarkdown(`*${overload.detail}*\n\n`);
                        md.appendCodeblock(overload.signature, 'swipeclock');
                        md.appendMarkdown('\n\n');
                        md.appendMarkdown(overload.documentation);
                    });
                }
            } else {
                // No overloads - show default signature
                md.appendCodeblock(fn.signature, 'swipeclock');
                md.appendMarkdown('\n\n');
                md.appendText(fn.documentation);
            }
            
            return new vscode.Hover(md, wordRange);
        }

        // Global timecard property
        const gp = globalPropsMap.get(word);
        if (gp) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**${word}** — \`${gp.detail}\`\n\n`);
            md.appendText(gp.documentation);
            return new vscode.Hover(md, wordRange);
        }

        // employee / reportingdate (object names)
        const obj = objectDocs[word];
        if (obj) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**${word}** — ${obj.detail}\n\n`);
            md.appendMarkdown(obj.documentation);
            return new vscode.Hover(md, wordRange);
        }

        // Operators
        const op = operatorsMap.get(word);
        if (op) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**${word}** — ${op.detail}\n\n`);
            md.appendMarkdown(op.documentation);
            return new vscode.Hover(md, wordRange);
        }

        return null;
    }
}
