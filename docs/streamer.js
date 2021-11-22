// 参考
// https://github.com/jellybeans511/open-webrtc
// https://webrtc.github.io/samples/src/content/devices/input-output/

API_KEY = "203f5305-32a5-4cbd-8754-945eb904fbbf";
const username = window.prompt("Please input your userID", "")
const usesCamera = window.confirm("Do you use the camera? \n If you don't, we'll share your screen.");

const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const localIdElm = document.getElementById('local-id');
  const statusElm = document.getElementById('status');
  const selectElm = document.getElementById('device');

  let localStream;
  let videoHeight = 720;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  videoDevices.map(device => {
    let optionElm = document.createElement('option');
    optionElm.innerText = device.label;
    optionElm.value = device.deviceId;
    selectElm.appendChild(optionElm);
  });

  async function gotStream(stream) {
    localStream = stream;
    localVideo.muted = true;
    localVideo.srcObject = stream;
    localVideo.playsInline = true;
    await localVideo.play().catch(console.error);
  }

  async function changeCamera() {
    // このifが無いとXZ1とかではカメラを切り替えられなくなる
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    const videoSource = selectElm.value;
    const constraints = {
      video: {
        deviceId: videoSource ? { exact: videoSource } : undefined,
        height: videoHeight
      }
    };
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    gotStream(localStream);
    if (mediaConnection && mediaConnection.open) {
      mediaConnection.close(true);
    }
  }

  selectElm.onchange = changeCamera;

  if (usesCamera) {
    changeCamera();
  } else {
    localStream = await navigator.mediaDevices.getDisplayMedia();
  }

  let mediaConnection;
  let dataConnection;

  const peer = (window.peer = new Peer(username, {
    key: API_KEY,
    debug: 3,
  }));

  peer.on('open', id => (localIdElm.textContent = id));

  peer.on('call', call => {
    mediaConnection = call;
    mediaConnection.answer(localStream);
  });

  async function onData(data) {
    videoHeight = Number(data);
    await changeCamera();
    mediaConnection.replaceStream(localStream);
  }

  peer.on('connection', conn => {
    dataConnection = conn;
    dataConnection.on('data', onData);
  });

  peer.on('error', console.error);
})();
