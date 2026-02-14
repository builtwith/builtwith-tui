#!/usr/bin/env node

const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const { ENDPOINTS, callApi } = require('./api');
const { getApiKey, setApiKey, addHistory, getHistory } = require('./config');
const WebSocket = require('ws');

// ── State ──────────────────────────────────────────────────────────────────────
let currentApiKey = getApiKey();
let wsConnection = null;
let wsMessages = [];

// ── Screen ─────────────────────────────────────────────────────────────────────
const screen = blessed.screen({
  smartCSR: true,
  title: 'BuiltWith API Explorer',
  fullUnicode: false,
  dockBorders: true,
  autoPadding: true,
});

// ── Header ─────────────────────────────────────────────────────────────────────
const header = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  tags: true,
  style: { fg: 'white', bg: '#005500' },
  content: '{center}{bold}BuiltWith API Explorer v0.1{/bold}{/center}\n{center}Tab: switch panels | Enter: select | q: quit | F1: set API key | F5: history | F9: WebSocket{/center}',
});

// ── Sidebar (Endpoint List) ────────────────────────────────────────────────────
const endpointKeys = Object.keys(ENDPOINTS);
const sidebarItems = endpointKeys.map(k => ENDPOINTS[k].name);

const sidebar = blessed.list({
  parent: screen,
  label: ' Endpoints ',
  top: 3,
  left: 0,
  width: 26,
  height: '100%-6',
  border: { type: 'line' },
  style: {
    border: { fg: 'cyan' },
    selected: { bg: 'cyan', fg: 'black', bold: true },
    item: { fg: 'white' },
    focus: { border: { fg: 'yellow' } },
  },
  keys: true,
  vi: true,
  mouse: true,
  items: sidebarItems,
  scrollbar: { ch: '|', style: { fg: 'cyan' } },
  tags: true,
});

// ── Detail Panel ───────────────────────────────────────────────────────────────
const detailPanel = blessed.box({
  parent: screen,
  label: ' Details ',
  top: 3,
  left: 26,
  width: '100%-26',
  height: '100%-6',
  border: { type: 'line' },
  style: {
    border: { fg: 'cyan' },
    focus: { border: { fg: 'yellow' } },
  },
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|', style: { fg: 'cyan' } },
  keys: true,
  vi: true,
  mouse: true,
});

// ── Status Bar ─────────────────────────────────────────────────────────────────
const statusBar = blessed.box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  tags: true,
  style: { fg: 'white', bg: '#005500' },
});

function updateStatus(msg) {
  const keyStatus = currentApiKey ? `Key: ${currentApiKey.substring(0, 8)}...` : '{red-fg}No API Key Set{/red-fg}';
  statusBar.setContent(`{center}${keyStatus} | ${msg || 'Ready'}{/center}`);
  screen.render();
}

// ── Show Endpoint Info ─────────────────────────────────────────────────────────
function showEndpointInfo(index) {
  const key = endpointKeys[index];
  const ep = ENDPOINTS[key];
  let content = `{bold}{yellow-fg}${ep.name}{/yellow-fg}{/bold}\n`;
  content += `{cyan-fg}${ep.description}{/cyan-fg}\n\n`;
  content += `{bold}Path:{/bold} ${ep.path}\n\n`;

  if (ep.params.length > 0) {
    content += '{bold}Parameters:{/bold}\n';
    for (const p of ep.params) {
      const reqTag = p.required ? '{red-fg}*{/red-fg}' : ' ';
      content += `  ${reqTag} {green-fg}${p.name}{/green-fg} - ${p.description}\n`;
    }
  } else {
    content += '{bold}Parameters:{/bold} None (uses API key only)\n';
  }

  content += '\n{bold}Press Enter to call this endpoint{/bold}';

  detailPanel.setLabel(` ${ep.name} `);
  detailPanel.setContent(content);
  screen.render();
}

