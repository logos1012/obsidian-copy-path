import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  TFolder,
  Menu,
} from "obsidian";

interface CopyPathSettings {
  showNotice: boolean;
  quoteStyle: "single" | "double";
}

const DEFAULT_SETTINGS: CopyPathSettings = {
  showNotice: true,
  quoteStyle: "single",
};

export default class CopyPathPlugin extends Plugin {
  settings: CopyPathSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Add ribbon icon
    this.addRibbonIcon("copy", "Copy Path", () => {
      this.copyActiveFilePath();
    });

    // Add command for copying active file path
    this.addCommand({
      id: "copy-active-file-path",
      name: "Copy active file path",
      callback: () => {
        this.copyActiveFilePath();
      },
    });

    // Add command for copying selected files path (works with file explorer selection)
    this.addCommand({
      id: "copy-selected-files-path",
      name: "Copy selected files path",
      callback: () => {
        this.copySelectedFilesPaths();
      },
    });

    // Register file menu event (right-click on single file)
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile) => {
        menu.addItem((item) => {
          item
            .setTitle("Copy path")
            .setIcon("copy")
            .onClick(() => {
              this.copyPathsToClipboard([file]);
            });
        });
      })
    );

    // Register files menu event (right-click on multiple files)
    this.registerEvent(
      this.app.workspace.on("files-menu", (menu: Menu, files: TAbstractFile[]) => {
        menu.addItem((item) => {
          item
            .setTitle("Copy paths")
            .setIcon("copy")
            .onClick(() => {
              this.copyPathsToClipboard(files);
            });
        });
      })
    );

    // Add settings tab
    this.addSettingTab(new CopyPathSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Copy the path of the currently active file
   */
  copyActiveFilePath() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.copyPathsToClipboard([activeFile]);
    } else {
      new Notice("No active file");
    }
  }

  /**
   * Copy paths of selected files in file explorer
   */
  copySelectedFilesPaths() {
    // Try to get selected files from file explorer
    const selectedFiles = this.getSelectedFilesFromExplorer();

    if (selectedFiles.length > 0) {
      this.copyPathsToClipboard(selectedFiles);
    } else {
      // Fallback to active file if no selection
      this.copyActiveFilePath();
    }
  }

  /**
   * Get selected files from the file explorer
   */
  getSelectedFilesFromExplorer(): TAbstractFile[] {
    const fileExplorer = this.app.workspace.getLeavesOfType("file-explorer")[0];
    if (!fileExplorer) {
      return [];
    }

    // Access the file explorer view
    const explorerView = fileExplorer.view as any;

    // Try to get selected files from the file explorer's internal state
    if (explorerView && explorerView.fileItems) {
      const selectedFiles: TAbstractFile[] = [];

      for (const [path, item] of Object.entries(explorerView.fileItems)) {
        if ((item as any).selfEl?.classList?.contains("is-selected")) {
          const file = this.app.vault.getAbstractFileByPath(path);
          if (file) {
            selectedFiles.push(file);
          }
        }
      }

      return selectedFiles;
    }

    return [];
  }

  /**
   * Recursively collect all file paths from files and folders
   */
  collectAllPaths(items: TAbstractFile[]): string[] {
    const paths: string[] = [];

    for (const item of items) {
      if (item instanceof TFile) {
        paths.push(item.path);
      } else if (item instanceof TFolder) {
        // For folders, add the folder path itself
        paths.push(item.path);
      }
    }

    return paths;
  }

  /**
   * Format paths with quotes
   */
  formatPaths(paths: string[]): string {
    const quote = this.settings.quoteStyle === "single" ? "'" : '"';
    return paths.map((p) => `${quote}${p}${quote}`).join(", ");
  }

  /**
   * Copy paths to clipboard
   */
  async copyPathsToClipboard(files: TAbstractFile[]) {
    const paths = this.collectAllPaths(files);

    if (paths.length === 0) {
      new Notice("No paths to copy");
      return;
    }

    const formattedPaths = this.formatPaths(paths);

    try {
      await navigator.clipboard.writeText(formattedPaths);
      if (this.settings.showNotice) {
        const count = paths.length;
        const message = count === 1
          ? "Path copied"
          : `${count} paths copied`;
        new Notice(message);
      }
    } catch (err) {
      new Notice("Failed to copy to clipboard");
      console.error("Copy failed:", err);
    }
  }
}

class CopyPathSettingTab extends PluginSettingTab {
  plugin: CopyPathPlugin;

  constructor(app: App, plugin: CopyPathPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Copy Path Settings" });

    new Setting(containerEl)
      .setName("Show notification")
      .setDesc("Show a notification when paths are copied")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotice)
          .onChange(async (value) => {
            this.plugin.settings.showNotice = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Quote style")
      .setDesc("Choose quote style for paths")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("single", "Single quotes ('path')")
          .addOption("double", 'Double quotes ("path")')
          .setValue(this.plugin.settings.quoteStyle)
          .onChange(async (value: "single" | "double") => {
            this.plugin.settings.quoteStyle = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Hotkeys" });

    containerEl.createEl("p", {
      text: "Configure hotkeys in Obsidian Settings → Hotkeys. Search for 'Copy Path' to find available commands:",
    });

    const commandList = containerEl.createEl("ul");
    commandList.createEl("li", { text: "Copy active file path - Copy the path of the currently open file" });
    commandList.createEl("li", { text: "Copy selected files path - Copy paths of selected files in file explorer" });
  }
}
