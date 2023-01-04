"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const async_1 = require("./async");
const vscode = require("vscode");
function activate(context) {
    console.log('Congratulations, your extension "helloworld" is now active!');
    let disposable = vscode.commands.registerCommand("ev3devcompile.ev3devcompile", () => {
        (0, async_1.showInputBox)();
    });
    let disposable2 = vscode.commands.registerCommand("ev3devcompile.ev3devcompilejava", () => {
        (0, async_1.showInputBoxjava)();
    });
    let disposable3 = vscode.commands.registerCommand("ev3devcompile.ev3devcompilecpp", () => {
        (0, async_1.showInputBoxCpp)();
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map