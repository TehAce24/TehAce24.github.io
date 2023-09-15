import { PitchDetector } from "https://esm.sh/pitchy@4";

var currentPitch = 0;
var targetPitch = 0;
var minimumPitch = 0;
var maximumPitch = 0;
let progressValue = 50;
let isTuning = false;
let tipShown = false;
let listDevices = new Map();

// style="transition: width 5s linear;"

const strings = document.querySelectorAll('[data-string]');
const adjust = document.getElementById('adjustString');
const toastTip = document.getElementById('tipToast');
const record = document.getElementById('recording');
const dropdown = document.getElementById('devices');
const progressBar = document.querySelector('.progress-fill')


listDevices.forEach((value, key) => {
    const option = document.createElement('option')
    option.value = key;
    option.textContent = value;
    console.log("test")
    dropdown.appendChild(dropDownItems);
});


// Obtain the target pitch
strings.forEach((string) => {
    string.addEventListener('click', () => {
        const selectedString = string.getAttribute('data-string');
        targetPitch = selectedString;
        document.getElementById("targetPitch").textContent = `${targetPitch} Hz`;
        isTuning = true;
        tuneGuitar();
    })
})

// Retrieve the pitch using the PitchDetector library
function updatePitch(analyserNode, detector, input, sampleRate) {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);

    /*document.getElementById("clarity").textContent = `${Math.round(
        clarity * 100,
    )} %`;
    //console.log(clarity);*/
    if (clarity > 0.9) {
        document.getElementById("pitch").textContent = `${
            Math.round(pitch)
        } Hz`;
        currentPitch = pitch;
    }

    window.setTimeout(() => updatePitch(analyserNode, detector, input, sampleRate), 100, );
}

document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new window.AudioContext();
    const analyserNode = audioContext.createAnalyser();
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            listDevices.set(`${device.label}, ${device.deviceId}`);
          });
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
        });
    }

    // Reset Mic if browser is not picking it up
    document.getElementById("resetMic").addEventListener("click", () => audioContext.resume());

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        audioContext.createMediaStreamSource(stream).connect(analyserNode);
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        const input = new Float32Array(detector.inputLength);
        updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  });
});

function tuneGuitar() {
    // Start an asynchronous loop
    (async () => {
        while (isTuning) {
            //console.log("Target Pitch:", targetPitch);
            //console.log("Current Pitch:", currentPitch);

            minimumPitch = currentPitch - 20;
            maximumPitch = currentPitch + 20;
            if (Math.abs(currentPitch - targetPitch) >= 100 && !tipShown) {
                const toastBootstrap = new bootstrap.Toast(toastTip, { autohide: false });
                toastBootstrap.show()
                tipShown = true;
            }
            drawMeter();
            guitarTuner(currentPitch, targetPitch);

            // Add a delay
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    })();
}

function guitarTuner(pitch, targetPitch) {
    if (Math.abs(pitch - targetPitch) <= 2) {
        adjust.innerHTML = "Tuned";
    } else if (pitch > targetPitch) {
        adjust.innerHTML = "Lower";
    } else if (pitch < targetPitch) {
        adjust.innerHTML = "Higher";
    }
}

function drawMeter() {
    const calculate = interp(targetPitch, maximumPitch, minimumPitch,  0, 100)
    //const percent = Math.min(100, Math.max(0, calculate));

    progressBar.style.left = `${calculate}%`;
    progressBar.setAttribute('aria-valuenow', calculate)
    console.log(calculate)
    if (calculate >= 40 && calculate <= 60) {
        progressBar.style.backgroundColor = 'green';
    } else {
        progressBar.style.backgroundColor = 'red';
    }
}

function interp(x, x0, x1, y0, y1) {
    // This is similar to the numpy interp function which is used to give a percentage of the inputs.
    // interp([value], [lower input], [higher input], [lower output], [higher output]
    if (x0 === x1) {
        return y0;
    }
    let percent = Math.round((y0 + (x - x0) * (y1 - y0) / (x1 - x0)));

    if (percent < y0) {
        percent = y0;
    } else if (percent > y1) {
        percent = y1;
    }
    return percent
}


