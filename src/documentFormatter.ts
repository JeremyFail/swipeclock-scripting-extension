import * as vscode from 'vscode';

/**
 * Formats Swipeclock scripting documents.
 * Uses configurable indent size and JavaScript-style braces (opening brace on same line as if/else).
 */
export class SwipeclockDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        if (document.lineCount === 0) {
            return [];
        }

        const config = vscode.workspace.getConfiguration('swipeclock');
        // Use VS Code / file indentation first; fall back to extension setting then 4
        const indentSize = (options.tabSize && options.tabSize > 0)
            ? options.tabSize
            : (config.get<number>('formatting.indentSize') ?? 4);
        const braceStyle = config.get<string>('formatting.braceStyle', 'javascript');
        const useTabs = options.insertSpaces === false;
        const indent = useTabs ? '\t' : ' '.repeat(indentSize);

        const text = document.getText();
        const lines = text.split(/\r?\n/);

        const out: string[] = [];
        let depth = 0;
        let i = 0;

        let inBlockComment = false;

        /**
         * Normalize spacing in a line: remove spaces between parentheses and content
         * e.g., "func( param )" -> "func(param)"
         */
        function normalizeSpacing(line: string): string {
            // Remove spaces between ( and content, and between content and )
            // But preserve spaces inside strings and comments
            let result = '';
            let inString = false;
            let inComment = false;
            let stringChar = '';
            
            for (let j = 0; j < line.length; j++) {
                const c = line[j];
                const next = j < line.length - 1 ? line[j + 1] : '';
                const prev = j > 0 ? line[j - 1] : '';
                
                if (inComment) {
                    result += c;
                    continue;
                }
                
                if (!inString) {
                    if (c === '"' || c === "'") {
                        inString = true;
                        stringChar = c;
                        result += c;
                    } else if (c === '/' && next === '/') {
                        inComment = true;
                        result += c;
                    } else if (c === '(' && next === ' ') {
                        // Remove space after (
                        result += '(';
                    } else if (c === ' ' && prev === '(') {
                        // Skip space after (
                        continue;
                    } else if (c === ' ' && next === ')') {
                        // Skip space before )
                        continue;
                    } else if (c === ')' && prev === ' ') {
                        // Remove space before )
                        result += ')';
                    } else {
                        result += c;
                    }
                } else {
                    result += c;
                    if (c === stringChar && (j === 0 || line[j - 1] !== '\\')) {
                        inString = false;
                    }
                }
            }
            return result;
        }

        /**
         * Check if a function call starting at startIndex is multi-line
         * Returns { isMultiLine, endIndex } where endIndex is the line with the closing )
         */
        function isMultiLineFunctionCall(startIndex: number): { isMultiLine: boolean; endIndex: number } {
            if (startIndex >= lines.length) {
                return { isMultiLine: false, endIndex: startIndex };
            }
            
            const firstLine = lines[startIndex];
            let parenDepth = 0;
            let foundOpenParen = false;
            let inStr = false;
            let strChar = '';
            
            // Check if this line has an opening ( that's not closed on the same line
            for (let k = 0; k < firstLine.length; k++) {
                const c = firstLine[k];
                if (!inStr) {
                    if (c === '"' || c === "'") {
                        inStr = true;
                        strChar = c;
                    } else if (c === '(') {
                        parenDepth = 1;
                        foundOpenParen = true;
                    } else if (c === ')' && foundOpenParen) {
                        parenDepth = 0;
                        // Closed on same line - not multi-line
                        return { isMultiLine: false, endIndex: startIndex };
                    }
                } else if (c === strChar && (k === 0 || firstLine[k - 1] !== '\\')) {
                    inStr = false;
                }
            }
            
            if (!foundOpenParen || parenDepth === 0) {
                return { isMultiLine: false, endIndex: startIndex };
            }
            
            // Opening ( not closed on this line - find the closing )
            let j = startIndex + 1;
            while (j < lines.length) {
                const line = lines[j];
                inStr = false;
                strChar = '';
                
                for (let k = 0; k < line.length; k++) {
                    const c = line[k];
                    if (!inStr) {
                        if (c === '"' || c === "'") {
                            inStr = true;
                            strChar = c;
                        } else if (c === '(') {
                            parenDepth++;
                        } else if (c === ')') {
                            parenDepth--;
                            if (parenDepth === 0) {
                                // Found the closing )
                                return { isMultiLine: true, endIndex: j };
                            }
                        }
                    } else if (c === strChar && (k === 0 || line[k - 1] !== '\\')) {
                        inStr = false;
                    }
                }
                j++;
            }
            
            // Didn't find closing ) - treat as single line
            return { isMultiLine: false, endIndex: startIndex };
        }

        while (i < lines.length) {
            let line = lines[i];
            let trimmed = line.trim();

            // Preserve empty lines (only remove them when merging } with else)
            if (trimmed === '') {
                out.push('');
                i++;
                continue;
            }

            // Check if we're inside a block comment (don't parse braces)
            if (inBlockComment) {
                const endBlock = line.indexOf('*/');
                if (endBlock !== -1) {
                    inBlockComment = false;
                    const rest = line.substring(endBlock + 2).trimStart();
                    if (rest) {
                        out.push(indent.repeat(depth) + rest);
                    } else {
                        out.push(line.trim());
                    }
                } else {
                    out.push(line); // Preserve comment as-is
                }
                i++;
                continue;
            }

            // Check for start of block comment
            const blockStart = line.indexOf('/*');
            if (blockStart !== -1) {
                const blockEnd = line.indexOf('*/', blockStart + 2);
                if (blockEnd !== -1) {
                    inBlockComment = false;
                } else {
                    inBlockComment = true;
                }
                out.push(indent.repeat(depth) + trimmed);
                i++;
                continue;
            }

            // Normalize spacing (remove spaces between parentheses and content)
            trimmed = normalizeSpacing(trimmed);

            // Simple string/comment-aware brace count for this line (no full parse)
            let lineDepth = depth;
            let j = 0;
            let inStr = false;
            let strChar = '';
            let inLineComment = false;
            while (j < trimmed.length) {
                const c = trimmed[j];
                if (inLineComment) {
                    j++;
                    continue;
                }
                if (!inStr) {
                    if (c === '"' || c === "'") {
                        inStr = true;
                        strChar = c;
                    } else if (c === '/' && trimmed[j + 1] === '/') {
                        inLineComment = true;
                    } else if (c === '{') {
                        lineDepth++;
                    } else if (c === '}') {
                        lineDepth--;
                    }
                } else if (c === strChar && (j === 0 || trimmed[j - 1] !== '\\')) {
                    inStr = false;
                }
                j++;
            }

            // JavaScript-style: if/else if/else followed by only whitespace — next line should be { on same line
            const ifElseMatch = trimmed.match(/^(if|else\s+if|else)\s*(\([^)]*\))?\s*$/i);
            const nextLine = lines[i + 1];
            const nextTrimmed = nextLine ? nextLine.trim() : '';

            if (braceStyle === 'javascript' && ifElseMatch && nextTrimmed === '{') {
                // Merge opening brace onto same line (JavaScript style)
                const formatted = indent.repeat(depth) + ifElseMatch[1] + (ifElseMatch[2] || '') + ' {';
                out.push(formatted);
                depth = depth + 1; // We added one {
                i += 2; // Skip next line (the lone {)
                continue;
            }

            // Check if this is a standalone } and the next non-empty line is else/else if — merge them
            if (braceStyle === 'javascript' && trimmed === '}') {
                // Look ahead for next non-empty line (skip blank lines)
                let lookAhead = i + 1;
                let nextNonEmpty = '';
                let nextNonEmptyIndex = -1;
                let foundComment = false;
                let commentIndex = -1;
                
                while (lookAhead < lines.length) {
                    const aheadTrimmed = lines[lookAhead].trim();
                    if (aheadTrimmed === '') {
                        lookAhead++;
                    } else {
                        // Check if this line is a comment
                        if (aheadTrimmed.startsWith('//') || aheadTrimmed.startsWith('/*')) {
                            foundComment = true;
                            commentIndex = lookAhead;
                            // Continue looking past the comment for else/else if
                            lookAhead++;
                            continue;
                        } else {
                            nextNonEmpty = normalizeSpacing(aheadTrimmed);
                            nextNonEmptyIndex = lookAhead;
                            break;
                        }
                    }
                }

                // Check if next non-empty line is else or else if
                const elseMatch = nextNonEmpty.match(/^(else\s+if|else)\s*(\([^)]*\))?\s*(\{)?\s*$/i);
                if (elseMatch) {
                    if (foundComment) {
                        // There's a comment between } and else - don't merge, just fix indentation
                        // Output the } with correct indentation
                        const indentLevel = Math.max(0, depth - 1);
                        out.push(indent.repeat(indentLevel) + '}');
                        depth = depth - 1;
                        
                        // Output blank lines between } and comment (preserve them)
                        for (let blankIdx = i + 1; blankIdx < commentIndex; blankIdx++) {
                            out.push('');
                        }
                        
                        // Output the comment as-is (preserve it)
                        if (commentIndex >= 0) {
                            out.push(lines[commentIndex]);
                        }
                        
                        // Output blank lines between comment and else (preserve them)
                        for (let blankIdx = commentIndex + 1; blankIdx < nextNonEmptyIndex; blankIdx++) {
                            out.push('');
                        }
                        
                        // Output the else with correct indentation (but don't merge with })
                        const elseIndentLevel = Math.max(0, depth);
                        let elseFormatted = elseMatch[1];
                        if (elseMatch[2]) {
                            elseFormatted += elseMatch[2];
                        }
                        
                        // Check if there's a { on the same line or next line
                        if (elseMatch[3] === '{') {
                            elseFormatted += ' {';
                            out.push(indent.repeat(elseIndentLevel) + elseFormatted);
                            depth = depth + 1; // { opens one
                            i = nextNonEmptyIndex + 1;
                            continue;
                        } else {
                            // Check if next line after else is just {
                            let afterElseLookAhead = nextNonEmptyIndex + 1;
                            while (afterElseLookAhead < lines.length && lines[afterElseLookAhead].trim() === '') {
                                afterElseLookAhead++;
                            }
                            const afterElseLine = lines[afterElseLookAhead];
                            const afterElseTrimmed = afterElseLine ? normalizeSpacing(afterElseLine.trim()) : '';
                            if (afterElseTrimmed === '{') {
                                elseFormatted += ' {';
                                out.push(indent.repeat(elseIndentLevel) + elseFormatted);
                                depth = depth + 1; // { opens one
                                i = afterElseLookAhead + 1;
                                continue;
                            } else {
                                // No { yet
                                out.push(indent.repeat(elseIndentLevel) + elseFormatted);
                                i = nextNonEmptyIndex + 1;
                                continue;
                            }
                        }
                    } else {
                        // No comment - safe to merge } with else/else if
                        const indentLevel = Math.max(0, depth - 1);
                        let merged = '} ' + elseMatch[1];
                        if (elseMatch[2]) {
                            merged += elseMatch[2];
                        }
                        // Check if there's a { on the same line or next line
                        if (elseMatch[3] === '{') {
                            // { is on same line as else - ensure space before {
                            merged += ' {';
                            out.push(indent.repeat(indentLevel) + merged);
                            // } closes one, { opens one, so depth stays the same
                            depth = depth;
                            i = nextNonEmptyIndex + 1; // Skip all the lines we merged (including blank lines)
                            continue;
                        } else {
                            // Check if next line after else is just {
                            let afterElseLookAhead = nextNonEmptyIndex + 1;
                            while (afterElseLookAhead < lines.length && lines[afterElseLookAhead].trim() === '') {
                                afterElseLookAhead++;
                            }
                            const afterElseLine = lines[afterElseLookAhead];
                            const afterElseTrimmed = afterElseLine ? normalizeSpacing(afterElseLine.trim()) : '';
                            if (afterElseTrimmed === '{') {
                                merged += ' {';
                                out.push(indent.repeat(indentLevel) + merged);
                                // } closes one, { opens one, so depth stays the same
                                depth = depth;
                                i = afterElseLookAhead + 1; // Skip blank lines, else line, and { line
                                continue;
                            } else {
                                // No { yet, just output } else (shouldn't happen in practice, but handle it)
                                out.push(indent.repeat(indentLevel) + merged);
                                depth = depth - 1; // We closed with }
                                i = nextNonEmptyIndex + 1; // Skip blank lines and else line
                                continue;
                            }
                        }
                    }
                }
            }

            // Handle multi-line function calls
            const funcCallMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
            if (funcCallMatch) {
                const multiLineInfo = isMultiLineFunctionCall(i);
                if (multiLineInfo.isMultiLine) {
                    // This is a multi-line function call - format it
                    const funcName = funcCallMatch[1];
                    const callDepth = depth;
                    
                    // Output the function name and opening ( (normalized spacing)
                    out.push(indent.repeat(callDepth) + funcName + '(');
                    const innerIndent = callDepth + 1; // Indent content inside parentheses
                    
                    // Process lines until we find the closing )
                    i++;
                    while (i <= multiLineInfo.endIndex && i < lines.length) {
                        const innerLine = lines[i];
                        const innerTrimmed = normalizeSpacing(innerLine.trim());
                        
                        if (innerTrimmed === '') {
                            i++;
                            continue; // Skip blank lines in function calls
                        }
                        
                        // Check if this is the closing )
                        if (innerTrimmed === ')') {
                            // Output closing ) at the same indent as the function call
                            out.push(indent.repeat(callDepth) + ')');
                            depth = callDepth; // Reset depth to call depth
                            i++;
                            break;
                        } else {
                            // Content inside parentheses - indent it
                            out.push(indent.repeat(innerIndent) + innerTrimmed);
                            // Update depth based on braces in this line (for nested structures)
                            let innerDepth = innerIndent;
                            let inStr2 = false;
                            let strChar2 = '';
                            for (let k = 0; k < innerTrimmed.length; k++) {
                                const c = innerTrimmed[k];
                                if (!inStr2) {
                                    if (c === '"' || c === "'") {
                                        inStr2 = true;
                                        strChar2 = c;
                                    } else if (c === '{') {
                                        innerDepth++;
                                    } else if (c === '}') {
                                        innerDepth--;
                                    }
                                } else if (c === strChar2 && (k === 0 || innerTrimmed[k - 1] !== '\\')) {
                                    inStr2 = false;
                                }
                            }
                            depth = innerDepth;
                            i++;
                        }
                    }
                    continue;
                }
            }

            // Normalize spacing around braces: ensure space before { when appropriate
            if (braceStyle === 'javascript') {
                // Ensure space before { if it's after a keyword/identifier and not already there
                trimmed = trimmed.replace(/(\w)\s*\{/g, '$1 {');
                // Ensure space after } before else/else if
                trimmed = trimmed.replace(/\}\s*(else\s+if|else)/gi, '} $1');
            }

            // Lines that start with } close a block — indent at depth-1 (outdent the closing brace)
            const indentLevel = trimmed.startsWith('}') ? Math.max(0, depth - 1) : depth;
            out.push(indent.repeat(indentLevel) + trimmed);

            // Update depth for next line (net of { and } on this line)
            depth = lineDepth;

            i++;
        }

        const newText = out.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(0, 0, document.lineCount - 1, lastLine.range.end.character);
        return [vscode.TextEdit.replace(fullRange, newText)];
    }
}
