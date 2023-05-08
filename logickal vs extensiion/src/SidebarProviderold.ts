import * as vscode from "vscode";
import * as fs from "fs";
import { Url } from "url";
import * as Path from "path";
import { getgroups } from "process";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the Sidebar component and execute action
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        // case "onSomething: {
        //     // code here...
        //     break;
        // }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(_webview: vscode.Webview) {
    const groups = getGroups(
      vscode.Uri.joinPath(this._extensionUri, "groups").path
    );
    console.log("groups:", groups);

    // const styleVSCodeUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    // );
      console.log(generateGroups(groups).join(""));
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
            <style>
              .accordion {
                width: 100%;
                margin: 90px auto;
                color: black;
                background-color: white;
                padding: 45px 45px;
              }

              .accordion .container {
                position: relative;
                margin: 10px 10px;
              }
              
              .accordion .label {
                position: relative;
                padding: 10px 0;
                font-size: 30px;
                color: black;
                cursor: pointer;
              }

              .accordion .label::before {
                content: '+';
                color: black;
                position: absolute;
                top: 50%;
                right: -5px;
                font-size: 30px;
                transform: translateY(-50%);
              }
              
              .accordion .content {
                position: relative;
                background: white;
                height: 0;
                font-size: 20px;
                text-align: justify;
                width: 100%;
                overflow: hidden;
                transition: 0.5s;
              }
              
              .accordion hr {
                width: 100%;
                margin-left: 0;
                border: 1px solid grey;
              }

              .accordion .container.active .content {
                height: 150px;
              }

              .accordion .container.active .label::before {
                content: '-';
                font-size: 30px;
              }
            </style>
        </head>
        <body>
            <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
            <div class="accordion-body"> 
              <div class="accordion">
                ${generateGroups(groups).join("")} 
              </div>
            </div>
        </body>
        <script>
          const accordion = document.getElementsByClassName('container');

          for (i=0; i<accordion.length; i++) {
            accordion[i].addEventListener('click', function () {
              this.classList.toggle('active')
            })
          }
        </script>
        </html>`;
  }
}

const generateGroups = (groups: Array<any>): Array<any> => {
  return groups.map((e) => {
    if (e[0] === true) {
      return (
        "<div class='container'> <div class='label'>" + e[1] + "</div> "+ + generateGroups(e[3]) +"</div><hr>"
      );
    } else {
      return "<div class='content'>" + e[1] + "</div>";
    }
  });
};

const getGroups = (path: string): Array<any> => {
  return fs.readdirSync(path, { withFileTypes: true }).map((dirent) => {
    if (dirent.isDirectory()) {
      return [
        dirent.isDirectory(),
        dirent.name,
        path,
        getGroups(path + "/" + dirent.name),
      ];
    } else {
      return [dirent.isDirectory(), dirent.name, path];
    }
  });
};