// ── Prompt for Input ───────────────────────────────────────────────────────────
function promptInput(label, defaultValue) {
  return new Promise((resolve) => {
    const inputBox = blessed.textbox({
      parent: screen,
      label: ` ${label} `,
      top: 'center',
      left: 'center',
      width: '60%',
      height: 3,
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'yellow' },
        focus: { border: { fg: 'yellow' } },
      },
      inputOnFocus: true,
      keys: true,
      mouse: true,
      value: defaultValue || '',
    });

    inputBox.focus();
    screen.render();

    inputBox.on('submit', (value) => {
      inputBox.destroy();
      screen.render();
      resolve(value);
    });

    inputBox.on('cancel', () => {
      inputBox.destroy();
      screen.render();
      resolve(null);
    });

    inputBox.readInput();
  });
}

// ── Parameter Form Dialog ──────────────────────────────────────────────────────
async function showParamForm(endpointKey) {
  const ep = ENDPOINTS[endpointKey];

  if (!currentApiKey) {
    await promptSetApiKey();
    if (!currentApiKey) {
      updateStatus('API key required');
      return;
    }
  }

  const paramValues = {};

  for (const param of ep.params) {
    const label = `${param.name}${param.required ? ' (required)' : ''}: ${param.description}`;
    const value = await promptInput(label, '');
    if (value === null) {
      updateStatus('Cancelled');
      return;
    }
    if (param.required && !value) {
      updateStatus(`${param.name} is required`);
      return;
    }
    if (value) {
      paramValues[param.name] = value;
    }
  }

  await executeCall(endpointKey, paramValues);
}

// ── Execute API Call ───────────────────────────────────────────────────────────
async function executeCall(endpointKey, paramValues) {
  const ep = ENDPOINTS[endpointKey];
  updateStatus(`Calling ${ep.name}...`);
  detailPanel.setContent('{yellow-fg}Loading...{/yellow-fg}');
  screen.render();

  try {
    const result = await callApi(endpointKey, currentApiKey, paramValues);
    const formatted = formatJson(result, 0);

    addHistory({
      endpoint: endpointKey,
      name: ep.name,
      params: paramValues,
    });

    detailPanel.setLabel(` ${ep.name} - Results `);
    detailPanel.setContent(formatted);
    detailPanel.scrollTo(0);
    updateStatus(`${ep.name} completed successfully`);
  } catch (err) {
    let errMsg = err.message;
    if (err.response) {
      errMsg = `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`;
    }
    detailPanel.setContent(`{red-fg}{bold}Error:{/bold} ${errMsg}{/red-fg}`);
    updateStatus(`Error calling ${ep.name}`);
  }
  screen.render();
}

// ── JSON Formatter ─────────────────────────────────────────────────────────────
function formatJson(obj, depth) {
  if (depth > 12) return '{gray-fg}...{/gray-fg}';

  const indent = '  '.repeat(depth);
  const indent1 = '  '.repeat(depth + 1);

  if (obj === null) return '{gray-fg}null{/gray-fg}';
  if (obj === undefined) return '{gray-fg}undefined{/gray-fg}';

  if (typeof obj === 'string') {
    // Escape blessed tags in the string
    const safe = obj.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    return `{green-fg}"${safe}"{/green-fg}`;
  }
  if (typeof obj === 'number') return `{yellow-fg}${obj}{/yellow-fg}`;
  if (typeof obj === 'boolean') return `{magenta-fg}${obj}{/magenta-fg}`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map((item, i) => {
      const comma = i < obj.length - 1 ? ',' : '';
      return `${indent1}${formatJson(item, depth + 1)}${comma}`;
    });
    return `[\n${items.join('\n')}\n${indent}]`;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '\\{\\}';
    const entries = keys.map((key, i) => {
      const comma = i < keys.length - 1 ? ',' : '';
      const safeKey = key.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
      return `${indent1}{cyan-fg}"${safeKey}"{/cyan-fg}: ${formatJson(obj[key], depth + 1)}${comma}`;
    });
    return `\\{\n${entries.join('\n')}\n${indent}\\}`;
  }

  return String(obj);
}

// ── API Key Setup ──────────────────────────────────────────────────────────────
async function promptSetApiKey() {
  const key = await promptInput('Enter your BuiltWith API Key', currentApiKey);
  if (key !== null && key.trim()) {
    currentApiKey = key.trim();
    setApiKey(currentApiKey);
    updateStatus('API key saved');
  }
}

