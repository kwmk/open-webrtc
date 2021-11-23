// 参考
// https://github.com/jellybeans511/open-webrtc
// https://webrtc.github.io/samples/src/content/devices/input-output/
// https://stackoverflow.com/questions/7042611/override-console-log-for-production

var logger = document.getElementById('log');
for (let i = 0; i < 5; i++) {
  logger.appendChild(document.createElement('p'));
}

function showLogHtml(text, ...args) {
  let oneLog = document.createElement('p');
  string_args = args.map(arg => {
      return JSON.stringify(arg);
  });
  oneLog.innerHTML = text.concat(...string_args) + '<br />';
  if (logger.lastChild.innerHTML === oneLog.innerHTML) return;
  logger.removeChild(logger.firstChild);
  logger.appendChild(oneLog);
}

var console = (function (oldCons) {
  return {
    log: function (text, ...args) {
      oldCons.log(text, ...args);
      showLogHtml(text, ...args);
    },
    info: function (text, ...args) {
      oldCons.info(text, ...args);
      showLogHtml(text, ...args);
    },
    warn: function (text, ...args) {
      oldCons.warn(text, ...args);
      showLogHtml(text, ...args);
    },
    error: function (text, ...args) {
      oldCons.error(text, ...args);
      showLogHtml(text, ...args);
    }
  };
}(window.console));

//Then redefine the old console
window.console = console;
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
  }

  async function onChangeSelection() {
    await changeCamera();
    if (mediaConnection && mediaConnection.open) {
      mediaConnection.close(true);
    }
  }

  selectElm.onchange = onChangeSelection;

  if (usesCamera) {
    changeCamera();
  } else {
    localStream = await navigator.mediaDevices.getDisplayMedia();
    gotStream(localStream);
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
