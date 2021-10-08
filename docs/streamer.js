API_KEY = "203f5305-32a5-4cbd-8754-945eb904fbbf";
const username = window.prompt("Please input your userID", "")
const usesCamera = window.confirm("Do you use the camera? \n If you don't, we'll share your screen.");

const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const localIdElm = document.getElementById('local-id');
  const statusElm = document.getElementById('status');

  let localStream;
  if (usesCamera) {
    localStream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      })
  } else {
    localStream = await navigator.mediaDevices.getDisplayMedia();
  }

  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  const peer = (window.peer = new Peer(username, {
    key: API_KEY,
    debug: 3,
  }));

  peer.on('open', id => (localIdElm.textContent = id));

  peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);
  });

   peer.on('error', console.error);
})();
