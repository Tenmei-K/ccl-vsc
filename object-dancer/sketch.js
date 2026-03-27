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
  }
  update() {
    this.d = 72;
    this.num = 16;
    this.bodyY = map(sin(frameCount / 10), -1, 1, 0, 18);
    this.directionDist = map(mouseX - this.x, -300, 300, 0.625, -0.625);
    if (mouseX - this.x < -300) {
      this.directionDist = 0.625
    } else if (mouseX - this.x > 300) {
      this.directionDist = -0.625
    }
  }
  display() {
    push();
    translate(this.x, this.y);

    this.drawLeg(-this.d / 2.6, this.d * 1.2);
    this.drawFluff(this.num);
    this.drawBody(this.d);
    this.drawLeg(this.d / 2.6, this.d * 1.2);

    pop();
  }

  drawBody(d) {
    noStroke();
    fill("#86cecb");
    circle(0, this.bodyY, d);
  }
  drawFluff(num) {
    push();
    translate(0, this.bodyY)
    stroke("#137a7f");
    strokeWeight(3);
    fill("#86cecb");
    for (let i = 0; i < num; i++) {
      push();
      rotate(2 * PI / num * i);
      circle(this.d / 2, 0, 14);
      pop();
    }
    pop();
  }
  drawLeg(x, y) {
    stroke("#137a7f");
    strokeWeight(10);
    line(x, this.bodyY, x - this.bodyY * this.directionDist, (this.bodyY + y) / 2);
    line(x - this.bodyY * this.directionDist, (this.bodyY + y) / 2, x, y);
    line(x, y, x - 22 * this.directionDist, y)
  }
}