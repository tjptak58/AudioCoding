// This file loads the JSON data and defines p5 functions
(function(global) {

    let activeTheme = p5Themes.themes['default']; // Default theme preset


    p5.prototype.debug = function () {
        console.log('Debugging active theme:');
        console.log(activeTheme);
    };

    p5.prototype.elements = {};

    function initialize(p, div) {
        p.div = div;
        p.createCanvas(div.offsetWidth, div.offsetHeight);
        p.width = div.offsetWidth;
        p.height = div.offsetHeight;
        
        console.log("init", div.offsetWidth, div.offsetHeight)
    }

    p5.prototype.initialize = function(div) {
        initialize(this, div);
    };


    //************** THEME DEFINITIONS *************/
// Function to list available themes
p5.prototype.listThemes = function() {
  console.log( Object.keys(themes.themes) ) 
}

p5.prototype.setTheme = function(themeName) {
    if (!themes.themes[themeName]) {
        console.error(`Theme '${themeName}' not found.`);
        return;
  } 
    activeTheme = themes.themes[themeName]; // Default theme preset
}

// Function to update theme parameters
p5.prototype.setThemeParameters = function(parameters) {
  if (activeTheme) {
    // Merge the provided parameters with the active theme
    activeTheme = { ...activeTheme, ...parameters };
  } else {
    console.error(`Active theme '${activeTheme}' not found.`);
  }
}

// Function to get the current theme values in JSON format
p5.prototype.exportTheme = function() {
    console.log(`exporting ` + activeTheme);
    console.log( JSON.stringify(activeTheme, null, 2))
    return JSON.stringify(activeTheme, null, 2);
}


    // Expose the functions globally
    global.p5Elements = {

    };

let updateCanvas = 1;

//************** DRAW ELEMENTS //**************

function drawElements(p) {
    if( updateCanvas > 0 ){
        updateCanvas = 1
        p.background(activeTheme.backgroundColor);
        //drawGrid(p);
        for (let element of Object.values(p.elements)) {
            if (typeof (element) === "string") {
                //when would this be called?
                eval(element);
            }
            else {
                //draw gui elements
                element.draw();
            }
        }
    }
}

p5.prototype.drawElements = function () {
    drawElements(this);
};

const scaleOutput = function (input, inLow, inHigh, outLow, outHigh, curve) {
    if (curve === undefined) curve = 1;
    let val = (input - inLow) * (1 / (inHigh - inLow));
    val = Math.pow(val, curve);
    return val * (outHigh - outLow) + outLow;
  }

const unScaleOutput = function (input, outLow, outHigh, inLow, inHigh, curve) {
    if (curve === undefined) curve = 1;
    else curve = 1/curve;
    let val = (input - inLow) * (1 / (inHigh - inLow));
    val = Math.pow(val, curve);
    return val * (outHigh - outLow) + outLow;
  }


/********************** COLORS & FONTS ***********************/
const setColor = function(name, value) {
    if( name === 'border' ) activeTheme.borderColor = value
    else if( name === 'accent' )  activeTheme.accentColor = value
    else if( name === 'background' )  activeTheme.backgroundColor = value
    else if( name === 'text' )  activeTheme.textColor = value

    else if( typeof( name ) == 'string' && Array.isArray(value)){
        if(value.length = 3){
            activeTheme[name] = value;
            console.error(`new Color added: ${name}`);
        } else console.error('second argument must be an array of three values in RGB format')
    }
    else console.error(`incorrect color values: ${name}, ${value} `)
}

const getColor = function(name) {
    if( name === 'border' ) return activeTheme.borderColor
    if( name === 'accent' ) return activeTheme.accentColor
    if( name === 'background' ) return activeTheme.backgroundColor
    if( name === 'text' ) return activeTheme.textColor

    if (Array.isArray(name)){
        return name
    } else {
        console.error(`Invalid color property: ${name}`);
        return [0,0,0]
    }
}

const GuiFonts = {
    label: 'Helvetica',
    value: 'Courier',
    text: 'Times New Roman',
    title: 'Verdana',
};

const setFont = function(name, value) {
    if( name === 'label' ) activeTheme.labelFont = value
    else if( name === 'value' )  activeTheme.valueFont = value
    else if( name === 'text' )  activeTheme.textFont = value
    else if( name === 'title' )  activeTheme.titleFont = value

    else if( typeof( name ) === 'string' && typeof(value) === 'string'){
        activeTheme[name] = value;
            console.error(`new Font added: ${name}`);
    }
    else console.error(`incorrect font values: ${name}, ${value} `)
}

const getFont = function(name) {
    if( name === 'label' ) return activeTheme.labelFont 
    if( name === 'value' )  return activeTheme.valueFont 
    if( name === 'text' )  return activeTheme.textFont 
    if( name === 'title' )  return activeTheme.titleFont 

    if (typeof(name) === 'string'){
        return name
    } else {
        console.error(`Invalid font property: ${name}`);
        return 'Geneva'
    }
}

/**************************************** ELEMENT ******************************************/
let elementXPosition = 0;
let elementYPosition = 25;
let prevElementSize = 0;
let prevYElementSize = 0;
class Element {
    constructor(p, options) {
        this.p = p;
        this.theme = activeTheme;
        this.label = options.label || "myElement";
        this.id = this.label;
        let i = 1;
        while (this.id in p.elements) {
            this.id += i;
            i++;
        }
        //appearance
        this.style = options.style || 1;
        this.size = options.size || 1;
        this.textSize = options.textSize || 1;
        this.border = options.border || 'theme' || 6;
        this.borderColor = options.borderColor || 'border';
        this.accentColor = options.accentColor || 'accent';
        this.borderRadius = options.borderRadius || activeTheme.borderRadius || 0;
        
        //text
        this.textColor = options.textColor || 'text';
        this.showLabel = typeof(options.showLabel) === 'undefined' ? true : options.showLabel; //|| activeTheme.showLabel
        this.showValue = typeof(options.showValue) === 'undefined' ? true : options.showValue; //|| activeTheme.showValue
        this.labelFont = options.labelFont || 'label'
        this.valueFont = options.valueFont || 'value'
        this.textFont = options.textFont || 'text'
        this.labelX = options.labelX || 0
        this.labelY = options.labelY || 0
        this.valueX = options.valueX || 0
        this.valueY = options.valueY || 0
        this.textX = options.textX || 0
        this.textY = options.textY || 0

        //position
        let currentGap = (prevElementSize+this.size) / 2
        elementXPosition+=(8*currentGap+5);
        if(elementXPosition>(100-this.size*8)){
            elementXPosition = this.size/2*8+5
            elementYPosition += (20*prevYElementSize+10)
            prevYElementSize=this.size
        }
        this.x = options.x || elementXPosition;
        this.y = options.y || elementYPosition;
        prevElementSize = this.size
        prevYElementSize = this.size>prevYElementSize ? this.size : prevYElementSize;
        this.cur_x = (this.x/100)*this.p.width
        this.cur_y = (this.y/100)*this.p.height
        this.cur_size = (this.size/6)*this.p.width
        this.x_box = this.cur_size;
        this.y_box = this.cur_size;

        //parameter values
        this.active = 0;
        this.min = options.min || 0;
        this.max = options.max || 1;
        this.curve = options.curve || 1;
        if(typeof(options.mapto)=='string') this.mapto = eval(options.mapto)
        else this.mapto = options.mapto || null;
        this.callback = options.callback || null;
        if( this.mapto || this.callback) this.maptoDefined = 'true'
        else this.maptoDefined = 'false'
        this.rawValue = unScaleOutput(options.value,0,1,this.min,this.max,this.curve) || 0.5;
        this.value = options.value || scaleOutput(0.5,0,1,this.min,this.max,this.curve);
        p.elements[this.id] = this;

        this.mapValue(this.value, this.mapto);
        this.runCallBack()
    }

    getParam(param,val){ return val == 'theme' ? activeTheme[param] : val}

    isPressed(){
        if( this.p.mouseX < (this.cur_x + this.x_box/2) &&
            this.p.mouseX > (this.cur_x - this.x_box/2) &&
            this.p.mouseY > (this.cur_y - this.y_box/2) &&
            this.p.mouseY < (this.cur_y + this.y_box/2) )
        {
            this.active = 1
            //console.log('pressedas', this.label, this.p.mouseX.toFixed(1), this.p.mouseY.toFixed(1), this.cur_x.toFixed(1), this.cur_y.toFixed(1), this.x_box, this.y_box)
        }
    }

    isReleased(){
        if( this.active == 1 )  this.active = 0
    }

    resize(scaleWidth, scaleHeight) {
        this.x *= scaleWidth;
        this.y *= scaleHeight;
    }

    drawLabel(x,y){
        this.p.textSize(this.textSize*10);
        this.p.stroke(this.setColor(this.textColor))
        this.p.strokeWeight(0.00001 * this.textSize*20);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.fill(this.setColor(this.textColor));
        this.p.textFont(getFont(this.labelFont))
        this.p.text(this.label, x + (this.labelX/100)*this.p.width, y + (this.labelY/100)*this.p.height);
    }

    drawValue(x,y){
        let output = this.value
        this.p.stroke(this.setColor(this.textColor))
        this.p.textSize(this.textSize*10);
        this.p.strokeWeight(0.00001 * this.textSize*20);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.fill(this.setColor(this.textColor));
        this.p.textFont(getFont(this.valueFont))
        if(Math.abs(output) < 1) output = output.toFixed(4)
        else if(Math.abs(output) < 5) output = output.toFixed(3) 
        else if(Math.abs(output) < 100) output = output.toFixed(2) 
        else  output = output.toFixed(1)   
        this.p.text(output, x + (this.valueX/100)*this.p.width, y + (this.valueY/100)*this.p.height);
    }

    drawText(text,x,y){
        this.p.textSize(this.textSize*10);
        this.p.stroke(this.setColor(this.textColor))
        this.p.strokeWeight(0.00001 * this.textSize*20);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.fill(getColor(this.textColor));
        this.p.textFont(getFont(this.textFont))
        this.p.text(text, x + (this.textX/100)*this.p.width, y + (this.textY/100)*this.p.height);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setColor( arg ){
        if( typeof(arg) == 'string'){
            return getColor( arg )
        }
        else if( Array.isArray(arg) ){
            if( arg.length == 3) return arg
        } 
        console.log(this.label, typeof(arg), 'invalid color')
        return [0,0,0]
    }

    mapValue(output, destination) {
        if (destination) {
            try {
                destination.value.rampto(output, .1);
            } catch {
                try {
                    destination.value = output;
                } catch {
                    try {
                        //console.log(destination, output)
                        destination = output;
                    } catch (error) {
                        console.log('Error setting Mapto to value: ', error);
                    }
                }
            }
        } else if( this.maptoDefined == 'false'){ console.log(this.label, 'no destination defined')}
    }

    runCallBack() {
        if (this.callback) {
            let output = this.value
            try {
                this.callback(output);
            } catch {
                try {
                    this.callback();
                } catch (error) {
                    console.log('Error with Callback Function: ', error);
                }
            }
        } else if( this.maptoDefined == 'false'){ console.log(this.label, 'no destination defined')}
    }

    set(value){
        if(typeof(value) === 'string') this.value = value;
        else{
            this.value = value
            this.rawValue = unScaleOutput(value,0,1,this.min,this.max,this.curve) || 0.5;
            this.mapValue(this.value, this.mapto);
        }
        this.runCallBack()
    }
}

/**************************************** KNOB ******************************************/
class Knob extends Element {
    constructor(p, options) {
        super(p, options);
        this.incr = options.incr || 0.01;
        this.degrees = options.degrees || 320;
        this.startAngle = this.p.PI * (4/8 + (360 - this.degrees)/360);
        this.endAngle = this.p.PI * (4/8 - (360 - this.degrees)/360 ) + 2 * this.p.PI;
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight);
        if (Math.max(Math.abs(1 - scaleWidth)) > Math.max(Math.abs(1 - scaleHeight))) this.size *= scaleWidth;
        else this.size *= scaleHeight;
    }

    draw() {
        // Calculate the angle based on the knob's value
        this.startAngle = this.p.PI * (4/8 + (360 - this.degrees)/360);
        this.endAngle = this.p.PI * (4/8 - (360 - this.degrees)/360 ) + 2 * this.p.PI;
        let angle = this.p.map(this.rawValue, 0,1, 0, this.endAngle-this.startAngle);

        this.cur_x = (this.x/100)*this.p.width
        this.cur_y = (this.y/100)*this.p.height
        this.cur_size = (this.size/6)*this.p.width/2
        this.x_box = this.cur_size
        this.y_box = this.cur_size

        let border = this.getParam('border',this.border)

        // clear the previously drawn knob
        // this.p.fill(getColor('background'));
        // let  strokeWeight = this.border;
        // this.p.strokeWeight(strokeWeight);
        // this.p.stroke(getColor('background'));
        // this.p.arc(cur_x, cur_y, cur_size*1.2, cur_size*1.2,0,2*this.p.PI);

        // Display the label string beneath the knob
        this.p.textSize(this.textSize*10);
        let textWidthValue = this.p.textWidth(this.label);
        let textHeightValue = this.p.textAscent() + this.p.textDescent();
        if(this.showLabel) this.drawLabel(this.cur_x, this.cur_y + this.cur_size/2 + textHeightValue * .5 )
        if(this.showValue) this.drawValue(this.cur_x, this.cur_y + this.cur_size/2 + textHeightValue * (this.showLabel ? 1.5 : .5))

        // Draw the inactive knob background
        this.p.noFill();
        this.p.strokeWeight(border);
        this.p.stroke(this.setColor(this.borderColor))
        this.p.arc(this.cur_x, this.cur_y, this.cur_size, this.cur_size, this.p.constrain(this.startAngle + angle + (border/30/this.size/2),this.startAngle,this.endAngle), this.endAngle);

        // Draw the active knob background
        this.p.stroke(this.setColor(this.accentColor));
        this.p.arc(this.cur_x, this.cur_y, this.cur_size, this.cur_size, this.startAngle, this.p.constrain(this.startAngle + angle - (border/30/this.size/2),this.startAngle,this.endAngle));

        // Draw the knob value indicator as a line
        let indicatorLength = this.cur_size / 2 // Length of the indicator line
        let indicatorX = this.cur_x + this.p.cos(this.startAngle+angle) * indicatorLength;
        let indicatorY = this.cur_y + this.p.sin(this.startAngle+angle) * indicatorLength;
        this.p.stroke(this.setColor(this.accentColor));
        this.p.line(this.cur_x, this.cur_y, indicatorX, indicatorY);
    }

    isDragged() {
        if(this.active){
        
            if(this.p.movedY != 0 ){ 
                if( this.p.keyIsDown(this.p.ALT)) this.rawValue -= this.p.movedY * this.incr/10;
                else this.rawValue -= this.p.movedY * this.incr;
            }
            
            if( this.rawValue > 1 ) this.rawValue = 1
            if( this.rawValue < 0 ) this.rawValue = 0
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
            this.mapValue(this.value, this.mapto);
            this.runCallBack()
        }
    }
}

p5.prototype.Knob = function (options = {}) {
    return new Knob(this, options);
};

p5.prototype.Dial = function (options = {}) {
    return new Knob(this, options);
};

/**************************************** FADER ******************************************/
class Fader extends Element {
    constructor(p, options) {
        super(p, options);
        this.incr = options.incr || 0.01;
        this.orientation = options.orientation === 'horizontal'? 'horizontal' : 'vertical';
        this.isHorizontal = this.orientation==='horizontal'
        this.value = this.value || 0.5
        this.dragging = false;
        this.size = options.size || 1
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight);
        this.size *= this.isHorizontal ? scaleWidth : scaleHeight;
    }

    draw() {
        this.isHorizontal = this.orientation==='horizontal'
        this.cur_size = (this.size/6)*this.p.width/2
        let border = this.getParam('border',this.border)
        
        let x_corner = (this.x/100)*this.p.width
        let y_corner = (this.y/100)*this.p.height
        if( this.isHorizontal ) {
            this.x_box = this.cur_size
            this.y_box = border * 3 * this.size
            this.cur_x = (this.x/100)*this.p.width + this.cur_size/2
            this.cur_y = (this.y/100)*this.p.height + border
        }
        else  {
            this.y_box = this.cur_size
            this.x_box = border * 3 * this.size
            this.cur_x = (this.x/100)*this.p.width + border
            this.cur_y = (this.y/100)*this.p.height + this.cur_size/2
        }
        let strokeWeight = border*this.size;
        this.thickness = border // cur_size * .1; //Indicator thickness
        let rectThickness = this.thickness * .95;

        // Display the label and value strings
        this.p.textSize(this.textSize*10);
        let textWidthValue = this.p.textWidth(this.label);
        let textHeightValue = this.p.textAscent() + this.p.textDescent();
        let curTextY = this.isHorizontal ? this.cur_y+border*2 + textHeightValue* .5 : this.cur_y+this.cur_size/2+ border + textHeightValue * .5
        if(this.showLabel) this.drawLabel(this.cur_x, curTextY)
        if(this.showValue) this.drawValue(this.cur_x, curTextY + (this.showLabel ? 1: 0 ) * textHeightValue)

        //Display Actual Fader
        this.p.noFill();
        this.p.stroke(this.setColor(this.borderColor))
        this.p.strokeWeight(border*1.5);
        if (this.isHorizontal) this.p.rect(x_corner, y_corner, this.cur_size, border*2);
        else this.p.rect(x_corner, y_corner, border*2, this.cur_size);
        // this.p.stroke(getColor(this.accentColor))
        // if (this.isHorizontal) this.p.rect(this.cur_x, this.cur_y, this.cur_size, border);
        // else this.p.rect(this.cur_x, this.cur_y, rectThickness, this.cur_size);

        //Clear beneath Display Indicator
        this.p.fill(getColor('background') )
        this.p.stroke(this.setColor('background') )
        this.pos = this.p.map(this.rawValue, 0,1, this.isHorizontal ? x_corner : y_corner + this.cur_size - this.thickness, this.isHorizontal ? x_corner + this.cur_size - this.thickness : y_corner);
        let clearSize = border*.25
        if (this.isHorizontal) this.p.rect(this.pos-clearSize, y_corner, this.thickness+clearSize*2, this.thickness*2);
        else this.p.rect(x_corner, this.pos-clearSize, this.thickness*2, this.thickness+clearSize*2);
        //Display indicator
        this.p.fill(this.setColor(this.accentColor));
        this.p.stroke(this.setColor(this.accentColor))
        this.pos = this.p.map(this.rawValue, 0,1, this.isHorizontal ? x_corner : y_corner + this.cur_size - this.thickness, this.isHorizontal ? x_corner + this.cur_size - this.thickness : y_corner);
        if (this.isHorizontal) this.p.rect(this.pos, y_corner, this.thickness, this.thickness*2);
        else this.p.rect(x_corner, this.pos, this.thickness*2, this.thickness);
    }

    isDragged() {
        if( this.active ){
            if (this.isHorizontal){
                if(this.p.movedX !== 0 ){ 
                    if( this.p.keyIsDown(this.p.ALT)) this.rawValue += this.p.movedX * this.incr/10;
                    else this.rawValue += this.p.movedX * this.incr / this.size;
                }
            }
            else {
                if(this.p.movedY !== 0 ){ 
                    if( this.p.keyIsDown(this.p.ALT)) this.rawValue -= this.p.movedY * this.incr/10;
                    else this.rawValue -= this.p.movedY * this.incr / this.size;
                }
            }
            if( this.rawValue > 1 ) this.rawValue = 1
            if( this.rawValue < 0 ) this.rawValue = 0
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
            this.mapValue(this.value, this.mapto);
            
            this.runCallBack()
        }
    }
}

p5.prototype.Fader = function (options = {}) {
    return new Fader(this, options);
};

p5.prototype.Slider = function (options = {}) {
    return new Fader(this, options);
};

/**************************************** PAD ******************************************/
class Pad extends Element {
    constructor(p, options) {
        super(p, options);
        this.incr = options.incr || 0.01;
        this.valueX = this.valueX || 0.5
        this.valueY = this.valueY || 0.5
        this.rawValueX = this.valueX
        this.rawValueY = this.valueY
        this.dragging = false;
        this.sizeX = options.sizeX || options.size || 5
        this.sizeY = options.sizeY || options.size || 5
        if(typeof(options.maptoX)=='string') this.maptoX = eval(options.maptoX)
        else this.maptoX = options.maptoX || null;
        if(typeof(options.maptoY)=='string') this.maptoY = eval(options.maptoY)
        else this.maptoY = options.maptoY || null;
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight);
        //this.size *= this.isHorizontal ? scaleWidth : scaleHeight;
    }

    draw() {
        this.cur_size = (this.size/6)*this.p.width/2
        this.cur_sizeX = (this.sizeX/6)*this.p.width/2
        this.cur_sizeY = (this.sizeY/6)*this.p.width/2
        let border = this.getParam('border',this.border)
        
        let x_corner = (this.x/100)*this.p.width-this.cur_sizeX/2
        let y_corner = (this.y/100)*this.p.height-this.cur_sizeY/2

        this.x_box = this.cur_sizeX*2
        this.y_box = this.cur_sizeY*2
        this.cur_x = (this.x/100)*this.p.width //+ this.cur_sizeX/2
        this.cur_y = (this.y/100)*this.p.height //+ this.cur_sizeY/2

        //console.log(this.cur_x, this.cur_y, this.x_box,this.y_box)
      
        let strokeWeight = border
        this.thickness = border // cur_size * .1; //Indicator thickness
        let rectThickness = this.thickness * .95;

        //Display Actual Fader
        this.p.fill(this.setColor(this.borderColor));
        this.p.stroke(this.setColor(this.borderColor))
        this.p.strokeWeight(border*1.5);
        this.p.rect(x_corner, y_corner, this.cur_sizeX, this.cur_sizeY);
        
        //Display indicator
        this.p.fill(this.setColor(this.accentColor));
        this.p.stroke(this.setColor(this.accentColor))
        let indicatorX = x_corner + this.rawValueX *  (this.cur_sizeX - 0*border)
        let indicatorY = y_corner + this.rawValueY * ( this.cur_sizeY - 0*border)
        //this.pos = this.p.map(this.value, 0,1,  x_corner  + this.cur_size - this.thickness, this.isHorizontal ? x_corner + this.cur_size - this.thickness : y_corner);
        this.p.circle(indicatorX, indicatorY, (this.cur_sizeX+this.cur_sizeY)/30)    
   
        // Display the label and values
        let textHeightValue = this.p.textAscent() + this.p.textDescent();
        if(this.showLabel) this.drawLabel(this.cur_x,  this.cur_y - this.cur_sizeY/2 - textHeightValue)

             // Display the label and value strings
        // this.p.textSize(this.textSize*10);
        // let textWidthValue = this.p.textWidth(this.label);
        // let textHeightValue = this.p.textAscent() + this.p.textDescent();
        // let curTextY = this.isHorizontal ? this.cur_y+border*2 + textHeightValue* .5 : this.cur_y+this.cur_size/2+ border + textHeightValue * .5
        // if(this.showLabel) this.drawLabel(this.cur_x, curTextY)
        // if(this.showValue) this.drawValue(this.cur_x, curTextY + textHeightValue)

    }

    isDragged() {
        if( this.active ){
            if(this.p.movedX !== 0 ){ 
                if( this.p.keyIsDown(this.p.ALT)) this.rawValueX += this.p.movedX * this.incr/10;
                else this.rawValueX += this.p.movedX * this.incr / this.sizeX;
            }

            if(this.p.movedY !== 0 ){ 
                if( this.p.keyIsDown(this.p.ALT)) this.rawValueY += this.p.movedY * this.incr/10;
                else this.rawValueY += this.p.movedY * this.incr / this.sizeY;
            }

            if( this.rawValueX > 1 ) this.rawValueX = 1
            if( this.rawValueX < 0 ) this.rawValueX = 0
            this.valueX = scaleOutput(this.rawValueX,0,1,this.min,this.max,this.curve)
            this.mapValue(this.valueX,this.maptoX);

            if( this.rawValueY > 1 ) this.rawValueY = 1
            if( this.rawValueY < 0 ) this.rawValueY = 0
            this.valueY = scaleOutput(this.rawValueY,0,1,this.min,this.max,this.curve)
            this.mapValue(this.valueY,this.maptoY);
            this.runCallBack()
        }
    }
}

