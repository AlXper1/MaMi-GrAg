// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { showInputBox, showInputBoxCpp, showInputBoxjava } from "./async";
import * as vscode from "vscode";


export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "helloworld" is now active!');

  let disposable = vscode.commands.registerCommand(
    "ev3devcompile.ev3devcompile",
    () => {
      showInputBox();
    }
  );

  let disposable2 = vscode.commands.registerCommand(
    "ev3devcompile.ev3devcompilejava",
    () => {
      showInputBoxjava();
    }
  );

  let disposable3 = vscode.commands.registerCommand(
    "ev3devcompile.ev3devcompilecpp",
    () => {
      showInputBoxCpp();
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() {}
