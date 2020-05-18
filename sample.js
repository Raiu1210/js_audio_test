var localVideo = document.getElementById('local_video');
var videoContainer = document.getElementById('container');
var micList = document.getElementById("mic_list");
var cameraList = document.getElementById("camera_list");
var speakerList = document.getElementById("speaker_list");

var localStream = null;

function stopVideo() {
    localVideo.pause();
    if (localVideo.srcObject) {
        localVideo.srcObject = null;
    } else {
        localVideo.src = "";
    }

    if (localStream) {
        stopStream(localStream);
        localStream = null;
    }
}

function stopStream(stream) {
    if (!stream) {
        console.warn('NO stream');
        return;
    }

    var tracks = stream.getTracks();
    if (!tracks) {
        console.warn('NO tracks');
        return;
    }

    for (index in tracks) {
        tracks[index].stop();
    }
}

function logStream(msg, stream) {
    console.log(msg + ': id=' + stream.id);

    var videoTracks = stream.getVideoTracks();
    if (videoTracks) {
        console.log('videoTracks.length=' + videoTracks.length);
        for (var i = 0; i < videoTracks.length; i++) {
            var track = videoTracks[i];
            console.log(' track.id=' + track.id);
        }
    }

    var audioTracks = stream.getAudioTracks();
    if (audioTracks) {
        console.log('audioTracks.length=' + audioTracks.length);
        for (var i = 0; i < audioTracks.length; i++) {
            var track = audioTracks[i];
            console.log(' track.id=' + track.id);
        }
    }
}


//--------------------

function clearDeviceList() {
    while (micList.lastChild) {
        micList.removeChild(micList.lastChild);
    }
    while (cameraList.lastChild) {
        cameraList.removeChild(cameraList.lastChild);
    }
    while (speakerList.lastChild) {
        speakerList.removeChild(speakerList.lastChild);
    }
}

function addDevice(device) {
    if (device.kind === 'audioinput') {
        var id = device.deviceId;
        var label = device.label || 'microphone'; // label is available for https 
        var option = document.createElement('option');
        option.setAttribute('value', id);
        option.innerHTML = label + '(' + id + ')';;
        micList.appendChild(option);
    } else if (device.kind === 'videoinput') {
        var id = device.deviceId;
        var label = device.label || 'camera'; // label is available for https 

        var option = document.createElement('option');
        option.setAttribute('value', id);
        option.innerHTML = label + '(' + id + ')';
        cameraList.appendChild(option);
    } else if (device.kind === 'audiooutput') {
        var id = device.deviceId;
        var label = device.label || 'speaker'; // label is available for https 

        var option = document.createElement('option');
        option.setAttribute('value', id);
        option.innerHTML = label + '(' + id + ')';
        speakerList.appendChild(option);
    } else {
        console.error('UNKNOWN Device kind:' + device.kind);
    }
}

function getDeviceList() {
    clearDeviceList();
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device) {
                console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
                addDevice(device);
            });
        })
        .catch(function(err) {
            console.error('enumerateDevide ERROR:', err);
        });
}

function getSelectedVideo() {
    var id = cameraList.options[cameraList.selectedIndex].value;
    return id;
}

function getSelectedAudio() {
    var id = micList.options[micList.selectedIndex].value;
    return id;
}

function getSelectedSpeaker() {
    var id = speakerList.options[speakerList.selectedIndex].value;
    return id;
}

function setSpeaker() {
    var speakerId = getSelectedSpeaker();
    localVideo.volume = 0;
    localVideo.setSinkId(speakerId)
        .then(function() {
            console.log('setSinkID Success');
        })
        .catch(function(err) {
            console.error('setSinkId Err:', err);
        });
}

function startFakeVideo() {
    var constraints = { video: true, fake: true, audio: false };
    navigator.mediaDevices.getUserMedia(
        constraints
    ).then(function(stream) {
        localStream = stream;
        logStream('selectedVideo', stream);
        localVideo.srcObject = stream;
    }).catch(function(err) {
        console.error('getUserMedia Err:', err);
    });
}

function startSelectedVideoAudio() {
    var audioId = getSelectedAudio();
    var deviceId = getSelectedVideo();
    console.log('selected video device id=' + deviceId + ' ,  audio=' + audioId);
    var constraints = {
        audio: {
            deviceId: audioId
        },
        video: {
            deviceId: deviceId
        }
    };
    console.log('mediaDevice.getMedia() constraints:', constraints);

    navigator.mediaDevices.getUserMedia(
        constraints
    ).then(function(stream) {
        localStream = stream;
        logStream('selectedVideo', stream);
        localVideo.srcObject = stream;
    }).catch(function(err) {
        console.error('getUserMedia Err:', err);
    });
}

navigator.mediaDevices.ondevicechange = function(evt) {
    console.log('mediaDevices.ondevicechange() evt:', evt);
};