p5.prototype.Pad = function (options = {}) {
    return new Pad(this, options);
};

p5.prototype.JoyStick = function (options = {}) {
    return new Pad(this, options);
};

/**************************************** BUTTON ******************************************/
class Button extends Element {
    constructor(p, options) {
        super(p, options);
        this.value = options.value || 0
        this.rawValue = this.value
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight)
        this.size *= this.horizontal !== false ? scaleWidth : scaleHeight;
    }

    draw() {
        this.cur_x = (this.x/100)*this.p.width
        this.cur_y = (this.y/100)*this.p.height
        this.cur_size = (this.size/6)*this.p.width/2
        this.x_box = this.cur_size
        this.y_box = this.cur_size
        let border = this.getParam('border',this.border)

        if( this.rawValue ){            
            this.p.noFill()
            this.p.stroke(this.setColor(this.accentColor));
            this.p.strokeWeight(border);
            this.p.ellipse(this.cur_x, this.cur_y, this.cur_size, this.cur_size);
        }
        else{
            this.p.noFill()
            this.p.stroke(this.setColor(this.borderColor));
            this.p.strokeWeight(border/2);
            this.p.ellipse(this.cur_x, this.cur_y, this.cur_size, this.cur_size);
        }

        // Display the label string inside the button
        if(this.showLabel) this.drawLabel(this.cur_x, this.cur_y)//if(this.showValue) this.drawValue(this.cur_x, this.cur_y+6*(2+this.size*2.5) )
    }

    isPressed(){
        if( this.p.mouseX < (this.cur_x + this.x_box/2) &&
            this.p.mouseX > (this.cur_x - this.x_box/2) &&
            this.p.mouseY > (this.cur_y - this.y_box/2) &&
            this.p.mouseY < (this.cur_y + this.y_box/2) )
        {
            this.active = 1
            this.rawValue = 1
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
            this.mapValue(this.value,this.mapto);
            this.runCallBack();
            if( this.maptoDefined == 'false') postButtonError('Buttons')
        }
    }

    isReleased(){
        if( this.active == 1 )  {
            this.active = 0
            this.rawValue = 0
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
        }
    }
}

