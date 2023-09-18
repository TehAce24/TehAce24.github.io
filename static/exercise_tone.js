const volume = -5;
var timer = 5;
const maxNotes = 2;
const now = Tone.now()
Tone.start()
const poly = new Tone.PolySynth().toDestination();
const synth = new Tone.Synth().toDestination();
const mono = new Tone.MonoSynth({
    envelope: {
        attack: 0.1
    }
}).toDestination();
Tone.Master.volume.value = volume;

window.setTimeout(function() {
    $(".alert").fadeTo(500, 0)
}, 2000);

var countDownTimer = setInterval(function() {
    if (timer <= 0) {
        clearInterval(countDownTimer);
    } else {
        document.getElementById('progressBar').value = 6 - timer;
        document.getElementById('countdown').innerHTML = timer - 1;
        timer--;
        if (timer === 0) {
            getNotes();
        }
    }
}, 1000);

function getNotes() {
    for (let i = 0; i < maxNotes; i++) {
        setTimeout(function() {
            let note = notes[i];
            playNotes(note);
        }, i * timeInterval);
    };
};

function playNotes(note) {
    synth.triggerAttackRelease(note, "2n")
};
