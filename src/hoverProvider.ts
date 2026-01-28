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

const reportingPropsMap = new Map<string, { detail: string; documentation: string }>();
reportingDateProperties.forEach(p => {
    reportingPropsMap.set(p.name.toLowerCase(), { detail: p.detail, documentation: p.documentation });
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
                md.appendMarkdown(`**reportingdate.${word}** — \`${prop.detail}\`\n\n`);
                md.appendText(prop.documentation);
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
                fn.overloads.forEach((overload, index) => {
                    if (index > 0) md.appendMarkdown('\n---\n\n');
                    md.appendMarkdown(`*${overload.detail}*\n\n`);
                    md.appendCodeblock(overload.signature, 'swipeclock');
                    md.appendMarkdown('\n\n');
                    md.appendMarkdown(overload.documentation);
                });
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