// ── History Dialog ─────────────────────────────────────────────────────────────
function showHistory() {
  const history = getHistory();
  if (history.length === 0) {
    detailPanel.setLabel(' History ');
    detailPanel.setContent('{yellow-fg}No history yet. Make some API calls first.{/yellow-fg}');
    screen.render();
    return;
  }

  const items = history.map((h, i) => {
    const params = Object.entries(h.params || {})
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    return `${h.name} ${params ? '(' + params + ')' : ''} - ${h.timestamp}`;
  });

  const historyList = blessed.list({
    parent: screen,
    label: ' History - Enter to re-run, Esc to close ',
    top: 'center',
    left: 'center',
    width: '80%',
    height: '60%',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      selected: { bg: 'cyan', fg: 'black' },
      item: { fg: 'white' },
    },
    keys: true,
    vi: true,
    mouse: true,
    items: items,
    scrollbar: { ch: '|', style: { fg: 'cyan' } },
  });

  historyList.focus();
  screen.render();

  historyList.on('select', (item, index) => {
    const entry = history[index];
    historyList.destroy();
    screen.render();
    executeCall(entry.endpoint, entry.params || {});
  });

  historyList.key('escape', () => {
    historyList.destroy();
    screen.render();
  });
}

// ── WebSocket Live Feed ────────────────────────────────────────────────────────
async function showWebSocket() {
  if (!currentApiKey) {
    await promptSetApiKey();
    if (!currentApiKey) return;
  }

  const wsPanel = blessed.box({
    parent: screen,
    label: ' WebSocket Live Feed - Esc to close ',
    top: 'center',
    left: 'center',
    width: '90%',
    height: '80%',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      fg: 'white',
    },
    tags: true,
  });

  const wsLog = blessed.log({
    parent: wsPanel,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-5',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: '|', style: { fg: 'cyan' } },
    mouse: true,
  });

  const wsInput = blessed.textbox({
    parent: wsPanel,
    label: ' Command (subscribe/unsubscribe/list/channel name) ',
    bottom: 0,
    left: 0,
    width: '100%-2',
    height: 3,
    border: { type: 'line' },
    style: {
      fg: 'white',
      border: { fg: 'cyan' },
    },
    inputOnFocus: true,
    keys: true,
    mouse: true,
  });

  screen.render();

  // Connect WebSocket
  const wsUrl = `wss://sync.builtwith.com/wss/new?KEY=${currentApiKey}`;
  wsLog.log('{yellow-fg}Connecting to WebSocket...{/yellow-fg}');

  try {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }

    wsConnection = new WebSocket(wsUrl);

    wsConnection.on('open', () => {
      wsLog.log('{green-fg}Connected to BuiltWith Live Feed{/green-fg}');
      wsLog.log('{cyan-fg}Commands: Type a tech name (e.g. Shopify) to subscribe{/cyan-fg}');
      wsLog.log('{cyan-fg}  "unsub <channel>" to unsubscribe{/cyan-fg}');
      wsLog.log('{cyan-fg}  "list" to list subscriptions{/cyan-fg}');
      wsLog.log('{cyan-fg}  "new", "new-historical", "premium" for rule channels{/cyan-fg}');
      screen.render();
    });

    wsConnection.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        wsLog.log(`{green-fg}>> ${JSON.stringify(msg, null, 2)}{/green-fg}`);
      } catch (e) {
        wsLog.log(`{white-fg}>> ${data.toString()}{/white-fg}`);
      }
      screen.render();
    });

    wsConnection.on('error', (err) => {
      wsLog.log(`{red-fg}Error: ${err.message}{/red-fg}`);
      screen.render();
    });

    wsConnection.on('close', () => {
      wsLog.log('{yellow-fg}WebSocket disconnected{/yellow-fg}');
      wsConnection = null;
      screen.render();
    });
  } catch (err) {
    wsLog.log(`{red-fg}Failed to connect: ${err.message}{/red-fg}`);
  }

  // Handle input
  wsInput.on('submit', (value) => {
    if (!value || !value.trim()) {
      wsInput.clearValue();
      wsInput.focus();
      screen.render();
      return;
    }

    const cmd = value.trim();
    wsInput.clearValue();
    wsInput.focus();

    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      wsLog.log('{red-fg}Not connected{/red-fg}');
      screen.render();
      return;
    }

    if (cmd === 'list') {
      wsConnection.send(JSON.stringify({ action: 'list_subscriptions' }));
      wsLog.log('{cyan-fg}<< list_subscriptions{/cyan-fg}');
    } else if (cmd.startsWith('unsub ')) {
      const channel = cmd.substring(6).trim();
      wsConnection.send(JSON.stringify({ action: 'unsubscribe', channel }));
      wsLog.log(`{cyan-fg}<< unsubscribe: ${channel}{/cyan-fg}`);
    } else {
      wsConnection.send(JSON.stringify({ action: 'subscribe', channel: cmd }));
      wsLog.log(`{cyan-fg}<< subscribe: ${cmd}{/cyan-fg}`);
    }
    screen.render();
  });

  wsInput.key('escape', () => {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    wsPanel.destroy();
    screen.render();
  });

  wsPanel.key('escape', () => {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    wsPanel.destroy();
    screen.render();
  });

  wsInput.focus();
  wsInput.readInput();
  screen.render();
}

