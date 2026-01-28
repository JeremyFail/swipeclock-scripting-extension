# Swipeclock Scripting Language Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

This VS Code extension provides syntax highlighting, IntelliSense, formatting, and diagnostics support for the custom scripting language used in Swipeclock's TimeWorksPlus and WorkforceHub products.

For documentation on how to write scripts, check the [Swipeclock Knowledge Base](https://supportcenter.payrollservers.info/), or contact Swipeclock Support.

> **IMPORTANT NOTE:**
>
> This extension is not supported, endorsed, or maintained by Swipeclock. Please submit any issues or suggestions for improvements on our [GitHub page](https://github.com/JeremyFail/swipeclock-scripting-extension).

## Features

- **Syntax Highlighting**: Full syntax highlighting for Swipeclock scripts including:
  - Comments (single-line `//` and multi-line `/* */`)
  - Strings (single and double quoted)
  - Time literals (e.g., `7:00am`, `19:00`, `7:00:00am`)
  - Numbers (integers and decimals)
  - Operators (logical, comparison, arithmetic, string)
  - Keywords (`if`, `else if`, `else`)
  - Object properties (`employee.*`, `reportingdate.*`)
  - Functions
  - Variables (global and local `$variables`)
  - Boolean literals

- **IntelliSense/Auto-completion**: Context-aware code completion including:
  - Object-based completions for `employee.*` and `reportingdate.*`
  - All global functions with signatures and documentation
  - Global timecard properties
  - Dynamic properties (department1-9, location1-9, home1-9, payrate1-9)
  - Operators and keywords

- **Hover Documentation**: Hover over any function, property, or operator to see detailed documentation with examples.

- **Signature Help**: When typing function calls, see parameter hints with the active parameter highlighted as you type.

- **Formatting**: Built-in document formatter (Format Document, e.g. `Alt+Shift+F`). Uses VS Code's editor indentation settings (tab size, spaces vs tabs), with fallback to 4 spaces. Configurable brace style via **Swipeclock Scripting** settings (`swipeclock.formatting.braceStyle`).

- **Error Detection & Diagnostics**:
  - Invalid object properties (e.g., `employee.invalidproperty`)
  - Unrecognized functions
  - Undefined variables (warnings)
  - Extended fields beyond official support (warnings for home4-9, department1-9, etc.)
  - Fields beyond limit of 9 (errors for home10+, department10+, etc.)

## Installation

1. Open VS Code
2. Press `F5` to open a new Extension Development Host window
3. In the new window, open a `.twp`, `.swipeclock`, `.wfhscript`, or other supported file
4. The extension will automatically activate

Alternatively, to package and install:

1. Run `npm install` to install dependencies
2. Run `npm run compile` to compile TypeScript
3. Press `F5` to test, or use `vsce package` to create a `.vsix` file for distribution

## Usage

### File Association

Files with these extensions are automatically recognized as Swipeclock scripting:
- `.twp`, `.twpscript` - TimeWorksPlus script files
- `.swipeclock`, `.scscript` - Swipeclock script files
- `.wfhscript`, `.wfhub`, `.workforcehub` - WorkforceHub script files
- `.timeworksplus` - TimeWorksPlus script files (alternative)

### Auto-completion

- Type `employee.` to see all available employee properties
- Type `reportingdate.` to see all available reporting date properties
- Type any function name to see function signatures and documentation
- Press `Ctrl+Space` (or `Cmd+Space` on Mac) to trigger IntelliSense manually

### Syntax Highlighting

The extension provides full syntax highlighting that adapts to your VS Code theme. Variables, functions, keywords, comments, strings, and other language elements are highlighted using standard TextMate scopes that work with all themes.

### Formatting

A **document formatter** is included. Use **Format Document** (e.g. `Alt+Shift+F` on Windows/Linux, `Option+Shift+F` on macOS, or your mapped hotkey) to format the whole file.

- **Default style**: Uses VS Code's editor indentation settings (tab size, spaces vs tabs). Falls back to 4 spaces if not set. JavaScript-style braces (opening `{` on the same line as `if` / `else if` / `else`).
- **Customization**: You can change formatter behavior in Settings:
  - **Swipeclock Scripting: Indent Size** (`swipeclock.formatting.indentSize`) – number of spaces when using spaces (default: 4, used as fallback only).
  - **Swipeclock Scripting: Brace Style** (`swipeclock.formatting.braceStyle`) – `javascript` (brace on same line) or `allman` (brace on new line).
- The formatter respects your editor's **Insert Spaces** / **Tab Size** settings. You can also choose a different default formatter for Swipeclock files in VS Code settings if you prefer.

### Hover Documentation

Hover over any symbol to see documentation:
- **Functions**: See signature, description, and examples
- **Object properties**: See type and description (e.g., `employee.department`, `reportingdate.totalhours`)
- **Global properties**: See type and description (e.g., `hours`, `category`, `intime`)
- **Operators**: See operator description and examples

### Signature Help

When typing a function call (e.g., `addalert(`), a popup shows:
- The function signature
- Which parameter you're currently typing (highlighted)
- Documentation for the function

For functions with multiple signatures (like `round()`), the appropriate signature is shown based on the argument type you're typing.

## Language Features Supported

### Employee Object Properties
All employee properties are available via `employee.*`:
- `employee.firstname`, `employee.lastname`, `employee.code`
- `employee.department`, `employee.location`, `employee.supervisor`
- `employee.payrate0`, `employee.payrate1`, etc.
- Dynamic properties: `employee.department1-9`, `employee.location1-9`, `employee.home1-9`, `employee.payrate1-9`
- WorkforceHub only: `employee.position`, `employee.exempt`, `employee.lasthiredate`

### ReportingDate Object Properties
All reporting date properties are available via `reportingdate.*`:
- `reportingdate.date`, `reportingdate.year`, `reportingdate.month`
- `reportingdate.totalhours`, `reportingdate.weekhours`
- `reportingdate.totalweek()`, `reportingdate.totalpp()`, etc.

### Global Functions
- **Date Functions**: `dateadd()`, `dateserial()`, `weekday()`, `cdate()`, `cdatetime()`, `ctime()`, `day()`, `month()`, `year()`
- **Number Functions**: `val()`, `cint()`, `cstr()`, `abs()`
- **String Functions**: `translate()`, `within()`, `left()`, `right()`, `mid()`
- **Time Rounding**: `round()`, `roundin()`, `roundout()`, `roundends()`, `roundtoschedule()`
- **Math Rounding**: `roundup()`, `rounddown()`
- **Additional**: `addalert()`, `unpay()`, `touches()`, `isedited()`, `tomorrow()`, `yesterday()`, `overlaps()`, `overlap()`, `addentry()`
- **Accrual**: `accrueup()`, `accruedown()`, `getbalance()`, `setbalance()`

### Global Timecard Properties
These properties are global (no object prefix):
- `payrate`, `isfirsttoday`, `islasttoday`, `hours`, `minutes`, `seconds`, `breakseconds`
- `minutesout`, `minutestil`, `punchset`, `category`, `punchdate`
- `intime`, `outtime`, `inismissing`, `outismissing`
- `istimes`, `ishours`, `ispayonly`, `inisedited`, `outisedited`, `isedited`
- `hourstopunch`, `hourstopunchot`, `linetonow`, `inip`, `outip`

### Variables
- **Local variables**: Start with `$` (e.g., `$myvar = 10`)
- **Global variables**: No prefix (e.g., `myvar = 10`)
- Variables are case-insensitive

### Operators
- **Logical**: `and`, `or`, `&&`, `||`
- **Comparison**: `==`, `!=`, `<>`, `>`, `>=`, `<`, `<=`
- **Arithmetic**: `+`, `-`, `*`, `/`, `\` (integer division), `%`, `mod`
- **String**: `contains`, `startswith`, `endswith` (operators, not functions)

## Configuration

### Formatting Settings

- **`swipeclock.formatting.indentSize`** (number, default: 4): Number of spaces for indentation when using spaces. Used as fallback when VS Code editor settings aren't available.
- **`swipeclock.formatting.braceStyle`** (string, default: `"javascript"`): Brace style - `"javascript"` (opening brace on same line as if/else) or `"allman"` (opening brace on new line).

### Diagnostics Settings

- **`swipeclock.warnExtendedFields`** (boolean, default: `true`): Show warnings for extended fields (home4-9, department1-9, location1-9, payrate1-9) that require account settings to be enabled.

## AI Support (Cursor & GitHub Copilot)

The extension includes support for training Cursor and GitHub Copilot to understand the Swipeclock scripting language.

### Setting Up AI Support

The extension provides commands to set up AI configuration files in your workspace:

1. **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`):
   - **Swipeclock: Set Up Cursor AI Support** - Adds `.cursorrules` to workspace
   - **Swipeclock: Set Up GitHub Copilot Support** - Adds `.github/copilot-instructions.md` to workspace
   - **Swipeclock: Set Up All AI Support** - Sets up both

2. **First-time notification**: On first activation, you'll be prompted to set up AI support.

### What It Does

- **Cursor**: Reads `.cursorrules` from workspace root to understand language rules
- **GitHub Copilot**: Reads `.github/copilot-instructions.md` from workspace root to understand language rules
- Both files **must be in your workspace** (not just in the extension)
- The extension includes both files and provides commands to set them up automatically
- Each workspace can have its own configuration files

### Note on Workspace vs Extension

- Configuration files **must be in your workspace** to work
- The extension includes the files, but AI assistants only read them from the workspace
- The extension commands help you set them up automatically
- You can customize the files in your workspace after setup

### Alternative: Disable AI Suggestions

If you prefer to disable AI suggestions entirely for Swipeclock files, you can:
- Use the `.cursorignore` file (excludes files from Cursor indexing)
- Configure workspace settings to disable Copilot/Cursor AI for Swipeclock files

## Maintaining the Extension: Adding New Properties or Functions

When adding new scripting properties or functions, update these places:

| What you're adding | Where to update |
|--------------------|-----------------|
| **Employee property** | `src/completionProvider.ts` → `employeeProperties` array |
| **ReportingDate property** | `src/completionProvider.ts` → `reportingDateProperties` array |
| **Global function** | `src/completionProvider.ts` → `globalFunctions` array |
| **Global timecard property** | `src/completionProvider.ts` → `globalProperties` array |
| **Reserved word** (so it isn't flagged as undefined variable) | `src/diagnosticsProvider.ts` → `reservedWords` set |

Completion, hover docs, and diagnostics all read from the completion provider. Numbered fields (department1–9, location1–9, home1–9, payrate1–9) are generated automatically; no change needed for those. Optional: update `src/semanticTokensProvider.ts` for highlighting and `syntaxes/swipeclock.tmLanguage.json` for grammar.

## Known Limitations

- Dynamic properties (department1-9, etc.) are suggested but actual availability depends on account configuration
- Some edge cases in syntax highlighting may not be perfect due to the flexible nature of the language
- The formatter uses VS Code's editor indentation settings; if those aren't available, it falls back to the extension's indent size setting or 4 spaces

## Contributing

This extension is designed specifically for Swipeclock scripting. If you find issues or have suggestions, please report them on the [GitHub repository](https://github.com/JeremyFail/swipeclock-scripting-extension).

## License

This extension was created by Jeremy Fail. It is provided for use with Swipeclock scripting under the MIT license.
