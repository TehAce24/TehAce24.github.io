
let chorusFrequency;
let chorusDelay;
let chorusDepth;
let tremoloFrequency;
let tremoloDepth;
let isVolume = false;
let chorusEnable = false;
let tremoloEnable = false;
let chordModeEnable = false;
let chordCount;

// Create the audio effects from Tone.js synthesizer
const synth = new Tone.PolySynth().toDestination();
const plucky = new Tone.PluckSynth().toDestination();
const dist = new Tone.Distortion(0.2).toDestination();
const filter = new Tone.Filter(1500, 'highpass').toDestination();
filter.frequency.rampTo(1000, 10);

const chorus = new Tone.Chorus(chorusFrequency, chorusDelay, chorusDepth).toDestination().start();
const tremolo = new Tone.Tremolo(tremoloFrequency, tremoloDepth).toDestination().start();
const comp = new Tone.Compressor(-20, 5);
const reverb = new Tone.Reverb(2).toDestination();
const delay = new Tone.Delay(0.02, 1).toDestination();
const time = Tone.Time("4n").toSeconds();
const now = Tone.now();
const delayBetweenNotes = 60;
Tone.context.lookAhead = 0;
Tone.Transport.start(2);

let chords = [];
const maxChords = 6;
var soundType = "acoustic";

const chordModeButton = document.getElementById('chordMode')
const playChordButton = document.getElementById('playChords')
const guitarStrings = document.querySelectorAll('.guitar-strings');
const guitarNotes = document.querySelectorAll('.guitar-note');
const guitarDropdown = document.getElementById('guitarDropdown')
let volumeRange = document.querySelector("#volume-range");
const chorusButton = document.getElementById("chorus-btn")
const tremoloButton = document.getElementById("tremolo-btn")

// Get value of volume slider and set global volume.
var volume = document.getElementById("volume");


playChordButton.addEventListener('click', function() {
    for (let i = 0; i < maxChords; i++) {
        setTimeout(function() {
            let note = chords[i];
            playGuitarSound(note);
        }, i * delayBetweenNotes); // Adjust delayBetweenNotes as needed
    }
});


/*
playChordButton.addEventListener('click', function() {
    Tone.Transport.cancel();
    chords.forEach((note, index) => {
        Tone.Transport.scheduleOnce((time) => {
        console.log(note);
            playGuitarSound(note);
        }, '+${index * delayBetweenNotes}');
    });
    Tone.Transport.start();
});
*/

volumeRange.addEventListener("input", function() {
    let volume = volumeRange.value;
    console.log(volume);
    Tone.Master.volume.value = volume;
    toggleBounce();
});

volumeRange.addEventListener("mouseup", function() {
    stopBounce();
});

function toggleBounce() {
 if (!isVolume) {
    isVolume = true;
    volume.classList.add("fa-beat");
 };
};

function stopBounce() {
 if (isVolume) {
    isVolume = false;
    volume.classList.remove("fa-beat");
 };
};

chordModeButton.addEventListener('click', toggleChordMode);
function toggleChordMode() {
    chordModeEnable = !chordModeEnable; // Toggle chorus mode
    if (chordModeEnable) {
        console.log("Chord mode on");
        // If chord mode is enabled, add the click event listeners to note buttons
        chordMode.style.backgroundColor = '#0075dd';
        guitarNotes.forEach((noteButton) => {
            noteButton.addEventListener('click', getChords);
        });
    } else {
        console.log("Chord mode off");
        chords = [];
        chordMode.style.backgroundColor = '#6c757d';
        guitarNotes.forEach((noteElement) => {
            noteElement.style.backgroundColor = 'transparent';
        })

        /*
        chords.forEach((note) => {
                const noteElement = document.querySelector(`[data-note="${note}"]`);
                console.log(noteElement)
                noteElement.style.backgroundColor = 'transparent';
            });
         */
         // If chord mode is disabled, remove the click event listeners from note buttons
        guitarNotes.forEach((noteButton) => {
            noteButton.removeEventListener('click', getChords);
        });
    }
}

