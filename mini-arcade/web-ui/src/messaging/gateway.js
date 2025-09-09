let isReady = false;
let queue = [];
let latestSettings = null;
let listeners = [];

// Returns the contentWindow of the game iframe, or null if not found
function getIframeWindow() {
  const iframe = document.querySelector('iframe');
  return iframe && iframe.contentWindow ? iframe.contentWindow : null;
}

// Checks if a value is a finite number
function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

// Validates outbound messages to the game
function validateOutbound(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.type === 'start' || msg.type === 'pause' || msg.type === 'resume' || msg.type === 'restart') {
    return true;
  }
  if (
      msg.type === 'settings' &&
      typeof msg.sound === 'boolean' &&
      (msg.difficulty === 'easy' || msg.difficulty === 'hard')
  ) {
    return true;
  }
  return false;
}

// Validates inbound messages from the game
function validateInbound(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.type === 'ready') return true;
  if (msg.type === 'score' && isFiniteNumber(msg.value)) return true;
  if (msg.type === 'gameover' && isFiniteNumber(msg.finalScore)) return true;
  return false;
}

// Sends a message to the game iframe, or queues it if not ready
export function sendMessage(msg) {
  if (!validateOutbound(msg)) return false;
  const win = getIframeWindow();
  if (!isReady || !win) {
    if (msg.type === 'settings') {
      latestSettings = msg;
    } else {
      queue.push(msg);
    }
    return true;
  }
  win.postMessage(msg, '*');
  return true;
}

// Registers a callback for inbound game messages
export function onGameMessage(cb) {
  if (typeof cb !== 'function') return () => {};
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

// Sends all queued messages to the game once it is ready
function flushQueue() {
  const win = getIframeWindow();
  if (!win) return;
  if (latestSettings) {
    win.postMessage(latestSettings, '*');
    latestSettings = null;
  }
  while (queue.length) {
    win.postMessage(queue.shift(), '*');
  }
}

// Handles messages from the game iframe
function handleWindowMessage(event) {
  const win = getIframeWindow();
  if (!win || event.source !== win) return;
  const msg = event.data;
  if (!validateInbound(msg)) return;
  if (msg.type === 'ready') {
    isReady = true;
    flushQueue();
  }
  for (const cb of listeners) {
    try { cb(msg); } catch {}
  }
}

// Listen for messages from the game iframe
window.addEventListener('message', handleWindowMessage);

// Waits for the game to become ready, or rejects after a timeout
export function waitForReady(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (isReady) return resolve();
    const off = onGameMessage((m) => {
      if (m.type === 'ready') {
        off();
        resolve();
      }
    });
    const to = setTimeout(() => {
      off();
      reject(new Error('Game not ready'));
    }, timeout);
    waitForReady._timeout = to;
  });
}

// Returns whether the game is ready
export function isGameReady() {
  return isReady;
}

// Resets gateway state for tests
export function _resetGatewayForTests() {
  isReady = false;
  queue = [];
  listeners = [];
  latestSettings = null;
}
