const API_KEY = "203f5305-32a5-4cbd-8754-945eb904fbbf";

const Peer = window.Peer;

import { getRTCStats } from './getStats.js';
import { getTime } from './utils.js';

const localIdElm = document.getElementById('js-local-id');
const callTrigger = document.getElementById('js-call-trigger');
const heightButton = document.getElementById('height-button');
const remoteVideo = document.getElementById('js-remote-stream');
const remoteIdElm = document.getElementById('js-remote-id');
const heightElm = document.getElementById('height-input');
const statusElm = document.getElementById('media-connection-status');

const peer = (window.peer = new Peer({
  key: API_KEY,
  debug: 3,
}));

peer.on('open', (id) => {
  localIdElm.textContent = id
  callTrigger.classList.remove('disabled');
});

let mediaConnection;
let dataConnection;
// Register caller handler

async function onStream(stream) {
  remoteVideo.srcObject = stream;
  remoteVideo.playsInline = true;
  await remoteVideo.play().catch(console.error);
}

function onCloseMedia() {
  remoteVideo.srcObject.getTracks().forEach(track => track.stop());
  remoteVideo.srcObject = null;
}

callTrigger.addEventListener('click', () => {
  mediaConnection = peer.call(remoteIdElm.value);
  mediaConnection.off('stream', onStream);
  mediaConnection.off('close', onCloseMedia);
  mediaConnection.on('stream', onStream);
  mediaConnection.on('close', onCloseMedia);
  dataConnection = peer.connect(remoteIdElm.value);
  setTimeout(() => {
    heightButton.click();
  }, 2000);
});

heightButton.addEventListener('click', () => {
  let height = heightElm.value;
  dataConnection.send(height);
});

peer.on('error', console.error);

function is_undefined_fps() {
  return document.getElementById("fps-res")
    .innerText.indexOf('undefined') !== -1;
}

let stats;
async function showStatus() {
  if (mediaConnection && mediaConnection.open && !is_undefined_fps()) {
    stats = await mediaConnection.getPeerConnection().getStats()
    getRTCStats(stats);
    statusElm.innerText = 'open';
  } else if (mediaConnection && mediaConnection.open && is_undefined_fps()) {
    stats = await mediaConnection.getPeerConnection().getStats()
    getRTCStats(stats);
    statusElm.innerText = 'try connecting(browser)';
  } else if (mediaConnection) {
    statusElm.innerText = 'try connecting(app)';
    callTrigger.click();
  } else {
    statusElm.innerText = 'close';
  }
}
setInterval(showStatus, 1000);

function showTime() {
  document.getElementById("time").innerText = getTime();
}
setInterval(showTime, 1000);

document.body.addEventListener('keydown', event => {
  if (event.key === 'h') {
    document.getElementById('peer-data').classList.toggle('hidden');
  }
});

remoteIdElm.addEventListener('keydown', event => {
  if (event.key === "Enter") {
    callTrigger.click();
  }
  event.stopPropagation();
});

heightElm.addEventListener('keydown', event => {
  if (event.key === "Enter") {
    heightButton.click();
  }
  event.stopPropagation();
});

let timer;
window.addEventListener('mousemove', function () {
  document.body.classList.remove("cursor-hide");
  clearTimeout(timer);
  timer = setTimeout(function () {
    document.body.classList.add("cursor-hide");
  }, 1000);
});
