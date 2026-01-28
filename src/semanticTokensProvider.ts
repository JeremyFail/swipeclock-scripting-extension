import * as vscode from 'vscode';
import { employeeProperties, reportingDateProperties } from './completionProvider';

// Create sets of valid property names (case-insensitive)
const validEmployeeProperties = new Set(
  employeeProperties.map(p => p.name.toLowerCase())
);
const validReportingDateProperties = new Set(
  reportingDateProperties.map(p => p.name.toLowerCase())
);

// Add dynamic properties (department1-9, location1-9, etc.)
for (let i = 1; i <= 9; i++) {
  validEmployeeProperties.add(`department${i}`);
  validEmployeeProperties.add(`location${i}`);
  validEmployeeProperties.add(`home${i}`);
  validEmployeeProperties.add(`payrate${i}`);
}

const legend = new vscode.SemanticTokensLegend(
  [
    'variable',           // 0 - for variables (light blue)
    'property',          // 1 - for valid object properties (yellow)
    'variable.readonly', // 2 - for invalid properties (error/warning color)
    'function',          // 3 - for functions
    'class',             // 4 - for objects (employee, reportingdate)
  ],
  []
);

export class SwipeclockSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  get legend() {
    return legend;
  }

  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(this.legend);
    const text = document.getText();
    const lines = text.split('\n');

    // Keywords and functions to exclude from variable highlighting
    const reservedWords = new Set([
      'if', 'else', 'and', 'or', 'true', 'false', 'mod',
      'contains', 'startswith', 'endswith',
      'dateadd', 'dateserial', 'weekday', 'cdate', 'cdatetime', 'ctime',
      'day', 'month', 'year', 'val', 'cint', 'cstr', 'abs',
      'translate', 'within', 'left', 'right', 'mid',
      'round', 'roundin', 'roundout', 'roundends', 'roundtoschedule', 'roundup', 'rounddown',
      'addalert', 'unpay', 'touches', 'isedited', 'tomorrow', 'yesterday',
      'overlaps', 'overlap', 'addentry',
      'accrueup', 'accruedown', 'getbalance', 'setbalance',
      'employee', 'reportingdate',
      'payrate', 'isfirsttoday', 'islasttoday', 'hours', 'minutes', 'seconds',
      'breakseconds', 'minutesout', 'minutestil', 'punchset', 'category',
      'punchdate', 'intime', 'outtime', 'inismissing', 'outismissing',
      'istimes', 'ishours', 'ispayonly', 'inisedited', 'outisedited',
      'hourstopunch', 'hourstopunchot', 'linetonow', 'inip', 'outip'
    ]);

    // Regex patterns
    const objectPropertyPattern = /(employee|reportingdate)\.([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const localVariablePattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;

    // Track which positions we've already highlighted to avoid duplicates
    const highlightedRanges = new Set<string>();
    
    // Track block comment state across lines
    let inBlockComment = false;

    // Process each line
    lines.forEach((line, lineIndex) => {
      let lineToProcess = line;
      
      // Handle block comments (multi-line)
      if (inBlockComment) {
        // We're inside a block comment, find the end
        const blockCommentEnd = line.indexOf('*/');
        if (blockCommentEnd !== -1) {
          // Block comment ends on this line
          inBlockComment = false;
          lineToProcess = line.substring(blockCommentEnd + 2); // Skip past */
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
            lineToProcess = line.substring(0, blockCommentStart) + line.substring(blockCommentEnd + 2);
          } else {
            // Block comment starts but doesn't end on this line
            inBlockComment = true;
            lineToProcess = line.substring(0, blockCommentStart);
          }
        }
      }
      
      // Skip single-line comments
      const commentIndex = lineToProcess.indexOf('//');
      if (commentIndex !== -1) {
        // Only process the part before the comment
        lineToProcess = lineToProcess.substring(0, commentIndex);
      }
      
      // Match object properties (employee.property, reportingdate.property)
      let match;
      while ((match = objectPropertyPattern.exec(lineToProcess)) !== null) {
        const objectName = match[1].toLowerCase();
        const propertyName = match[2].toLowerCase();
        const startPos = match.index;
        const endPos = match.index + match[0].length;
        const rangeKey = `${lineIndex}:${startPos}:${endPos}`;

        if (highlightedRanges.has(rangeKey)) continue;
        highlightedRanges.add(rangeKey);

        // Check if property is valid
        const isValid = objectName === 'employee'
          ? validEmployeeProperties.has(propertyName)
          : validReportingDateProperties.has(propertyName);

        // Highlight the object name (dark blue - already handled by grammar, but we can reinforce)
        builder.push(
          lineIndex,
          startPos,
          objectName.length,
          4, // class token type
          0  // no modifier
        );

        // Highlight the property name
        const propertyStart = startPos + objectName.length + 1; // +1 for the dot
        const propertyLength = propertyName.length;
        
        if (isValid) {
          // Valid property - yellow
          builder.push(
            lineIndex,
            propertyStart,
            propertyLength,
            1, // property token type
            0  // no modifier
          );
        } else {
          // Invalid property - error/warning color
          builder.push(
            lineIndex,
            propertyStart,
            propertyLength,
            2, // variable.readonly token type (will show as error)
            0  // no modifier
          );
        }
      }

      // Reset regex lastIndex for next pattern
      objectPropertyPattern.lastIndex = 0;

      // Match local variables ($variable)
      while ((match = localVariablePattern.exec(lineToProcess)) !== null) {
        const startPos = match.index;
        const varName = match[1].toLowerCase();
        const rangeKey = `${lineIndex}:${startPos}:${startPos + match[0].length}`;

        if (highlightedRanges.has(rangeKey)) continue;
        highlightedRanges.add(rangeKey);

        // Only highlight if not a reserved word
        if (!reservedWords.has(varName)) {
          // Highlight local variable (light blue)
          builder.push(
            lineIndex,
            startPos,
            match[0].length,
            0, // variable token type
            0  // no modifier
          );
        }
      }

      localVariablePattern.lastIndex = 0;

      // Match global variables (not starting with $, not keywords, not in object.property context)
      // This is more complex - we need to avoid matching keywords, functions, and object properties
      const globalVarPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
      while ((match = globalVarPattern.exec(lineToProcess)) !== null) {
        const startPos = match.index;
        const varName = match[0].toLowerCase();
        const rangeKey = `${lineIndex}:${startPos}:${startPos + match[0].length}`;

        // Skip if already highlighted
        if (highlightedRanges.has(rangeKey)) continue;

        // Skip if it's a reserved word
        if (reservedWords.has(varName)) continue;

        // Skip if it's part of an object property (employee.xxx or reportingdate.xxx)
        const beforeMatch = lineToProcess.substring(Math.max(0, startPos - 20), startPos);
        if (/(employee|reportingdate)\.$/i.test(beforeMatch)) continue;

        // Skip if it's followed by a dot (likely an object property access)
        const afterMatch = lineToProcess.substring(startPos + match[0].length, startPos + match[0].length + 1);
        if (afterMatch === '.') continue;

        // Skip if it's in quotes
        const beforeQuote = lineToProcess.substring(0, startPos);
        const afterQuote = lineToProcess.substring(startPos + match[0].length);
        const quotesBefore = (beforeQuote.match(/"/g) || []).length;
        const quotesAfter = (afterQuote.match(/"/g) || []).length;
        if (quotesBefore % 2 === 1 && quotesAfter % 2 === 1) continue;

        highlightedRanges.add(rangeKey);

        // Highlight global variable (light blue)
        builder.push(
          lineIndex,
          startPos,
          match[0].length,
          0, // variable token type
          0  // no modifier
        );
      }

      globalVarPattern.lastIndex = 0;
    });

    return builder.build();
  }
}

// Export the property sets for use elsewhere
export { validEmployeeProperties, validReportingDateProperties };
