# 🟢 BuiltWith TUI

A terminal-based user interface for exploring the [BuiltWith API](https://api.builtwith.com). Runs in any terminal — Windows CMD, PowerShell, or Bash.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ Features

- 🖥️ **Full TUI experience** — navigate endpoints, enter parameters, and view results without leaving the terminal
- 🌐 **All 14 REST API endpoints** — Domain, Lists, Relationships, Free, Company to URL, Tags, Recommendations, Redirects, Keywords, Trends, Product, Trust, WhoAmI, and Usage
- 📡 **WebSocket Live Feed** — real-time technology detection stream with subscribe/unsubscribe commands
- 🎨 **Color-formatted JSON** — syntax-highlighted API responses for easy reading
- 🔑 **API key management** — save your key locally so you don't have to re-enter it
- 📜 **Call history** — re-run previous API calls with a single keystroke

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/builtwith/builtwith-tui.git
cd builtwith-tui

# Install dependencies
npm install

# Run the app
npm start
```

Or install globally:

```bash
npm install -g .
builtwith
```

## 🚀 Quick Start

1. Launch the app with `npm start`
2. Press **F1** to enter your BuiltWith API key (get one at [builtwith.com](https://api.builtwith.com))
3. Use **↑ ↓** to browse endpoints in the sidebar
4. Press **Enter** to select an endpoint and fill in parameters
5. View the formatted JSON response in the main panel

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate endpoint list |
| `Enter` | Select endpoint / confirm input |
| `Tab` | Switch between sidebar and detail panel |
| `F1` | Set API key |
| `F5` | View call history |
| `F9` | Open WebSocket Live Feed |
| `q` / `Ctrl+C` | Quit |
| `Escape` | Close overlays |

## 🌐 Supported API Endpoints

| # | Endpoint | Description |
|---|----------|-------------|
| 1 | 🔍 **Domain API** | Technology and metadata for any domain |
| 2 | 📋 **Lists API** | Sites using a specific technology |
| 3 | 🔗 **Relationships API** | Related sites via shared identifiers |
| 4 | 🆓 **Free API** | Summary counts for technology groups |
| 5 | 🏢 **Company to URL** | Discover domains from company names |
| 6 | 🏷️ **Tags API** | Domains related to IPs and attributes |
| 7 | 💡 **Recommendations** | Technology recommendations for a domain |
| 8 | ↪️ **Redirects API** | Redirect history for a domain |
| 9 | 🔑 **Keywords API** | Keywords associated with a domain |
| 10 | 📈 **Trends API** | Technology adoption trends |
| 11 | 🛒 **Product API** | Find websites selling specific products |
| 12 | 🛡️ **Trust API** | Trust and fraud signals for a domain |
| 13 | 👤 **WhoAmI** | Check API key identity and plan details |
| 14 | 📊 **Usage** | View API usage statistics |

## 📡 WebSocket Live Feed

Press **F9** to open the WebSocket panel. Available commands:

- `subscribe <technology>` — start receiving live detections for a technology
- `unsubscribe <technology>` — stop receiving detections
- `list` — show current subscriptions
- `clear` — clear the message log

## 🔧 Requirements

- **Node.js** 18 or later
- A [BuiltWith API key](https://api.builtwith.com) (free tier available)

## 📄 License

ISC
