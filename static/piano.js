const volume = -7;

// Create a basic Tone.js synthesizer
const poly = new Tone.PolySynth().toDestination();
const fm = new Tone.FMSynth().toDestination();
const mono = new Tone.MonoSynth({
    oscillator: {
        type: "square"
    },
    envelope: {
        attack: 0.1
    }
}).toDestination();

const synth = new Tone.Synth({
    oscillator: {
        type: "amtriangle",
        harmonicity: 0.5,
        modulationType: "sine"
    },
    envelope: {
        attackCurve: "exponential",
        attack: 0.05,
        decay: 0.2,
        sustain: 0.2,
        release: 1.5,
    },
    portamento: 0.05
}).toDestination();

const now = Tone.now();
Tone.Master.volume.value = volume;
Tone.context.lookAhead = 0;

let isMouseDown = false;
let isDragging = false;

var soundType = "classic";

const pianoDropdown = document.getElementById('pianoDropdown')

const pianoKeys = document.querySelectorAll('.piano-key'); // Selects classes with piano-key
// console.log(pianoKeys);

// Calls a function for each of the elements in pianoKeys
pianoKeys.forEach((key) => {
    let mouseDown = false;
    let mouseOver = false;

    key.addEventListener('mousedown', function() {
        mouseDown = true;
        playSoundIfMouseOver(key);
    });

    key.addEventListener('mouseup', function() {
        mouseDown = false;
        stopPlayingSound();
    });

    key.addEventListener('mouseover', function() {
        mouseOver = true;
        playSoundIfMouseOver(key);
    });

    key.addEventListener('mouseleave', function() {
        mouseOver = false;
        stopPlayingSound();
    });

    function playSoundIfMouseOver(key) {
        if (mouseOver && mouseDown) {
            const note = key.getAttribute('data-note'); // Get notes from data-note
            console.log('Playing note:', note);
            playPianoSound(note);
            };
    };

    function stopPlayingSound() {
    }
});

window.onkeydown = function(event) {
      switch (event.key) {
        case 'a':
           playPianoSound('E4');
           const buttonE4 = document.querySelector('date-note="E4"');
           if (buttonE4) {
            buttonE4.style.backgroundColor = 'blue';
           }
           break;
        case 's':
           playPianoSound('F4');
           break;
        case 'e':
           playPianoSound('F#4');
           break;
        case 'd':
           playPianoSound('G4');
           break;
        case 'r':
           playPianoSound('G#4');
           break;
        case 'f':
           playPianoSound('A4');
           break;
        case 't':
           playPianoSound('A#4');
           break;
        case 'g':
           playPianoSound('B4');
           break;
        case 'h':
           playPianoSound('C5');
           break;
        case 'u':
           playPianoSound('C#5');
           break;
        case 'j':
           playPianoSound('D5');
           break;
        case 'i':
           playPianoSound('D#5');
           break;
        case 'k':
           playPianoSound('E5');
           break;
        case 'l':
           playPianoSound('F5');
           break;
      };
};

function classic() {
 soundType = "classic"
 pianoDropdown.innerHTML = "Classic";
};

function polys() {
 soundType = "poly"
 pianoDropdown.innerHTML = "Poly Synth";
};

function monos() {
 soundType = "mono"
 pianoDropdown.innerHTML = "Mono Synth";
};

function fms() {
 soundType = "fm"
 pianoDropdown.innerHTML = "FM Synth";
};

function synths() {
 soundType = "synths"
 pianoDropdown.innerHTML = "Synth";
};

function playPianoSound(note) {
const sampler = new Tone.Sampler({
    urls: {
    'C4': 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    'A4': 'A4.mp3',
  },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
    if (soundType === "classic") {
        sampler.triggerAttackRelease(note, '4n');
    }
    else if (soundType === "poly") {
        poly.triggerAttackRelease(note, '4n');
    }
    else if (soundType === "mono") {
        mono.triggerAttackRelease(note, '4n')
    }
    else if (soundType === "fm") {
        fm.triggerAttackRelease(note, '4n')
    }
    else if (soundType === "synths") {
        synth.triggerAttackRelease(note, '4n')
    }}
    }).toDestination();
};
