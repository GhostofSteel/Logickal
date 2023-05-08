// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "logickal" is now active!');

  // const sidebar = new SidebarProvider(context.extensionUri);
  // context.subscriptions.push(
  //   vscode.window.registerWebviewViewProvider(
  // 	  "logickal.sidebar",
  // 	  sidebar
  //   )
  // );

  let tree = new SidebarProvider.TreeView();
  vscode.window.registerTreeDataProvider("logickal.sidebar", tree);
  tree.refresh();

  vscode.commands.registerCommand("logickal.whiteboard", () => {
    const panel = vscode.window.createWebviewPanel(
      "Whiteboard", // Identifies the type of the webview. Used internally
      "Logickal Whiteboard", // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {} // Webview options. More on these later.
    );
    panel.webview.html = whiteboard();
  });
}

const whiteboard = () => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
  </head>
  <body>
	  <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
};

// This method is called when your extension is deactivated
export function deactivate() {}