p5.prototype.Button = function (options = {}) {
    return new Button(this, options);
};

function postButtonError(name){
    if(name === 'Buttons') console.log(name + ' generally work by defining a callback function. For buttons, the value is 1 on every press.')
    if(name === 'Toggle buttons') console.log(name + ' generally work by defining a callback function. The value for toggle buttons alternates between 1 and 0.')
    if(name === 'RadioButtons') console.log(name + ' generally work by defining a callback function. The value for radio buttons is the text string of the selected button.')
    
    if(name === 'Buttons') console.log(`An example of defining a callback for a button is: 
callback: function(val){ env.triggerAttackRelease(0.1) }`)
    if(name === 'Toggle buttons') console.log(`An example of defining a callback for a toggle is: 
callback: function(val){ 
    if(val==1) vco.type = 'square'; 
    else vco.type = 'sawtooth'; 
}`)
    if(name === 'RadioButtons') console.log(`An example of defining a callback for a radio button is: 
callback: function(val){ vco.type = val }`)
}

/**************************************** MOMENTARY ******************************************/
export class Momentary extends Button {
    constructor(p, options) {
        super(p, options);
        this.value = options.value || 0
        this.rawValue = this.value
    }

    isReleased(){
        if( this.active == 1 )  {
            this.active = 0
            this.rawValue = 0
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
            this.mapValue(this.value,this.mapto);
            this.runCallBack();
        }
    }
}

