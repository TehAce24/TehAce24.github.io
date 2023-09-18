import { PitchDetector } from "https://esm.sh/pitchy@4";

let currentPitch = 0;
let targetPitch = 0;
let minimumPitch = 0;
let maximumPitch = 0;
let progressValue = 50;
let presetTuning = false;
let customTuning = false;
let tipShown = false;
let listDevices = new Map();
let selectedTuning = "";
let selectedCustomNote;
let selectedCustomPitch = 0;
const clarityThreshold = 0.8;

// Create an array for each note and their frequencies
const tunings = {
    standard: [
    { name: "E", minFreq:  72, maxFreq:  92, pitch: 82 },
    { name: "A", minFreq: 100, maxFreq: 120, pitch: 110  },
    { name: "D", minFreq: 137, maxFreq: 157, pitch: 146  },
    { name: "G", minFreq: 186, maxFreq: 206, pitch: 196  },
    { name: "B", minFreq: 236, maxFreq: 256, pitch: 247  },
    { name: "E", minFreq: 320, maxFreq: 340, pitch: 330  }
    ],
    dropD: [
    { name: "D", minFreq: 63, maxFreq: 83, pitch: 73  },
    { name: "A", minFreq: 100, maxFreq: 120, pitch: 110  },
    { name: "D", minFreq: 137, maxFreq: 157, pitch: 146  },
    { name: "G", minFreq: 186, maxFreq: 206, pitch: 196  },
    { name: "B", minFreq: 236, maxFreq: 256, pitch: 247  },
    { name: "E", minFreq: 320, maxFreq: 340, pitch: 330  }
    ],
    eFlat: [
    { name: "Eb", minFreq: 68, maxFreq:  88, pitch: 78  },
    { name: "Ab", minFreq: 94, maxFreq: 114, pitch: 104  },
    { name: "Db", minFreq: 129, maxFreq: 149, pitch: 139  },
    { name: "Gb", minFreq: 175, maxFreq: 195, pitch: 185  },
    { name: "Bb", minFreq: 223, maxFreq: 243, pitch: 233  },
    { name: "Eb", minFreq: 301, maxFreq: 321, pitch: 311  }
    ],
};

const noteArray = [
  { note: "C2", freq: 65 },
  { note: "C#2", freq: 69 },
  { note: "D2", freq: 73 },
  { note: "D#2", freq: 78 },
  { note: "E2", freq: 82 },
  { note: "F2", freq: 87 },
  { note: "F#2", freq: 92 },
  { note: "G2", freq: 98 },
  { note: "G#2", freq: 104 },
  { note: "A2", freq: 110 },
  { note: "A#2", freq: 117 },
  { note: "B2", freq: 123 },
  { note: "C3", freq: 131 },
  { note: "C#3", freq: 139 },
  { note: "D3", freq: 147 },
  { note: "D#3", freq: 156 },
  { note: "E3", freq: 165 },
  { note: "F3", freq: 175 },
  { note: "F#3", freq: 185 },
  { note: "G3", freq: 196 },
  { note: "G#3", freq: 208 },
  { note: "A3", freq: 220 },
  { note: "A#3", freq: 233 },
  { note: "B3", freq: 247 },
  { note: "C4", freq: 262 },
  { note: "C#4", freq: 277 },
  { note: "D4", freq: 294 },
  { note: "D#4", freq: 311 },
  { note: "E4", freq: 330 },
  { note: "F4", freq: 349 },
  { note: "F#4", freq: 370 },
  { note: "G4", freq: 392 },
  { note: "G#4", freq: 415 },
  { note: "A4", freq: 440 },
  { note: "A#4", freq: 466 },
  { note: "B4", freq: 494 },
  { note: "C5", freq: 523 },
  { note: "C#5", freq: 554 },
  { note: "D5", freq: 587 },
  { note: "D#5", freq: 622 },
  { note: "E5", freq: 659 },
  { note: "F5", freq: 698 },
  { note: "F#5", freq: 740 },
  { note: "G5", freq: 784 },
  { note: "G#5", freq: 831 },
  { note: "A5", freq: 880 },
  { note: "A#5", freq: 932 },
  { note: "B5", freq: 988 },
  { note: "C6", freq: 1047 },
  { note: "C#6", freq: 1109 },
  { note: "D6", freq: 1175 },
  { note: "D#6", freq: 1245 },
  { note: "E6", freq: 1319 },
  { note: "F6", freq: 1397 },
  { note: "F#6", freq: 1480 },
  { note: "G6", freq: 1568 },
  { note: "G#6", freq: 1661 },
  { note: "A6", freq: 1760 },
  { note: "A#6", freq: 1865 },
  { note: "B6", freq: 1975 }
];

const standardTuning = tunings["standard"];
const dropDTuning = tunings["dropD"];
const eFlatTuning = tunings["eFlat"];

const getTuning = document.querySelectorAll('[data-string]');
const adjust = document.getElementById('adjustString');
const toastTip = document.getElementById('tipToast');
const record = document.getElementById('recording');
//const dropdown = document.getElementById('devices');
const dropDown = document.querySelector('.dropdown-menu');
const dropDownItems = document.querySelector('.dropdown-item');
const dropDownText = document.getElementById('dropDownText');
const progressBar = document.querySelector('.progress-fill');
const startTunerButton = document.getElementById('startTuner');
const currentNote = document.getElementById('currentNote');
const getTunings = document.getElementsByName('tuning');
const targetPitchText = document.getElementById('targetPitch');

noteArray.forEach((value) => {
    const listItem = document.createElement('li');
    listItem.classList.add("dropdown-item");
    listItem.textContent = value.note;
    listItem.value = value.freq;
    dropDown.appendChild(listItem);
    listItem.addEventListener('click', () => {
        presetTuning = false;
        customTuning = true;
        selectedCustomNote = value.note;
        selectedCustomPitch = value.freq;
        tuneGuitar();
    });
})

