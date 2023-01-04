import * as vscode from "vscode";

export async function showInputBox() {
  var currentlyOpenTabfilePath =
    vscode.window.activeTextEditor?.document.uri.fsPath;

  const result = await vscode.window.showInputBox({
    value: "gcc -c -libdev " + currentlyOpenTabfilePath,
    placeHolder: "entrer la commande souhaité",
  });

  let result1: string = result as string;

  console.log(result);

  if (vscode.window.terminals.length === 0) {
    const termin = vscode.window.createTerminal("Ev3dev-console");
    termin.show();
    termin.sendText(result1);
  } else {
    vscode.window.activeTerminal?.sendText(result1);
  }
}

export async function showInputBoxjava() {
  const path = vscode.workspace.getConfiguration("ev3dev").get("gradlewPath");
  let path1: string = path as string;

  if (vscode.window.terminals.length === 0) {
    const termin = vscode.window.createTerminal({ cwd: path1 });
    termin.sendText("./gradlew deployAndBrickRun");
    termin.show();
  } else {
    vscode.window.activeTerminal?.sendText("exit");
    const termin = vscode.window.createTerminal({ cwd: path1 });
    termin.sendText("./gradlew deployAndBrickRun");
    termin.show();
  }
}

export async function showInputBoxCpp() {
  const path = vscode.workspace.getConfiguration("ev3dev").get("cppPath");
  let path1: string = path as string;

  const result2 = await vscode.window.showInputBox({
    value: "arm-linux-gnueabi-g++ -c test_moteur_api.c -I ./../include/",
    placeHolder: "entrer la commande souhaitée",
  });

  const result3 = await vscode.window.showInputBox({
    value:
      "arm-linux-gnueabi-g++ -o test_moteur_api test_moteur_api.o ./../include/*.o",
    placeHolder: "entrer la commande souhaitée",
  });

  let result21: string = result2 as string;
  let result31: string = result3 as string;

  if (vscode.window.terminals.length === 0) {
    const termin = vscode.window.createTerminal({ cwd: path1 });
    /*termin.sendText("cd include");*/
    termin.sendText(
      "cd include && arm-linux-gnueabi-g++ -c robot_lego.c Robot.c Moteur.c Capteur_couleur.c Capteur_pression.c Capteur_luminosite.c Capteur_ultrason.c Capteur_gyro.c Capteur_remote.c && cd ../src"
    );
    /*termin.sendText("cd ../src");*/
    termin.sendText(result21);
    termin.sendText(result31);
    termin.show();
  } else {
    vscode.window.activeTerminal?.sendText("exit");
    const termin = vscode.window.createTerminal({ cwd: path1 });
    /*termin.sendText("cd include");*/
    termin.sendText(
      "cd include && arm-linux-gnueabi-g++ -c robot_lego.c Robot.c Moteur.c Capteur_couleur.c Capteur_pression.c Capteur_luminosite.c Capteur_ultrason.c Capteur_gyro.c Capteur_remote.c && cd ../src"
    );
    /*termin.sendText("cd ../src");*/
    termin.sendText(result21);
    termin.sendText(result31);
    termin.show();
  }
}
