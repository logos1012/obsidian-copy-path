# Copy Path

An Obsidian plugin that copies file paths to clipboard.

## Features

- **Copy active file path**: Copy the path of the currently open note
- **Copy selected files paths**: Copy paths of multiple selected files/folders from the file explorer
- **Right-click context menu**: Copy paths directly from the navigation panel
- **Ribbon icon**: Quick access button in the left sidebar
- **Command palette**: Access all copy commands via Cmd/Ctrl+P

## Path Format

Paths are copied in the following format:
- Single file: `'folder/note.md'`
- Multiple files: `'folder/note1.md', 'folder/note2.md', 'folder/note3.md'`

## Installation

### Using BRAT (Recommended)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. In BRAT settings, click "Add Beta Plugin"
3. Enter the repository URL: `jake/obsidian-copy-path`
4. Enable the plugin in Community Plugins settings

### Manual Installation

1. Download `main.js` and `manifest.json` from the latest release
2. Create a folder named `copy-path` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into this folder
4. Enable the plugin in Community Plugins settings

## Usage

### Commands

- **Copy active file path**: Copy the path of the currently open file
- **Copy selected files path**: Copy paths of selected files in file explorer

### Hotkeys

Configure hotkeys in Obsidian Settings → Hotkeys. Search for "Copy Path" to find available commands.

### Settings

- **Show notification**: Toggle notification when paths are copied
- **Quote style**: Choose between single quotes (`'path'`) or double quotes (`"path"`)

## License

MIT
