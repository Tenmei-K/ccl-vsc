/*
  Check our the GOAL and the RULES of this exercise at the bottom of this file.
  
  After that, follow these steps before you start coding:

  1. rename the dancer class to reflect your name (line 35).
  2. adjust line 20 to reflect your dancer's name, too.
  3. run the code and see if a square (your dancer) appears on the canvas.
  4. start coding your dancer inside the class that has been prepared for you.
  5. have fun.
*/

let dancer;

function setup() {
  // no adjustments in the setup function needed...
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  // ...except to adjust the dancer's name on the next line:
  dancer = new NancyDancer(width / 2, height / 2);
}

function draw() {
  // you don't need to make any adjustments inside the draw loop
  background(0);
  drawFloor(); // for reference only

  dancer.update();
  dancer.display();
}

// You only code inside this class.
// Start by giving the dancer your name, e.g. LeonDancer.
class NancyDancer {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.d = 72;
    // this.delx = 1;
    // this.dely = 1;
  }
  update() {
    /*
    if (this.x > windowWidth || this.x < 0) {
      this.delx *= -1;
    }
    if (this.y > windowHeight || this.y < windowHeight / 2) {
      this.dely *= -1;
    }

    this.x = this.x + this.delx;
    this.y = this.y + this.dely;
    */
    this.y += sin(frameCount / 10);

  }
  display() {
    push();
    translate(this.x, this.y);

    // ******** //
    // ⬇️ draw your dancer from here ⬇️


    this.drawFluff();

    this.drawBody(this.d);


    // ⬆️ draw your dancer above ⬆️
    // ******** //


    // this.drawReferenceShapes()

    pop();
  }



  drawBody(d) {
    noStroke();
    fill("#86cecb");
    circle(0, 0, d);
  }

  drawFluff() {
    stroke("#137a7f");
    strokeWeight(2.5);
    fill("#86cecb");
    for (let i = 0; i < 16; i++) {
      push();
      rotate(2 * PI / 16 * i);
      circle(this.d / 2, 0, 14);
      pop();
    }
  }

  drawLeg() {
    line(0, this.d / 3 * 2,)
  }

  drawReferenceShapes() {
    noFill();
    stroke(255, 0, 0);
    line(-5, 0, 5, 0);
    line(0, -5, 0, 5);
    stroke(255);
    rect(-100, -100, 200, 200);
    fill(255);
    stroke(0);
  }
}



/*
GOAL:
The goal is for you to write a class that produces a dancing being/creature/object/thing. In the next class, your dancer along with your peers' dancers will all dance in the same sketch that your instructor will put together. 

RULES:
For this to work you need to follow one rule: 
  - Only put relevant code into your dancer class; your dancer cannot depend on code outside of itself (like global variables or functions defined outside)
  - Your dancer must perform by means of the two essential methods: update and display. Don't add more methods that require to be called from outside (e.g. in the draw loop).
  - Your dancer will always be initialized receiving two arguments: 
    - startX (currently the horizontal center of the canvas)
    - startY (currently the vertical center of the canvas)
  beside these, please don't add more parameters into the constructor function 
  - lastly, to make sure our dancers will harmonize once on the same canvas, please don't make your dancer bigger than 200x200 pixels. 
*/