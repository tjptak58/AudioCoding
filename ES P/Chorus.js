/*
DelayOp

Delays
* input->hpf->feedbackDelay->drive->waveShaper->lpf->panner->output
* 
* 

methods:


properties:

- 
*/

export class Chorus{
    constructor(){
    //signal
    this.output = Tone.Multiply(1);
    }
    connect(destination) {
        if (destination.input) {
            this.output.connect(destination.input);
        } else {
            this.output.connect(destination);
        }   
    }
}