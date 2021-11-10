const API_KEY = "203f5305-32a5-4cbd-8754-945eb904fbbf";

const Peer = window.Peer;

import { getRTCStats } from './getStats.js';
import { getTime } from './utils.js';

const localIdElm = document.getElementById('js-local-id');
const callTrigger = document.getElementById('js-call-trigger');
const closeTrigger = document.getElementById('js-close-trigger');
const heightButton = document.getElementById('height-button');
const remoteVideo = document.getElementById('js-remote-stream');
const remoteIdElm = document.getElementById('js-remote-id');
const heightElm = document.getElementById('height-input');

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
  closeTrigger.classList.remove('disabled');
}

function onCloseMedia() {
  remoteVideo.srcObject.getTracks().forEach(track => track.stop());
  remoteVideo.srcObject = null;
  closeTrigger.classList.add('disabled');
}

callTrigger.addEventListener('click', () => {
  mediaConnection = peer.call(remoteIdElm.value);
  mediaConnection.on('stream', onStream);
  mediaConnection.on('close', onCloseMedia);
  dataConnection = peer.connect(remoteIdElm.value);
});

closeTrigger.addEventListener('click', () => {
  mediaConnection.off('stream', onStream);
  mediaConnection.off('close', onCloseMedia);
  mediaConnection.close(true);
  dataConnection.close(true);
});

heightButton.addEventListener('click', () => {
  let height = heightElm.value;
  dataConnection.send(height);
});

peer.on('error', console.error);

let stats;
async function showStatus() {
  if (mediaConnection && mediaConnection.open) {
    stats = await mediaConnection.getPeerConnection().getStats()
    getRTCStats(stats);
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
