import * as vscode from 'vscode';
import { employeeProperties, reportingDateProperties, globalFunctions } from './completionProvider';

// Create sets of valid property names (case-insensitive)
const validEmployeeProperties = new Set(
    employeeProperties.map(p => p.name.toLowerCase())
);
const validReportingDateProperties = new Set(
    reportingDateProperties.map(p => p.name.toLowerCase())
);

// Create set of valid function names (case-insensitive)
const validFunctions = new Set(
    globalFunctions.map(f => f.name.toLowerCase())
);

const configureExtendedFieldsSettingUri = vscode.Uri.parse(
    `command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify(['swipeclock.warnExtendedFields']))}`
);

// Reserved words that are not variables
const reservedWords = new Set([
    'if', 'else', 'and', 'or', 'true', 'false', 'mod',
    'contains', 'startswith', 'endswith',
    'dateadd', 'dateserial', 'weekday', 'cdate', 'cdatetime', 'ctime',
    'day', 'month', 'year', 'val', 'isdate', 'cint', 'cstr', 'abs',
    'translate', 'within', 'left', 'right', 'mid',
    'round', 'roundin', 'roundout', 'roundends', 'roundtoschedule', 'roundup', 'rounddown',
    'addalert', 'unpay', 'touches', 'isedited', 'tomorrow', 'yesterday',
    'overlaps', 'overlap', 'addentry',
    'accrueup', 'accruedown', 'isbucket', 'getbalance', 'setbalance',
    'employee', 'reportingdate',
    'payrate', 'isfirsttoday', 'islasttoday', 'hours', 'minutes', 'seconds',
    'breakseconds', 'minutesout', 'minutestil', 'punchset', 'category',
    'punchdate', 'intime', 'outtime', 'inismissing', 'outismissing',
    'istimes', 'ishours', 'ispayonly', 'inisedited', 'outisedited',
    'hourstopunch', 'hourstopunchot', 'linetonow', 'inip', 'outip'
]);

function maskQuotedSegments(line: string): { maskedLine: string; invalidSingleQuotedRanges: Array<{ start: number; end: number }> } {
    const chars = line.split('');
    const invalidSingleQuotedRanges: Array<{ start: number; end: number }> = [];

    let inDouble = false;
    let inSingle = false;
    let singleStart = -1;

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const prev = i > 0 ? chars[i - 1] : '';

        if (inDouble) {
            chars[i] = ' ';
            if (ch === '"' && prev !== '\\') {
                inDouble = false;
            }
            continue;
        }

        if (inSingle) {
            chars[i] = ' ';
            if (ch === '\'' && prev !== '\\') {
                inSingle = false;
                invalidSingleQuotedRanges.push({ start: singleStart, end: i + 1 });
                singleStart = -1;
            }
            continue;
        }

        if (ch === '"') {
            inDouble = true;
            chars[i] = ' ';
            continue;
        }

        if (ch === '\'') {
            inSingle = true;
            singleStart = i;
            chars[i] = ' ';
        }
    }

    if (inSingle && singleStart >= 0) {
        invalidSingleQuotedRanges.push({ start: singleStart, end: chars.length });
    }

    return {
        maskedLine: chars.join(''),
        invalidSingleQuotedRanges
    };
}

export class SwipeclockDiagnosticsProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('swipeclock');
    }

    public updateDiagnostics(document: vscode.TextDocument): void {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        // Get configuration
        const config = vscode.workspace.getConfiguration('swipeclock');
        const warnExtendedFields = config.get<boolean>('warnExtendedFields', true);

        // Track variable assignments (both local $var and global var)
        const assignedVariables = new Set<string>();
        const variableUsages: Array<{ name: string; line: number; column: number; length?: number }> = [];

        // First pass: collect all variable assignments and usages
        let inBlockComment = false;
        lines.forEach((line, lineIndex) => {
            let lineToCheck = line;
            let match: RegExpExecArray | null; // Declare match once for reuse
            
            // Handle block comments (multi-line)
            if (inBlockComment) {
                // We're inside a block comment, find the end
                const blockCommentEnd = line.indexOf('*/');
                if (blockCommentEnd !== -1) {
                    // Block comment ends on this line
                    inBlockComment = false;
                    lineToCheck = line.substring(blockCommentEnd + 2); // Skip past */
                } else {
                    // Still inside block comment, skip entire line
                    return; // Skip processing this line entirely
                }
            } else {
                // Check for start of block comment
                const blockCommentStart = line.indexOf('/*');
                if (blockCommentStart !== -1) {
                    const blockCommentEnd = line.indexOf('*/', blockCommentStart + 2);
                    if (blockCommentEnd !== -1) {
                        // Block comment starts and ends on same line
                        lineToCheck = line.substring(0, blockCommentStart) + line.substring(blockCommentEnd + 2);
                    } else {
                        // Block comment starts but doesn't end on this line
                        inBlockComment = true;
                        lineToCheck = line.substring(0, blockCommentStart);
                    }
                }
            }
            
            // Skip single-line comments
            const commentIndex = lineToCheck.indexOf('//');
            if (commentIndex !== -1) {
                lineToCheck = lineToCheck.substring(0, commentIndex);
            }

            const { maskedLine, invalidSingleQuotedRanges } = maskQuotedSegments(lineToCheck);
            invalidSingleQuotedRanges.forEach(rangeInfo => {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineIndex, rangeInfo.start, lineIndex, rangeInfo.end),
                    'Single-quoted strings are invalid in Swipeclock scripting. Use double quotes (") for strings.',
                    vscode.DiagnosticSeverity.Error
                ));
            });
            lineToCheck = maskedLine;

            // Check for invalid object properties (employee.* and reportingdate.*)
            const objectPropertyPattern = /(employee|reportingdate)\.([a-zA-Z_][a-zA-Z0-9_]*)/gi;
            while ((match = objectPropertyPattern.exec(lineToCheck)) !== null) {
                const objectName = match[1].toLowerCase();
                const propertyName = match[2].toLowerCase();
                const startPos = match.index;
                const propertyStart = startPos + objectName.length + 1; // +1 for the dot
                
                // Check for extended fields pattern (homeX, departmentX, locationX, payrateX)
                const extendedFieldMatch = propertyName.match(/^(home|department|location|payrate)(\d+)$/);
                
                if (extendedFieldMatch) {
                    const fieldType = extendedFieldMatch[1];
                    const fieldNumber = parseInt(extendedFieldMatch[2]);
                    
                    // Check if beyond 9 (error)
                    if (fieldNumber > 9) {
                        const range = new vscode.Range(
                            lineIndex,
                            propertyStart,
                            lineIndex,
                            propertyStart + propertyName.length
                        );
                        
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `${fieldType}${fieldNumber} is beyond the officially supported limit of 9.`,
                            vscode.DiagnosticSeverity.Error
                        );
                        
                        diagnostics.push(diagnostic);
                    } else if (warnExtendedFields) {
                        // Check if it needs to be enabled (warning)
                        let shouldWarn = false;
                        let message = '';
                        
                        if (fieldType === 'home' && fieldNumber > 3) {
                            shouldWarn = true;
                            message = `home${fieldNumber} requires additional home fields to be enabled in the client's account settings.`;
                        } else if ((fieldType === 'department' || fieldType === 'location' || fieldType === 'payrate') && fieldNumber > 0) {
                            shouldWarn = true;
                            message = `${fieldType}${fieldNumber} requires additional ${fieldType} fields to be enabled in the client's account settings.`;
                        }
                        
                        if (shouldWarn) {
                            const range = new vscode.Range(
                                lineIndex,
                                propertyStart,
                                lineIndex,
                                propertyStart + propertyName.length
                            );
                            
                            const diagnostic = new vscode.Diagnostic(
                                range,
                                message,
                                vscode.DiagnosticSeverity.Warning
                            );
                            diagnostic.source = 'Configure warning';
                            diagnostic.code = {
                                value: 'swipeclock.extendedFieldWarning',
                                target: configureExtendedFieldsSettingUri
                            };
                            
                            diagnostics.push(diagnostic);
                        }
                    }
                } else {
                    // Check if property is valid (not an extended field)
                    const isValid = objectName === 'employee'
                        ? validEmployeeProperties.has(propertyName)
                        : validReportingDateProperties.has(propertyName);
                    
                    if (!isValid) {
                        // Invalid property - show error
                        const range = new vscode.Range(
                            lineIndex,
                            propertyStart,
                            lineIndex,
                            propertyStart + propertyName.length
                        );
                        
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `Invalid property '${propertyName}' on the ${objectName} object.`,
                            vscode.DiagnosticSeverity.Error
                        );
                        
                        diagnostics.push(diagnostic);
                    }
                }
            }
            
            // Reset regex lastIndex
            objectPropertyPattern.lastIndex = 0;

            // Check for invalid function calls
            const functionCallPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi;
            while ((match = functionCallPattern.exec(lineToCheck)) !== null) {
                const functionName = match[1].toLowerCase();
                const startPos = match.index;
                
                // Skip if it's a reserved word or operator
                if (reservedWords.has(functionName)) continue;
                
                // Skip if it's part of object.property syntax (e.g., employee.someMethod())
                const beforeMatch = lineToCheck.substring(Math.max(0, startPos - 20), startPos);
                if (/(employee|reportingdate)\.$/i.test(beforeMatch)) continue;
                
                // Check if function is valid
                if (!validFunctions.has(functionName)) {
                    const range = new vscode.Range(
                        lineIndex,
                        startPos,
                        lineIndex,
                        startPos + functionName.length
                    );
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unrecognized function '${functionName}'. This function does not exist in Swipeclock scripting.`,
                        vscode.DiagnosticSeverity.Error
                    );
                    
                    diagnostics.push(diagnostic);
                }
            }
            
            // Reset regex lastIndex
            functionCallPattern.lastIndex = 0;

            // Match variable assignments: $var = ... or var = ... (capture full name including $ so local/global are distinct)
            const assignmentPattern = /(\$[a-zA-Z_][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi;
            while ((match = assignmentPattern.exec(lineToCheck)) !== null) {
                const varName = match[1].toLowerCase();
                if (!reservedWords.has(varName) &&
                    !reservedWords.has(varName.replace(/^\$/, '')) &&
                    !varName.startsWith('employee.') &&
                    !varName.startsWith('reportingdate.')) {
                    assignedVariables.add(varName);
                }
            }

            // Match variable usages: match $var and (separately) var so we don't match "definedLocal" inside "$definedLocal"
            // 1) Local variables: $identifier
            const localVarPattern = /(\$[a-zA-Z_][a-zA-Z0-9_]*)/gi;
            while ((match = localVarPattern.exec(lineToCheck)) !== null) {
                const varName = match[1].toLowerCase();
                const matchIndex = match.index;
                if (reservedWords.has(varName.replace(/^\$/, ''))) continue;

                const beforeMatch = lineToCheck.substring(Math.max(0, matchIndex - 20), matchIndex);
                if (/(employee|reportingdate)\.$/i.test(beforeMatch)) continue;

                const afterMatch = lineToCheck.substring(matchIndex + match[0].length);
                if (afterMatch.startsWith('.')) continue;
                if (/^\s*\(/.test(afterMatch)) continue;

                const equalsIndex = lineToCheck.indexOf('=', matchIndex);
                if (equalsIndex !== -1) {
                    const beforeEquals = lineToCheck.substring(matchIndex, equalsIndex);
                    if (!beforeEquals.includes('==') && !beforeEquals.includes('!=') && !beforeEquals.includes('<>')) continue;
                }
                variableUsages.push({ name: varName, line: lineIndex, column: matchIndex, length: match[0].length });
            }
            // 2) Global variables: identifier not preceded by $ (so we don't double-match the name part of $var)
            const globalVarPattern = /(?<!\$)\b([a-zA-Z_][a-zA-Z0-9_]*)\b/gi;
            while ((match = globalVarPattern.exec(lineToCheck)) !== null) {
                const varName = match[1].toLowerCase();
                const matchIndex = match.index;
                if (reservedWords.has(varName)) continue;

                const beforeMatch = lineToCheck.substring(Math.max(0, matchIndex - 20), matchIndex);
                if (/(employee|reportingdate)\.$/i.test(beforeMatch)) continue;
                const afterMatch = lineToCheck.substring(matchIndex + match[0].length);
                if (afterMatch.startsWith('.')) continue;
                if (/^\s*\(/.test(afterMatch)) continue;
                
                const equalsIndex = lineToCheck.indexOf('=', matchIndex);
                if (equalsIndex !== -1) {
                    const beforeEquals = lineToCheck.substring(matchIndex, equalsIndex);
                    if (!beforeEquals.includes('==') && !beforeEquals.includes('!=') && !beforeEquals.includes('<>')) continue;
                }
                variableUsages.push({ name: varName, line: lineIndex, column: matchIndex, length: match[0].length });
            }
        });

        // Second pass: check for undefined variables
        variableUsages.forEach(usage => {
            if (!assignedVariables.has(usage.name)) {
                const len = usage.length ?? usage.name.length;
                const range = new vscode.Range(
                    usage.line,
                    usage.column,
                    usage.line,
                    usage.column + len
                );
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Variable '${usage.name}' may be undefined. Consider assigning it before use.`,
                    vscode.DiagnosticSeverity.Warning
                );
                
                diagnostics.push(diagnostic);
            }
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
}
