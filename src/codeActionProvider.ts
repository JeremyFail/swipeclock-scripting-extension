import * as vscode from 'vscode';

const EXTENDED_FIELD_WARNING_CODE = 'swipeclock.extendedFieldWarning';

export class SwipeclockCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(
        _document: vscode.TextDocument,
        _range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] {
        const relevantDiagnostics = context.diagnostics.filter(diagnostic => {
            let codeValue: string | undefined;

            if (typeof diagnostic.code === 'string' || typeof diagnostic.code === 'number') {
                codeValue = String(diagnostic.code);
            } else if (diagnostic.code && typeof diagnostic.code === 'object' && 'value' in diagnostic.code) {
                codeValue = String(diagnostic.code.value);
            }

            return diagnostic.source === 'Configure warning'
                && diagnostic.severity === vscode.DiagnosticSeverity.Warning
                && codeValue === EXTENDED_FIELD_WARNING_CODE;
        });

        if (relevantDiagnostics.length === 0) {
            return [];
        }

        const openSettingAction = new vscode.CodeAction(
            'Configure setting: swipeclock.warnExtendedFields',
            vscode.CodeActionKind.QuickFix
        );
        openSettingAction.diagnostics = relevantDiagnostics;
        openSettingAction.command = {
            command: 'workbench.action.openSettings',
            title: 'Open Swipeclock warning setting',
            arguments: ['swipeclock.warnExtendedFields']
        };

        return [openSettingAction];
    }
}