// ── Event Handlers ─────────────────────────────────────────────────────────────
sidebar.on('select item', (item, index) => {
  showEndpointInfo(index);
});

sidebar.on('select', (item, index) => {
  const key = endpointKeys[index];
  showParamForm(key);
});

// Global keys
screen.key(['q', 'C-c'], () => {
  if (wsConnection) wsConnection.close();
  return process.exit(0);
});

screen.key('f1', () => {
  promptSetApiKey();
});

screen.key('f5', () => {
  showHistory();
});

screen.key('f9', () => {
  showWebSocket();
});

screen.key('tab', () => {
  if (sidebar.focused) {
    detailPanel.focus();
  } else {
    sidebar.focus();
  }
  screen.render();
});

// ── Splash Screen ──────────────────────────────────────────────────────────────
function showSplash(callback) {
  // Hide main UI during splash
  header.hide();
  sidebar.hide();
  detailPanel.hide();
  statusBar.hide();

  let artText = '';
  try {
    artText = fs.readFileSync(path.join(__dirname, '..', 'art', 'ascii.txt'), 'utf8');
  } catch (e) {
    // No art file, skip splash
    header.show(); sidebar.show(); detailPanel.show(); statusBar.show();
    callback();
    return;
  }

  // Scale art to half size: take every other row and every other column
  const rawLines = artText.split('\n').filter(l => l.length > 0);
  const artLines = [];
  for (let r = 0; r < rawLines.length; r += 2) {
    let scaled = '';
    for (let c = 0; c < rawLines[r].length; c += 2) {
      scaled += rawLines[r][c];
    }
    artLines.push(scaled);
  }

  const splash = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    style: { fg: 'green', bg: 'black' },
    tags: true,
  });

  // Green shades animation: dark -> bright -> settle
  const shades = [
    '#003300',
    '#005500',
    '#008800',
    '#00aa00',
    '#00cc00',
    '#00ff00',
    '#44ff44',
    '#88ff88',
    '#00ff00',
    '#00ff00',
  ];

  let frame = 0;

  function renderFrame() {
    if (frame >= shades.length) {
      splash.destroy();
      header.show();
      sidebar.show();
      detailPanel.show();
      statusBar.show();
      screen.render();
      callback();
      return;
    }

    splash.style.fg = shades[frame];

    // Center the art vertically and horizontally
    const screenH = screen.height;
    const screenW = screen.width;
    const artH = artLines.length;
    const topPad = Math.max(0, Math.floor((screenH - artH) / 2));

    const centeredLines = [];
    for (let i = 0; i < topPad; i++) centeredLines.push('');
    for (const line of artLines) {
      const pad = Math.max(0, Math.floor((screenW - line.length) / 2));
      centeredLines.push(' '.repeat(pad) + line);
    }

    splash.setContent(centeredLines.join('\n'));
    screen.render();

    frame++;
    setTimeout(renderFrame, 300);
  }

  renderFrame();

  // Allow skipping with any key
  splash.key(['escape', 'enter', 'space', 'q'], () => {
    frame = shades.length;
  });

  splash.focus();
  screen.render();
}

// ── Init ───────────────────────────────────────────────────────────────────────
showSplash(() => {
  sidebar.select(0);
  showEndpointInfo(0);
  sidebar.focus();
  updateStatus('Ready');
  screen.render();
});
