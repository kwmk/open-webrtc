export function getRTCStats(stats) {

    let trasportArray = [];
    let candidateArray = [];
    let candidatePairArray = [];
    let inboundRTPAudioStreamArray = [];
    let inboundRTPVideoStreamArray = [];
    let outboundRTPAudioStreamArray = [];
    let outboundRTPVideoStreamArray = [];
    let codecArray = [];
    let mediaStreamTrack_senderArray = [];
    let mediaStreamTrack_receiverArray = [];
    let mediaStreamTrack_local_audioArray = []
    let mediaStreamTrack_remote_audioArray = []
    let mediaStreamTrack_local_videoArray = []
    let mediaStreamTrack_remote_videoArray = []
    let candidatePairId = '';
    let localCandidateId = '';
    let remoteCandidateId = '';
    let localCandidate = {};
    let remoteCandidate = {};
    let inboundAudioCodec = {};
    let inboundVideoCodec = {};
    let outboundAudioCodec = {};
    let outboundVideoCodec = {};

    stats.forEach(stat => {
        if (stat.id.indexOf('RTCTransport') !== -1) {
            trasportArray.push(stat);
        }
        if (stat.id.indexOf('RTCIceCandidatePair') !== -1) {
            candidatePairArray.push(stat);
        }
        if (stat.id.indexOf('RTCIceCandidate_') !== -1) {
            candidateArray.push(stat);
        }
        if (stat.id.indexOf('RTCInboundRTPAudioStream') !== -1) {
            inboundRTPAudioStreamArray.push(stat);
        }
        if (stat.id.indexOf('RTCInboundRTPVideoStream') !== -1) {
            inboundRTPVideoStreamArray.push(stat);
        }
        if (stat.id.indexOf('RTCOutboundRTPAudioStream') !== -1) {
            outboundRTPAudioStreamArray.push(stat);
        }
        if (stat.id.indexOf('RTCOutboundRTPVideoStream') !== -1) {
            outboundRTPVideoStreamArray.push(stat);
        }
        if (stat.id.indexOf('RTCMediaStreamTrack_sender') !== -1) {
            mediaStreamTrack_senderArray.push(stat);
        }
        if (stat.id.indexOf('RTCMediaStreamTrack_receiver') !== -1) {
            mediaStreamTrack_receiverArray.push(stat);
        }
        if (stat.id.indexOf('RTCCodec') !== -1) {
            codecArray.push(stat);
        }
    });

    trasportArray.forEach(transport => {
        if (transport.dtlsState === 'connected') {
            candidatePairId = transport.selectedCandidatePairId;
        }
    });
    candidatePairArray.forEach(candidatePair => {
        if (candidatePair.state === 'succeeded' && candidatePair.id === candidatePairId) {
            localCandidateId = candidatePair.localCandidateId;
            remoteCandidateId = candidatePair.remoteCandidateId;
        }
    });
    candidateArray.forEach(candidate => {
        if (candidate.id === localCandidateId) {
            localCandidate = candidate;
        }
        if (candidate.id === remoteCandidateId) {
            remoteCandidate = candidate;
        }
    });

    inboundRTPAudioStreamArray.forEach(inboundRTPAudioStream => {
        codecArray.forEach(codec => {
            if (inboundRTPAudioStream.codecId === codec.id) {
                inboundAudioCodec = codec;
            }
        });
    });
    inboundRTPVideoStreamArray.forEach(inboundRTPVideoStream => {
        codecArray.forEach(codec => {
            if (inboundRTPVideoStream.codecId === codec.id) {
                inboundVideoCodec = codec;
            }
        });
    });
    outboundRTPAudioStreamArray.forEach(outboundRTPAudioStream => {
        codecArray.forEach(codec => {
            if (outboundRTPAudioStream.codecId === codec.id) {
                outboundAudioCodec = codec;
            }
        });
    });
    outboundRTPVideoStreamArray.forEach(outboundRTPVideo => {
        codecArray.forEach(codec => {
            if (outboundRTPVideo.codecId === codec.id) {
                outboundVideoCodec = codec;
            }
        });
    });
    mediaStreamTrack_senderArray.forEach(mediaStreamTrack => {
        if (mediaStreamTrack.kind === 'audio') {
            mediaStreamTrack_local_audioArray.push(mediaStreamTrack)
        } else if (mediaStreamTrack.kind === 'video') {
            mediaStreamTrack_local_videoArray.push(mediaStreamTrack)
        }
    });
    mediaStreamTrack_receiverArray.forEach(mediaStreamTrack => {
        if (mediaStreamTrack.kind === 'audio') {
            mediaStreamTrack_remote_audioArray.push(mediaStreamTrack)
        } else if (mediaStreamTrack.kind === 'video') {
            mediaStreamTrack_remote_videoArray.push(mediaStreamTrack)
        }
    });

    $('#local-candidate').html(localCandidate.ip + ':' + localCandidate.port + '(' + localCandidate.protocol + ')' + '<BR>type:' + localCandidate.candidateType);
    $('#remote-candidate').html(remoteCandidate.ip + ':' + remoteCandidate.port + '(' + remoteCandidate.protocol + ')' + '<BR>type:' + remoteCandidate.candidateType);

    $('#inbound-codec').html(inboundVideoCodec.mimeType + '<BR>' + inboundAudioCodec.mimeType);

    // $('#inbound-audio').html('bytesReceived:' + inboundRTPAudioStreamArray[0].bytesReceived + '<BR>jitter:' + inboundRTPAudioStreamArray[0].jitter + '<BR>fractionLost:' + inboundRTPAudioStreamArray[0].fractionLost);
    $('#inbound-video').html('bytesReceived(MB):' + (inboundRTPVideoStreamArray[0].bytesReceived / (1024 ** 2)).toFixed(1) + '<BR>fractionLost:' + inboundRTPVideoStreamArray[0].fractionLost);

    $('#remote-video').html('<BR>frameHeight:' + mediaStreamTrack_remote_videoArray[0].frameHeight + '<BR>frameWidth:' + mediaStreamTrack_remote_videoArray[0].frameWidth);

    let fps = inboundRTPVideoStreamArray[0].framesPerSecond;
    let height = mediaStreamTrack_remote_videoArray[0].frameHeight;
    let width = mediaStreamTrack_remote_videoArray[0].frameWidth;
    document.getElementById("fps-res").innerText = `${fps}fps ${height}x${width}`;
}
