# GitStar+

> A second GitHub star, personal and flexible

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-MV3-orange)
![Firefox](https://img.shields.io/badge/firefox-compatible-red)

Browser extension that adds a **GitStar+** button on every GitHub repository to manage your personal favorites, independently from the official stars.

## Features

| Feature | Description |
|---------|-------------|
| **Second Star** | GitStar+ button on every repository page |
| **Local Storage** | Favorites persist in the browser |
| **JSON Export** | Save your favorites with one click |
| **JSON Import** | Easily restore your data |
| **Search** | Quickly find a favorite |
| **Dark Mode** | Automatically adapts to GitHub theme |

## Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the **`extension`** folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the **`extension/manifest.json`** file

## Usage

### Add a favorite
1. Go to any GitHub repository
2. Click the **GitStar+** button (next to the Star button)
3. The star turns golden

### Manage your favorites
1. Click the extension icon in the toolbar
2. Search, browse or remove your favorites
3. Export/Import your data using the dedicated buttons

## Project Structure

```
GitStar+/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── .gitignore
└── extension/              <- Load this folder in your browser
    ├── manifest.json
    ├── icons/
    └── src/
        ├── background/
        ├── content/
        ├── pages/
        ├── popup/
        ├── settings/
        └── utils/
```

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Store favorites locally |
| `github.com` | Inject button on GitHub pages |

## Links

- [Changelog](CHANGELOG.md)

## Contributing

Contributions are welcome! Feel free to open an issue or a pull request.

## License

[MIT](LICENSE) - 2026