function getChords() {
    if (chords.length < 6) {
        const noteElement = this;
        if (chordModeEnable) {
            noteElement.style.backgroundColor = '#0075dd';
        }
        const note = noteElement.getAttribute('data-note') // Get notes from data-note
        chords.push(note);
        console.log(chords);
    } else {
        chords.shift();
        const note = this.getAttribute('data-note'); // Get notes from data-note
        if (chordModeEnable) {
            noteElement.style.backgroundColor = '#0075dd';
        }
        chords.push(note);
        console.log(chords);
    }
}

// Get values of chorus slider
const chorusFrequencyRange = document.querySelector("#chorus-frequency");
chorusFrequencyRange.addEventListener("input", function() {
    let chorusFrequency = chorusFrequencyRange.value;
    console.log(chorusFrequency);
})

const chorusDelayRange = document.querySelector("#chorus-delay");
chorusDelayRange.addEventListener("input", function() {
    let chorusDelay = chorusDelayRange.value;
    console.log(chorusDelay);
})

const chorusDepthRange = document.querySelector("#chorus-depth");
chorusDepthRange.addEventListener("input", function() {
    let chorusDepth = chorusDepthRange.value;
    console.log(chorusDepth);
})

chorusButton.addEventListener("click", function() {
    if (chorusEnable === false) {
        chorusEnable = true;
        document.getElementById("chorus-btn").innerHTML = "Disable"
        chorusButton.style.backgroundColor = '#0075dd';
        chorusButton.style.color = 'white';
    }
    else if (chorusEnable === true) {
        chorusEnable = false;
        document.getElementById("chorus-btn").innerHTML = "Enable"
        chorusButton.style.backgroundColor = 'transparent';
        chorusButton.style.color = 'black';
    }
});

tremoloButton.addEventListener("click", function() {
    if (tremoloEnable === false) {
        tremoloEnable = true;
        document.getElementById("tremolo-btn").innerHTML = "Disable"
        tremoloButton.style.backgroundColor = '#0075dd';
        tremoloButton.style.color = 'white';
    }
    else if (tremoloEnable === true) {
        tremoloEnable = false;
        document.getElementById("tremolo-btn").innerHTML = "Enable"
        tremoloButton.style.backgroundColor = 'transparent';
        tremoloButton.style.color = 'black';
    }
});

// Get tremolo values
const tremoloFrequencyRange = document.querySelector("#tremolo-frequency");
tremoloFrequencyRange.addEventListener("input", function() {
    let tremoloFrequency = tremoloFrequencyRange.value;
    console.log(tremoloFrequency);
});
const tremoloDepthRange = document.querySelector("#tremolo-depth");
tremoloDepthRange.addEventListener("input", function() {
    let tremoloDepth = tremoloDepthRange.value;
    console.log(tremoloDepth);
});

// Loop through each guitar buttons
guitarNotes.forEach((noteButton) => {
 noteButton.addEventListener('click', function() {
  const note = noteButton.getAttribute('data-note'); // Get notes from data-note
  console.log(note);
  playGuitarSound(note);
  });
});


function acoustic() {
 soundType = "acoustic"
 guitarDropdown.innerHTML = "Acoustic";
};

function electric() {
 soundType = "electric"
 guitarDropdown.innerHTML = "Electric";
};

// Plays the note
function playGuitarSound(note) {
const sampler = new Tone.Sampler({
    urls: {
        E1: lowE,
        A1: A,
        D2: D,
        G2: G,
        B2: B,
        E3: highE,
    },
    release: 1,
    onload: () => {
        if (chorusEnable === true) {
            sampler.connect(chorus);
        }
        if (tremoloEnable === true) {
            sampler.connect(tremolo);
        }
        /*
        sampler.connect(comp);
        sampler.connect(reverb);
        sampler.connect(delay);
        */
        sampler.triggerAttackRelease(note, '4n');
    }
}).toDestination()
};
