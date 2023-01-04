"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cwt = void 0;
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const rd = require("readline");
const vscode = require("vscode");
var cwt;
(function (cwt) {
    class line {
        constructor(text, row) {
            this.text = text;
            this.length = text.length;
            this.row = row;
        }
    }
    let test_result;
    (function (test_result) {
        test_result[test_result["none"] = 0] = "none";
        test_result[test_result["passed"] = 1] = "passed";
        test_result[test_result["undefined"] = 2] = "undefined";
        test_result[test_result["failed"] = 3] = "failed";
    })(test_result || (test_result = {}));
    class tree_item extends vscode.TreeItem {
        constructor(label, file, line, is_scenario) {
            super(label, vscode.TreeItemCollapsibleState.None);
            this.children = [];
            this.result = test_result.none;
            this.file = file;
            this.line = line;
            this.collapsibleState = vscode.TreeItemCollapsibleState.None;
            this.is_scenario = is_scenario;
        }
        add_child(child) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            this.children.push(child);
        }
        set_test_result(result) {
            this.result = result;
            var icon = this.get_icon(result);
            this.iconPath = {
                light: path.join(__filename, '..', '..', 'src', 'assets', icon),
                dark: path.join(__filename, '..', '..', 'src', 'assets', icon)
            };
        }
        get_last_result() {
            return this.result;
        }
        get_icon(result) {
            switch (result) {
                case test_result.passed:
                    return 'passed.png';
                case test_result.failed:
                    return 'failed.png';
                case test_result.undefined:
                    return 'undefined.png';
                default:
                    return '';
            }
        }
    }
    class cucumber {
        constructor(features) {
            this.args = [];
            this.test_result = '';
            if (vscode.workspace.workspaceFolders) {
                const configs = vscode.workspace.getConfiguration("launch").get("configurations");
                const cfg = configs[0];
                const wspace_folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
                this.cwd = cfg.cwd === undefined ? wspace_folder : cfg.cwd.replace("${workspaceFolder}", wspace_folder);
                this.program = cfg.program === undefined ? undefined : cfg.program.replace("${workspaceFolder}", wspace_folder);
                if (features === undefined) {
                    this.args.push(JSON.stringify(this.cwd + "/features"));
                }
                else {
                    this.args.push(JSON.stringify(features));
                }
                this.args.push(JSON.stringify('--publish-quiet'));
                this.args.push(JSON.stringify('--format'));
                this.args.push(JSON.stringify('json'));
            }
            else {
                throw new Error("can't execute cucumber, no workspace folder is opened!");
            }
        }
        async run_tests() {
            vscode.window.showInformationMessage('Starting tests, please wait.');
            if (this.program === undefined) {
                throw new Error("can't execute cucumber, no test program defined in launch.json");
            }
            await this.launch_program();
            return this.execute_cucumber();
        }
        set_test_results(tree_data) {
            var result = JSON.parse(this.test_result);
            result.forEach((feature) => {
                feature.elements.forEach((scenario) => {
                    var result = test_result.passed;
                    scenario.steps.forEach((step) => {
                        switch (step.result.status) {
                            case 'failed':
                                result = test_result.failed;
                                break;
                            case 'undefined':
                                result = test_result.undefined;
                                break;
                        }
                    });
                    tree_data.get_scenario_by_uri_and_row(feature.uri, scenario.line)?.set_test_result(result);
                });
            });
        }
        launch_program() {
            var self = this;
            return new Promise(function (resolve, reject) {
                var runner = (0, child_process_1.spawn)(self.program, { detached: false });
                runner.on('spawn', () => {
                    console.log(self.program + ' started!');
                    resolve(true);
                });
                runner.on('error', (code) => {
                    console.log('error: ', code);
                    reject(code);
                });
            });
        }
        execute_cucumber() {
            var self = this;
            return new Promise(function (resolve, reject) {
                var runner = (0, child_process_1.spawn)('cucumber', self.args, { detached: false, shell: true, cwd: self.cwd });
                runner.stdout.on('data', data => {
                    self.test_result = self.test_result.concat(data.toString());
                });
                runner.on('exit', (code) => {
                    console.log('cucumber exited with code ' + code);
                    resolve(code);
                });
                runner.on('error', (code) => {
                    console.log('error: ' + code);
                    reject(code);
                });
            });
        }
    }
    class tree_view_data {
        constructor() {
            this.data = [];
        }
        add_item(item) {
            this.data.push(item);
        }
        get_data() {
            return this.data;
        }
        update_feature_icons() {
            this.data.forEach((feature) => {
                feature.set_test_result(test_result.none);
                feature.children.forEach((scenario) => {
                    if (feature.get_last_result() !== test_result.failed) {
                        switch (scenario.get_last_result()) {
                            case test_result.passed:
                                feature.set_test_result(test_result.passed);
                                break;
                            case test_result.failed:
                                feature.set_test_result(test_result.failed);
                                break;
                            case test_result.undefined:
                                feature.set_test_result(test_result.undefined);
                                break;
                            default:
                                feature.set_test_result(test_result.none);
                                break;
                        }
                    }
                });
            });
        }
        get_feature_by_uri(uri) {
            return this.data.find((feature) => path.normalize(feature.file).includes(path.normalize(uri)));
        }
        get_scenario_by_uri_and_row(uri, line_number) {
            var feature = this.get_feature_by_uri(uri);
            if (feature) {
                return feature.children.find((scenario) => scenario.line.row === line_number);
            }
        }
        erase_data() {
            this.data = [];
        }
        at(index) {
            return this.data.at(index);
        }
    }
    class tree_view {
        constructor() {
            this.data = new tree_view_data();
            this.event_emitter = new vscode.EventEmitter();
            this.onDidChangeTreeData = this.event_emitter.event;
            this.regex_feature = new RegExp("(?<=Feature:).*");
            this.regex_scenario = new RegExp("(?<=Scenario:).*");
            this.regex_scenario_outline = new RegExp("(?<=Scenario Outline:).*");
            vscode.commands.registerCommand('cwt_cucumber.on_item_clicked', item => this.on_item_clicked(item));
            vscode.commands.registerCommand('cwt_cucumber.refresh', () => this.refresh());
            vscode.commands.registerCommand('cwt_cucumber.run', () => this.run_all_tests());
            vscode.commands.registerCommand('cwt_cucumber.context_menu_run', item => this.run_tree_item(item));
        }
        getTreeItem(item) {
            var title = item.label ? item.label.toString() : "";
            var result = new vscode.TreeItem(title, item.collapsibleState);
            result.command = { command: 'cwt_cucumber.on_item_clicked', title: title, arguments: [item] };
            result.iconPath = item.iconPath;
            return result;
        }
        getChildren(element) {
            return (element === undefined) ? this.data.get_data() : element.children;
        }
        on_item_clicked(item) {
            if (item.file === undefined)
                return;
            vscode.workspace.openTextDocument(item.file).then(document => {
                vscode.window.showTextDocument(document).then(editor => {
                    var pos = new vscode.Position(item.line.row - 1, item.line.length);
                    editor.selection = new vscode.Selection(pos, pos);
                    editor.revealRange(new vscode.Range(pos, pos));
                });
            });
        }
        refresh() {
            if (vscode.workspace.workspaceFolders) {
                this.data.erase_data();
                this.read_directory(vscode.workspace.workspaceFolders[0].uri.fsPath);
                this.reload_tree_data();
            }
        }
        reload_tree_data() {
            this.data.update_feature_icons();
            this.event_emitter.fire(undefined);
        }
        run_all_tests() {
            this.internal_run(undefined);
        }
        run_tree_item(item) {
            var feature = item.file;
            if (item.is_scenario) {
                feature += ':' + item.line.row;
            }
            this.internal_run(feature);
        }
        internal_run(feature) {
            var cucumber_runner = new cucumber(feature);
            cucumber_runner.run_tests().then(() => {
                cucumber_runner.set_test_results(this.data);
                this.reload_tree_data();
            });
        }
        read_directory(dir) {
            fs.readdirSync(dir).forEach(file => {
                var current = path.join(dir, file);
                if (fs.statSync(current).isFile()) {
                    if (current.endsWith('.feature')) {
                        this.parse_feature_file(current);
                    }
                }
                else {
                    this.read_directory(current);
                }
            });
        }
        parse_feature_file(file) {
            var reader = rd.createInterface(fs.createReadStream(file));
            const line_counter = ((i = 1) => () => i++)();
            reader.on("line", (current_line, line_number = line_counter()) => {
                var is_feature = current_line.match(this.regex_feature);
                if (is_feature) {
                    this.data.add_item(new tree_item(is_feature[0], file, new line(current_line, line_number), false));
                }
                var is_scenario = current_line.match(this.regex_scenario);
                if (is_scenario) {
                    this.data.at(-1)?.add_child(new tree_item(is_scenario[0], file, new line(current_line, line_number), true));
                }
                var is_scenario_outline = current_line.match(this.regex_scenario_outline);
                if (is_scenario_outline) {
                    this.data.at(-1)?.add_child(new tree_item(is_scenario_outline[0], file, new line(current_line, line_number), true));
                }
            });
        }
    }
    cwt.tree_view = tree_view;
})(cwt = exports.cwt || (exports.cwt = {}));
//# sourceMappingURL=tree_view.js.map