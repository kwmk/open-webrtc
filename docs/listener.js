const API_KEY = "203f5305-32a5-4cbd-8754-945eb904fbbf";

const Peer = window.Peer;

import { getRTCStats } from './getStats.js';
import { getTime } from './utils.js';

(async function main() {
  const localIdElm = document.getElementById('js-local-id');
  const callTrigger = document.getElementById('js-call-trigger');
  const closeTrigger = document.getElementById('js-close-trigger');
  const remoteVideo = document.getElementById('js-remote-stream');
  const remoteIdElm = document.getElementById('js-remote-id');

  const peer = (window.peer = new Peer({
    key: API_KEY,
    debug: 3,
  }));

  peer.on('open', (id) => {
    localIdElm.textContent = id
    callTrigger.classList.remove('disabled');
  });

  let mediaConnection;
  // Register caller handler
  callTrigger.addEventListener('click', () => {
    mediaConnection = peer.call(remoteIdElm.value);

    mediaConnection.on('stream', async stream => {
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
      closeTrigger.classList.remove('disabled');
    });

    mediaConnection.on('close', () => {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      closeTrigger.classList.add('disabled');
    });
  });

  closeTrigger.addEventListener('click', () => {
    mediaConnection.close(true)
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
})();

function showTime() {
  document.getElementById("time").innerText = getTime();
}
setInterval(showTime, 1000);
