# 🟢 BuiltWith TUI

A terminal-based user interface for exploring the [BuiltWith API](https://api.builtwith.com). Runs in any terminal — Windows CMD, PowerShell, or Bash.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![License](https://img.shields.io/badge/License-ISC-blue)

[▶ Watch Demo](https://github.com/user-attachments/assets/332c7bdc-4fb0-450f-87bc-beff993b296e)


---

![Screenshot](https://github.com/user-attachments/assets/23d5a8fc-0386-4ed6-a23a-23323e513d35)

## ✨ Features

- 🖥️ **Full TUI experience** — navigate endpoints, enter parameters, and view results without leaving the terminal
- 🌐 **All 21 REST API endpoints** — Domain, Change, Lists, Relationships, Free, Company to URL, Tags, Recommendations, Redirects, Keywords, Trends, Product, Trust, VAT, VAT Types, Vector Search, Ask API, WhoAmI, Usage, and Agent Device-Code Authorization
- 📡 **WebSocket Live Feed** — real-time technology detection stream with subscribe/unsubscribe commands
- 🎨 **Color-formatted JSON** — syntax-highlighted API responses for easy reading
- 🔑 **API key management** — save your key locally so you don't have to re-enter it
- 📜 **Call history** — re-run previous API calls with a single keystroke

## 📦 Installation

```bash
npm install -g @builtwith/tui
bwtui
```

Or run without installing:

```bash
npx @builtwith/tui
```

Or clone and run from source:

```bash
git clone https://github.com/builtwith/builtwith-tui.git
cd builtwith-tui
npm install
npm start
```

## 🚀 Quick Start

1. Launch with `bwtui` (or `npx @builtwith/tui`)
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
| 2 | 🔄 **Change API** | Technology additions and removals |
| 3 | 📋 **Lists API** | Sites using a specific technology |
| 4 | 🔗 **Relationships API** | Related sites via shared identifiers |
| 5 | 🆓 **Free API** | Summary counts for technology groups |
| 6 | 🏢 **Company to URL** | Discover domains from company names |
| 7 | 🏷️ **Tags API** | Domains related to IPs and attributes |
| 8 | 💡 **Recommendations** | Technology recommendations for a domain |
| 9 | ↪️ **Redirects API** | Redirect history for a domain |
| 10 | 🔑 **Keywords API** | Keywords associated with a domain |
| 11 | 📈 **Trends API** | Technology adoption trends |
| 12 | 🛒 **Product API** | Find websites selling specific products |
| 13 | 🛡️ **Trust API** | Trust and fraud signals for a domain |
| 14 | 🧾 **VAT API** | VAT, GST, and other company registration numbers for websites |
| 15 | 🧾 **VAT Types API** | Reference list of registration types (no API key required) |
| 16 | 🔎 **Vector Search** | Semantic search across technologies and categories |
| 17 | 💬 **Ask API** | Natural language website list lookup (e.g. "Magento websites in Spain") |
| 18 | 👤 **WhoAmI** | Check API key identity and plan details |
| 19 | 📊 **Usage** | View API usage statistics |
| 20 | 🔐 **Agent Auth Start** | Start Device-Code Authorization flow (no API key required) |
| 21 | 🔐 **Agent Auth Token** | Poll for authorization result and access token (no API key required) |

### 💬 Ask API — Natural Language Lookups

The Ask API lets you query the BuiltWith database in plain English:

- `Magento websites in Spain`
- `React e-commerce sites with high revenue`
- `Shopify stores selling pet products`

**Parameters:**

| Parameter | Description |
|---|---|
| `QUERY` | Your natural language question *(required)* |
| `COMMIT` | Set to `true` for a full report (up to 1,000 results) |
| `NEXTOFFSET` | Paste the `NextOffset` from a previous response to get the next page |
| `META` | Set to `yes` to include metadata |

Without `COMMIT`, every request returns a quick sample — great for previewing before running a full report.

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
