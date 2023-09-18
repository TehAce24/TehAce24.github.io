const volume = -7;
var soundType = "classic";
let keyPressed = [];

// Create Tone.js synthesizers
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


const pianoDropdown = document.getElementById('pianoDropdown')
const pianoKeys = document.querySelectorAll('.piano-key'); // Selects elements with piano-key
// console.log(pianoKeys);

// Calls a function for each of the elements in pianoKeys
pianoKeys.forEach((key) => {
    let mouseDown = false;
    let mouseOver = false;

    key.addEventListener('mousedown', function() {
        mouseDown = true;
    });

    key.addEventListener('mouseup', function() {
        mouseDown = false;
    });

    key.addEventListener('mouseover', function() {
        mouseOver = true;
    });

    key.addEventListener('mouseleave', function() {
        mouseOver = false;
    });

    if (mouseOver && mouseDown) {
            const note = key.getAttribute('data-note'); // Get notes from data-note
            console.log('Playing note:', note);
            playPianoSound(note);
    };

    function playSoundIfMouseOver(key) {
    };
});

window.onkeydown = function(event) {
    switch (event.key) {
        case 'a':
            playPianoSound('E4');
            const buttonE4 = document.querySelector('[data-note="E4"]');
            if (buttonE4) {
                buttonE4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonE4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 's':
            playPianoSound('F4');
            const buttonF4 = document.querySelector('[data-note="F4"]');
            if (buttonF4) {
                buttonF4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonF4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'e':
            playPianoSound('F#4');
            const buttonFs4 = document.querySelector('[data-note="F#4"]');
            if (buttonFs4) {
                buttonFs4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonFs4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'd':
            playPianoSound('G4');
            const buttonG4 = document.querySelector('[data-note="G4"]');
            if (buttonG4) {
                buttonG4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonG4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'r':
            playPianoSound('G#4');
            const buttonGs4 = document.querySelector('[data-note="G#4"]');
            if (buttonGs4) {
                buttonGs4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonGs4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'f':
            playPianoSound('A4');
            const buttonA4 = document.querySelector('[data-note="A4"]');
            if (buttonA4) {
                buttonA4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonA4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 't':
            playPianoSound('A#4');
            const buttonAs4 = document.querySelector('[data-note="A#4"]');
            if (buttonAs4) {
                buttonAs4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonAs4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'g':
            playPianoSound('B4');
            const buttonB4 = document.querySelector('[data-note="B4"]');
            if (buttonB4) {
                buttonB4.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonB4.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'h':
            playPianoSound('C5');
            const buttonC5 = document.querySelector('[data-note="C5"]');
            if (buttonC5) {
                buttonC5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonC5.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'u':
            playPianoSound('C#5');
            const buttonCs5 = document.querySelector('[data-note="C#5"]');
            if (buttonCs5) {
                buttonCs5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonCs5.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'j':
            playPianoSound('D5');
            const buttonD5 = document.querySelector('[data-note="D5"]');
            if (buttonD5) {
                buttonD5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonD5.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'i':
            playPianoSound('D#5');
            const buttonDs5 = document.querySelector('[data-note="D#5"]');
            if (buttonDs5) {
                buttonDs5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonDs5.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'k':
            playPianoSound('E5');
            const buttonE5 = document.querySelector('[data-note="E5"]');
            if (buttonE5) {
                buttonE5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonE5.style.backgroundColor = '';
                }, 200);
            }
            break;
        case 'l':
            playPianoSound('F5');
            const buttonF5 = document.querySelector('[data-note="F5"]');
            if (buttonF5) {
                buttonF5.style.backgroundColor = '#0d6efd';
                setTimeout(function() {
                    buttonF5.style.backgroundColor = '';
                }, 200);
            }
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