/*
listDevices.forEach((value, key) => {
    const option = document.createElement('option')
    option.value = key;
    option.textContent = value;
    dropdown.appendChild(dropDownItems);
});
*/

/*
// Obtain the target pitch
getTuning.forEach((tuning) => {
    getTuning.addEventListener('click', () => {
        const selectedTuning = getTuning.getAttribute('data-string');
        targetPitch = selectedString;
        document.getElementById("targetPitch").textContent = `${targetPitch} Hz`;
        isTuning = true;
        tuneGuitar();
    })
})
*/

// Retrieve the pitch using PitchDetector
function updatePitch(analyserNode, detector, input, sampleRate) {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);

    /*document.getElementById("clarity").textContent = `${Math.round(
        clarity * 100,
    )} %`;
    //console.log(clarity);*/

    // Make the tuner only log pitch when clarity is higher than threshold
    if (clarity > clarityThreshold) {
        document.getElementById("pitch").textContent = `${
            Math.round(pitch)
        } Hz`;
        currentPitch = pitch;
    }
    // Add a delay
    window.setTimeout(() => updatePitch(analyserNode, detector, input, sampleRate), 100, );
}

document.addEventListener("DOMContentLoaded", () => {
    // Initialize the popper feature in bootstrap
    $(document).ready(function() {
        $('[data-bs-toggle="popover"]').popover();
    });

    $(document).ready(function() {
        $('.dropdown-toggle').dropdown();
    });
    startTunerButton.addEventListener('click', () => {
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
        presetTuning = true;
        tipShown = true;
        tuneGuitar();
        };

    // Reset Mic if browser is not picking it up
    document.getElementById("resetMic").addEventListener("click", () => audioContext.resume());

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        audioContext.createMediaStreamSource(stream).connect(analyserNode);
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        const input = new Float32Array(detector.inputLength);
        updatePitch(analyserNode, detector, input, audioContext.sampleRate);
      });
    });

});

function tuneGuitar() {
    // Start an asynchronous loop. This function will always be running when called.
    (async () => {
        if (tipShown) {
            const toastBootstrap = new bootstrap.Toast(toastTip, { autohide: false });
            toastBootstrap.show()
            /*
            if (Math.abs(currentPitch - targetPitch) >= 100 && !tipShown) {
                const toastBootstrap = new bootstrap.Toast(toastTip, { autohide: false });
                toastBootstrap.show()
            };
            */
        };
        while (customTuning && !presetTuning) {
            targetPitch = selectedCustomPitch;
            getNotes(targetPitch)
            dropDownText.innerHTML = selectedCustomNote;
            console.log(getTunings);

            // Add delay to avoid crashing browser
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        while (presetTuning && !customTuning) {
            getTuning.forEach((tuning) => {
                tuning.addEventListener('click', () => {
                selectedTuning = tuning.getAttribute('data-string');
                });
            });
            if (selectedTuning === 'standard') {
                standardTuning.forEach((note) => {
                    getNotes(note);
                });
            } else if (selectedTuning === 'dropD') {
                dropDTuning.forEach((note) => {
                    getNotes(note);
                });
            } else if (selectedTuning === 'eFlat') {
                eFlatTuning.forEach((note) => {
                    getNotes(note);
                });
            };
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    })();
}

function getNotes(note) {
    if (presetTuning) {
        if (currentPitch > note.minFreq && currentPitch < note.maxFreq) {
            currentNote.innerHTML = note.name;
            minimumPitch = note.minFreq;
            maximumPitch = note.maxFreq;
            targetPitch = (note.minFreq + note.maxFreq) / 2;
            const calculate = interp(currentPitch, minimumPitch, maximumPitch,  0, 100)
            targetPitchText.innerHTML = `${note.pitch} Hz`;
            drawMeter(calculate);
            guitarTuner(currentPitch, targetPitch);
        };
    } else {
       minimumPitch = targetPitch - 300;
       maximumPitch = targetPitch + 300;
       const calculate = interp(currentPitch, minimumPitch, maximumPitch, 0, 100)
       targetPitchText.innerHTML = `${selectedCustomPitch} Hz`;
       drawMeter(calculate);
       guitarTuner(currentPitch, targetPitch);
    }
};

function guitarTuner(pitch, targetPitch) {
    if (Math.abs(pitch - targetPitch) <= 1) {
        adjust.innerHTML = "Tuned";
    } else if (pitch > targetPitch) {
        adjust.innerHTML = "Lower";
    } else if (pitch < targetPitch) {
        adjust.innerHTML = "Higher";
    }
}

function drawMeter(calculate) {
    //const percent = Math.min(100, Math.max(0, calculate));
    progressBar.style.left = `${calculate}%`;
    progressBar.setAttribute('aria-valuenow', calculate)
    if (calculate >= 45 && calculate <= 55) {
        progressBar.style.backgroundColor = 'green';
    } else {
        progressBar.style.backgroundColor = 'red';
    };
};

function interp(x, x0, x1, y0, y1) {
    // This is similar to the numpy interp function which is used to give a percentage of the inputs.
    // interp([value], [lower input], [higher input], [lower output], [higher output]
    if (x0 === x1) {
        return y0;
    }
    var percent = Math.round((y0 + (x - x0) * (y1 - y0) / (x1 - x0)));

    // This part makes sure the percentage range is 0-100% if y0, y1 = 0, 100
    if (y0 === 0 && y1 === 100) {
        if (percent < y0) {
        percent = y0;
        } else if (percent > y1) {
            percent = y1;
        };
    };

    return percent
}
