import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SwipeclockCompletionProvider } from './completionProvider';
import { SwipeclockSemanticTokensProvider } from './semanticTokensProvider';
import { SwipeclockDiagnosticsProvider } from './diagnosticsProvider';
import { SwipeclockHoverProvider } from './hoverProvider';
import { SwipeclockSignatureHelpProvider } from './signatureHelpProvider';
import { SwipeclockDocumentFormatter } from './documentFormatter';
import { SwipeclockCodeActionProvider } from './codeActionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Swipeclock Scripting extension is now active');

    // Register completion provider ($ triggers local-var list; . and letters also trigger)
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'swipeclock',
        new SwipeclockCompletionProvider(),
        // Trigger on $ (local vars) and dot (object properties)
        '$', '.',
        // Trigger on letters (global variables/keywords/functions)
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    );

    // Register semantic tokens provider for enhanced highlighting
    const semanticTokensProvider = new SwipeclockSemanticTokensProvider();
    const semanticTokens = vscode.languages.registerDocumentSemanticTokensProvider(
        'swipeclock',
        semanticTokensProvider,
        semanticTokensProvider.legend
    );

    // Register hover provider for documentation on hover
    const hoverProvider = vscode.languages.registerHoverProvider('swipeclock', new SwipeclockHoverProvider());

    // Register signature help provider for parameter hints when typing function calls
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
        'swipeclock',
        new SwipeclockSignatureHelpProvider(),
        '(', ','
    );

    // Register document formatter (Format Document: Alt+Shift+F)
    const documentFormatter = vscode.languages.registerDocumentFormattingEditProvider(
        'swipeclock',
        new SwipeclockDocumentFormatter()
    );

    // Register code actions (quick fixes for diagnostics)
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'swipeclock',
        new SwipeclockCodeActionProvider(),
        {
            providedCodeActionKinds: SwipeclockCodeActionProvider.providedCodeActionKinds
        }
    );

    // Register diagnostics provider for undefined variable warnings
    const diagnosticsProvider = new SwipeclockDiagnosticsProvider();
    const updateDiagnostics = (document: vscode.TextDocument) => {
        if (document.languageId === 'swipeclock') {
            diagnosticsProvider.updateDiagnostics(document);
        }
    };

    // Update diagnostics on document change
    vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document), null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument(updateDiagnostics, null, context.subscriptions);
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('swipeclock.warnExtendedFields')) {
            vscode.workspace.textDocuments.forEach(updateDiagnostics);
        }
    }, null, context.subscriptions);
    
    // Update diagnostics for all open documents
    vscode.workspace.textDocuments.forEach(updateDiagnostics);

    // Register command to set up .cursorrules file
    const setupCursorRulesCommand = vscode.commands.registerCommand(
        'swipeclock.setupCursorRules',
        async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage('No workspace folder open. Please open a workspace first.');
                return;
            }

            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const cursorRulesPath = path.join(workspaceRoot, '.cursorrules');
            const extensionRulesPath = path.join(context.extensionPath, '.cursorrules');

            // Check if .cursorrules already exists
            if (fs.existsSync(cursorRulesPath)) {
                const overwrite = await vscode.window.showWarningMessage(
                    '.cursorrules file already exists in workspace. Overwrite?',
                    'Overwrite',
                    'Cancel'
                );
                if (overwrite !== 'Overwrite') {
                    return;
                }
            }

            try {
                // Read the .cursorrules file from extension
                if (fs.existsSync(extensionRulesPath)) {
                    const rulesContent = fs.readFileSync(extensionRulesPath, 'utf8');
                    fs.writeFileSync(cursorRulesPath, rulesContent, 'utf8');
                    vscode.window.showInformationMessage(
                        'Swipeclock .cursorrules file has been added to your workspace. Cursor will now understand the language better!'
                    );
                } else {
                    vscode.window.showErrorMessage('Could not find .cursorrules file in extension.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to create .cursorrules file: ${error}`);
            }
        }
    );

    // Register command to set up GitHub Copilot instructions
    const setupCopilotInstructionsCommand = vscode.commands.registerCommand(
        'swipeclock.setupCopilotInstructions',
        async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage('No workspace folder open. Please open a workspace first.');
                return;
            }

            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const githubDir = path.join(workspaceRoot, '.github');
            const copilotInstructionsPath = path.join(githubDir, 'copilot-instructions.md');
            const extensionInstructionsPath = path.join(context.extensionPath, '.github', 'copilot-instructions.md');

            // Check if copilot-instructions.md already exists
            if (fs.existsSync(copilotInstructionsPath)) {
                const overwrite = await vscode.window.showWarningMessage(
                    '.github/copilot-instructions.md file already exists in workspace. Overwrite?',
                    'Overwrite',
                    'Cancel'
                );
                if (overwrite !== 'Overwrite') {
                    return;
                }
            }

            try {
                // Create .github directory if it doesn't exist
                if (!fs.existsSync(githubDir)) {
                    fs.mkdirSync(githubDir, { recursive: true });
                }

                // Read the copilot-instructions.md file from extension
                if (fs.existsSync(extensionInstructionsPath)) {
                    const instructionsContent = fs.readFileSync(extensionInstructionsPath, 'utf8');
                    fs.writeFileSync(copilotInstructionsPath, instructionsContent, 'utf8');
                    vscode.window.showInformationMessage(
                        'Swipeclock GitHub Copilot instructions have been added to your workspace. Copilot will now understand the language better!'
                    );
                } else {
                    vscode.window.showErrorMessage('Could not find copilot-instructions.md file in extension.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to create copilot-instructions.md file: ${error}`);
            }
        }
    );

    // Register command to set up both Cursor and Copilot
    const setupAllAICommand = vscode.commands.registerCommand(
        'swipeclock.setupAllAI',
        async () => {
            await vscode.commands.executeCommand('swipeclock.setupCursorRules');
            await vscode.commands.executeCommand('swipeclock.setupCopilotInstructions');
            vscode.window.showInformationMessage(
                'Swipeclock AI support has been set up for both Cursor and GitHub Copilot!'
            );
        }
    );

    context.subscriptions.push(
        completionProvider,
        semanticTokens,
        hoverProvider,
        signatureHelpProvider,
        documentFormatter,
        codeActionProvider,
        diagnosticsProvider,
        setupCursorRulesCommand,
        setupCopilotInstructionsCommand,
        setupAllAICommand
    );

    // Show notification on first activation (optional - can be removed if too intrusive)
    // Using an async IIFE to handle the async notification
    (async () => {
        const hasShownNotification = context.globalState.get('swipeclock.hasShownAINotification', false);
        if (!hasShownNotification && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const cursorRulesPath = path.join(workspaceRoot, '.cursorrules');
            const copilotInstructionsPath = path.join(workspaceRoot, '.github', 'copilot-instructions.md');
            
            if (!fs.existsSync(cursorRulesPath) || !fs.existsSync(copilotInstructionsPath)) {
                const action = await vscode.window.showInformationMessage(
                    'Swipeclock: Enable AI support (Cursor & Copilot)? This will add configuration files to help AI understand the language.',
                    'Set Up All',
                    'Set Up Cursor',
                    'Set Up Copilot',
                    'Later',
                    'Don\'t Show Again'
                );

                if (action === 'Set Up All') {
                    vscode.commands.executeCommand('swipeclock.setupAllAI');
                    context.globalState.update('swipeclock.hasShownAINotification', true);
                } else if (action === 'Set Up Cursor') {
                    vscode.commands.executeCommand('swipeclock.setupCursorRules');
                    context.globalState.update('swipeclock.hasShownAINotification', true);
                } else if (action === 'Set Up Copilot') {
                    vscode.commands.executeCommand('swipeclock.setupCopilotInstructions');
                    context.globalState.update('swipeclock.hasShownAINotification', true);
                } else if (action === 'Don\'t Show Again') {
                    context.globalState.update('swipeclock.hasShownAINotification', true);
                }
            }
        }
    })().catch(err => {
        console.error('Error showing AI setup notification:', err);
    });
}

export function deactivate() {
    console.log('Swipeclock Scripting extension is now deactivated');
}