p5.prototype.Momentary = function (options = {}) {
    return new Momentary(this, options);
};

/**************************************** TOGGLE ******************************************/
class Toggle extends Button {
    constructor(p, options) {
        super(p, options);
        this.state = options.state || false;
    }

    isPressed(){
        if( this.p.mouseX < (this.cur_x + this.x_box/2) &&
            this.p.mouseX > (this.cur_x - this.x_box/2) &&
            this.p.mouseY > (this.cur_y - this.y_box/2) &&
            this.p.mouseY < (this.cur_y + this.y_box/2) )
        {
            this.active = 1
            this.rawValue = this.rawValue ? 0 : 1
            this.value = scaleOutput(this.rawValue,0,1,this.min,this.max,this.curve)
            this.mapValue(this.value,this.mapto);
            this.runCallBack();
            if( this.maptoDefined == 'false') postButtonError('Toggle buttons')
        }
    }

    isReleased(){
        if( this.active == 1 )  {
            this.active = 0
        }
    }
}

p5.prototype.Toggle = function (options = {}) {
    return new Toggle(this, options);
};

/**************************************** RADIO BUTTON ******************************************/
class RadioButton extends Button {
    constructor(p, options) {
        super(p, options);
        this.radioOptions = options.radioOptions || ['on', 'off'];
        this.orientation = options.orientation || 'vertical';
        this.isHorizontal = this.orientation==='horizontal'
        this.value = options.value || this.radioOptions[0]; //default first radioOption
        this.radioHeight = this.cur_size / 2;
        this.radioWidth = this.cur_size * 2;
        this.border = options.border ||activeTheme.radioBorder || 2
    }

