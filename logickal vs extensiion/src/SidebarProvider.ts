import * as vscode from "vscode";
import * as fs from "fs";

// lets put all in a cwt namespace
export namespace SidebarProvider {
  // this represents an item and it's children (like nested items)
  // we implement the item later

  class TreeItem extends vscode.TreeItem {
    // we'll use the file and line later...
    readonly isDirectory: boolean | undefined;
    readonly file: string | undefined;
    readonly line: number | undefined;

    // children represent branches, which are also items
    public children: TreeItem[] = [];

    // add all members here, file and line we'll need later
    // the label represent the text which is displayed in the tree
    // and is passed to the base class
    constructor(
      label: string,
      isDirectory: boolean,
      file: string,
      line: number
    ) {
      super(label, vscode.TreeItemCollapsibleState.None);
      this.isDirectory = isDirectory;
      this.file = file;
      this.line = line;
      if(isDirectory){
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      } else {
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
      }
    }

    // a public method to add childs, and with additional branches
    // we want to make the item collabsible
    public addChild(child: TreeItem) {
      this.children.push(child);
    }
  }

  // tree_view will created in our entry point
  export class TreeView implements vscode.TreeDataProvider<TreeItem> {
    // m_data holds all tree items
    private mData: TreeItem[] = [];
    // with the vscode.EventEmitter we can refresh our  tree view
    private mOnDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> =
      new vscode.EventEmitter<TreeItem | undefined>();
    // and vscode will access the event by using a readonly onDidChangeTreeData (this member has to be named like here, otherwise vscode doesnt update our treeview.
    readonly onDidChangeTreeData?: vscode.Event<TreeItem | undefined> =
      this.mOnDidChangeTreeData.event;

    // we register two commands for vscode, item clicked (we'll implement later) and the refresh button.
    public constructor() {
      vscode.commands.registerCommand("logickal.sidebar.itemClicked", (r) => {
        if(!r.isDirectory){
          this.itemClicked(r);
          console.log("itemclicked", r);
        }
      });
      vscode.commands.registerCommand("logickal.sidebar.newGroup", () =>
      this.newGroup()
      );
      vscode.commands.registerCommand("logickal.sidebar.newText", () =>
      this.newText()
      );
      vscode.commands.registerCommand("logickal.sidebar.newWhiteboard", () =>
      this.newWhiteboard()
      );
      vscode.commands.registerCommand("logickal.sidebar.refresh", () =>
        this.refresh()
      );
    }

    // we need to implement getTreeItem to receive items from our tree view
    public getTreeItem(
      item: TreeItem
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
      let title = item.label ? item.label.toString() : "";
      let result = new vscode.TreeItem(title, item.collapsibleState);
      // here we add our command which executes our memberfunction
      result.command = {
        command: "logickal.sidebar.itemClicked",
        title: title,
        arguments: [item],
      };
      return result;
    }

    // and getChildren
    public getChildren(
      element: TreeItem | undefined
    ): vscode.ProviderResult<TreeItem[]> {
      if (element === undefined) {
        return this.mData;
      } else {
        return element.children;
      }
    }

    // this is called when we click an item
    public itemClicked(item: TreeItem) {
      console.log("item", item);
      if (item.file === undefined) {
        return;
      }
      vscode.workspace
        .openTextDocument(item.file + "/" + item.label)
        .then((document) => {
          vscode.window.showTextDocument(document);
        });
    }

    // this is called whenever we refresh the tree view
    public refresh() {
      this.mData = [];
      const path = vscode.extensions.getExtension(
        "undefined_publisher.logickal"
      )?.extensionUri;
      if (path) {
        const groups = this.getGroups(vscode.Uri.joinPath(path, "groups").path);
        this.addChildren(groups);
      }
      console.log(this.mData);
      this.mOnDidChangeTreeData.fire(undefined);
    }

    public newGroup () {
      console.log("group");
    }
    public newText () {
      console.log("text");

    }
    public newWhiteboard () {
      console.log("whiteboard");
    }

    private getGroups = (path: string): Array<any> => {
      return fs.readdirSync(path, { withFileTypes: true }).map((dirent) => {
        if (dirent.isDirectory()) {
          return [
            dirent.isDirectory(),
            dirent.name,
            path,
            this.getGroups(path + "/" + dirent.name),
          ];
        } else {
          return [dirent.isDirectory(), dirent.name, path];
        }
      });
    };

    private addChildren(groups: Array<any>) {
      if (groups === undefined) {
        return;
      }
      groups.map((e, i) => {
        if (e[0] === true) {
          this.mData.push(new TreeItem(e[1], e[0] , e[2], i));
          this.addChildren(e[3]);
        } else {
          this.mData.at(-1)?.addChild(new TreeItem(e[1], e[0], e[2], i));
        }
      });
    }
  }
}
