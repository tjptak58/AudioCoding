//all of your synth and gui code can go here
window.gui = new p5(sketch, 'p5-container');

let output = new Tone.Multiply(0.1).toDestination()

const vco = new Tone.Oscillator(400).start()
const env = new Tone.Envelope()
const vca = new Tone.Multiply()
vco.connect( vca ), vca.connect( output )
env.connect( vca.factor )

let trigNote = function(){
  env.triggerAttackRelease(0.1)
}

console.log("sketch")

// //const gui = new p5(gui_sketch)
let freq_knob = gui.Knob({
  label: 'freq', 
  mapto: vco.frequency,
  //callback: function(x){vco.frequency.rampTo(x,10)},
  min:100, max: 1000, curve:2,
  x:20,y:20
})
let decay_knob = gui.Knob({
  label: 'decay', 
  //mapto: vco.frequency,
  callback: function(x){env.decay = x, env.sustain = x},
  min:.01, max: 1, curve:2,
  x:40,y:20
})


let startEnable = 0
let seq

//this start button exists just to enable audio
//there are probably other ways to call Tone.start(). . . .
startButton.addEventListener('click', () => {
  if (startEnable == 0) {
    // Start the hihat if it's not already playing
    Tone.start()
    seq = setInterval( trigNote, 1000)
    console.log('start');
    startEnable = 1
  } else {
    clearInterval( seq )
    console.log('stop');
    startEnable = 0
  }
});