    draw() {
        this.radioClicked = {};

        this.isHorizontal = this.orientation==='horizontal'
        this.cur_size = (this.size/6)*this.p.width/2
        
        this.radioHeight = this.cur_size / 2;
        this.radioWidth = this.cur_size * 2;
        let border = this.getParam('border',this.border)


        //calculate widest radioOption for radioButton width
        this.p.textSize(this.textSize*10);
        let textWidth = 0 
        for (let i = 0; i < this.radioOptions.length; i++){
            let width = this.p.textWidth(this.radioOptions[i]);
            if( width > textWidth) textWidth = width
        }
        this.cur_size = textWidth
        this.radioWidth = this.cur_size * 1.5;

        if( this.isHorizontal ) {
            this.cur_x = (this.x/100)*this.p.width
            this.cur_y = (this.y/100)*this.p.height

            this.x_corner = this.cur_x - this.radioWidth * this.radioOptions.length / 2
            this.y_corner = this.cur_y - this.radioHeight/2

            this.x_box = this.radioWidth * this.radioOptions.length
            this.y_box = this.radioHeight    
        }
        else  {
            this.cur_x = (this.x/100)*this.p.width
            this.cur_y = (this.y/100)*this.p.height

            this.x_corner = this.cur_x - this.radioWidth/2
            this.y_corner = this.cur_y - this.radioHeight * this.radioOptions.length / 2 

            this.y_box = this.radioHeight * this.radioOptions.length
            this.x_box = this.radioWidth
        }
        
        if(this.showLabel) this.drawLabel(this.cur_x, 
            this.isHorizontal ? this.cur_y+this.radioHeight : this.cur_y+this.radioHeight*(this.radioOptions.length / 2 + 0.5 ) 
            )

        for (let i = 0; i < this.radioOptions.length; i++) {
            let option = this.radioOptions[i];
            let x = this.isHorizontal ? this.x_corner + i * this.radioWidth : this.x_corner;
            let y = this.isHorizontal ? this.y_corner : this.y_corner + this.radioHeight * i;

            this.p.fill(this.value == option ? this.setColor(this.accentColor) : this.setColor(this.borderColor));
            this.p.stroke(0);
            this.p.strokeWeight(border);
            this.p.rect(x, y, this.radioWidth, this.radioHeight);

            this.drawText(option,  x+this.radioWidth/2,  y + this.radioHeight/2 )
             this.radioClicked[this.radioOptions[i]] = () => {
                if (this.isHorizontal) return this.p.mouseX >= x && this.p.mouseX <= x + this.radioSize
                else return this.p.mouseY >= y && this.p.mouseY <= y + this.radioSize / 2
            };
        }
    }


