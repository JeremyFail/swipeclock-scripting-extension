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

        while (i < lines.length) {
            let line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines but preserve them with current indent
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
                if (blockEnd === -1) {
                    inBlockComment = true;
                }
                out.push(indent.repeat(depth) + trimmed);
                i++;
                continue;
            }

            // Simple string/comment-aware brace count for this line (no full parse)
            let lineDepth = depth;
            let j = 0;
            let inStr = false;
            let strChar = '';
            let inLineComment = false;
            while (j < line.length) {
                const c = line[j];
                if (inLineComment) {
                    j++;
                    continue;
                }
                if (!inStr) {
                    if (c === '"' || c === "'") {
                        inStr = true;
                        strChar = c;
                    } else if (c === '/' && line[j + 1] === '/') {
                        inLineComment = true;
                    } else if (c === '{') {
                        lineDepth++;
                    } else if (c === '}') {
                        lineDepth--;
                    }
                } else if (c === strChar && (j === 0 || line[j - 1] !== '\\')) {
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

            // Standalone closing brace — decrease indent before printing
            if (trimmed === '}') {
                depth = Math.max(0, depth - 1);
            }

            out.push(indent.repeat(depth) + trimmed);

            if (trimmed === '}') {
                // Already decreased above
            } else {
                depth = lineDepth;
            }

            i++;
        }

        const newText = out.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(0, 0, document.lineCount - 1, lastLine.range.end.character);
        return [vscode.TextEdit.replace(fullRange, newText)];
    }
}