    isPressed() {
        if( this.p.mouseX < (this.cur_x + this.x_box/2) &&
            this.p.mouseX > (this.cur_x - this.x_box/2) &&
            this.p.mouseY > (this.cur_y - this.y_box/2) &&
            this.p.mouseY < (this.cur_y + this.y_box/2) )
        {
            
            if( this.isHorizontal){
                let position = (this.cur_x + this.x_box/2) -  this.p.mouseX
                position = Math.floor(position / this.radioWidth)
                position = this.radioOptions.length - position - 1
                this.value = this.radioOptions[position]
            } else{
                let position = (this.cur_y + this.y_box/2) - this.p.mouseY 
                position = Math.floor(position / this.radioHeight)
                position = this.radioOptions.length - position - 1
                this.value = this.radioOptions[position]
            }
            this.active = 1

            this.runCallBack();
            this.mapValue(this.value, this.mapto);
            if( this.maptoDefined == 'false') postButtonError('RadioButtons')
        }
    }

    isReleased() {
        //so super isReleased not called
    }
}

p5.prototype.RadioButton = function (options = {}) {
    return new RadioButton(this, options);
};

p5.prototype.Radio = function (options = {}) {
    return new RadioButton(this, options);
};

/**************************************** LINES ******************************************/
class Line extends Element {
    constructor(p, x1,y1,x2,y2, options) {
        super(p, options);
        this.x1 = x1 || 0
        this.x2 = x2 || 0
        this.y1 = y1 || 0
        this.y2 = y2 || 0
        this.showLabel = options.showLabel || 'false'
        this.border = options.border || 2
        this.color = options.color ||activeTheme.lineColor || 'border'
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight)
        this.size *= this.horizontal !== false ? scaleWidth : scaleHeight;
    }

    draw() {
        let x1 = (this.x1/100)*this.p.width
        let x2 = (this.x2/100)*this.p.width
        let y1 = (this.y1/100)*this.p.height
        let y2 = (this.y2/100)*this.p.height
        let border = this.getParam('border',this.border)

        this.p.fill(this.setColor(this.color));
        this.p.stroke(this.setColor(this.color));
        this.p.strokeWeight(border*2);
        this.p.line(x1,y1,x2,y2)
    }

    isPressed() {}
    pressed() { }
    isReleased() {}
}

p5.prototype.Line = function (x1,y1,x2,y2, options = {}) {
    return new Line(this, x1,y1,x2,y2, options);
};

/**************************************** TEXT ******************************************/
class Text extends Element {
    constructor(p, options) {
        super(p, options);
        this.border = options.border || activeTheme['border'] || 0
        this.textSize = options.size || activeTheme['textSize'] || options.textSize || 1
    }

    resize(scaleWidth, scaleHeight) {
        super.resize(scaleWidth, scaleHeight)
        this.size *= this.horizontal !== false ? scaleWidth : scaleHeight;
    }

    draw() {
        this.cur_x = (this.x/100)*this.p.width
        this.cur_y = (this.y/100)*this.p.height
        this.cur_size = (this.size/6)*this.p.width/2
        let border = this.getParam('border',this.border)
        let borderRadius = this.getParam('borderRadius',this.borderRadius)

        this.drawText(this.label,this.cur_x, this.cur_y)
        
        if(border > 0 ){
            let textWidthValue = this.p.textWidth(this.label);
            let textHeightValue = this.p.textAscent() + this.p.textDescent();
            this.p.noFill()
            this.p.stroke(this.setColor(this.borderColor));
            this.p.strokeWeight(border);
            this.p.rect(this.cur_x-textWidthValue/2-2-borderRadius/2,this.cur_y-textHeightValue/2-1,
                textWidthValue+4+borderRadius, textHeightValue+1,
                borderRadius,borderRadius)
        }
    }

    isPressed() {}
    pressed() {}
    isReleased() {}
}

p5.prototype.Text = function (options = {}) {
    return new Text(this, options);
};
})(this);