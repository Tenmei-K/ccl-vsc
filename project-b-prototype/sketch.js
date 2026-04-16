let colors = ["hsl(202, 100%, 85%)", "hsl(49, 100%, 80%)", "hsl(0, 90%, 86%)", "hsl(71, 80%, 80%)"]
let stars = [];
let rails = [0.8, 1.0, 1.22, 1.45, 1.74];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));

  noFill();
  stroke(100);
  strokeWeight(1);
  for (let i = 0; i < rails.length; i++) {
    stroke(100);
    circle(width, height + (rails[i] * height) ** 1.855 / 880, rails[i] * height * 2); // [0.8, 1.0, 1.22, 1.45, 1.74];
    // stroke(50)
    // circle(width, height + (rails[i] * height) ** 1.801 / 590, rails[i] * height * 2); // [0.9, 1.1, 1.32, 1.55, 1.84];
  }
  for (let i = 0; i < stars.length; i++) {
    stars[i].display();
    stars[i].update();
  }
}

class Star {
  constructor(x, y) { // 只在创建new时运行一次
    this.x = x;
    this.y = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.08, height * 0.08);
    this.col = random(colors)
    this.trackX = x;
    this.trackY = y;
    this.rail = random(rails)
    this.trackR = this.rail * height + this.dx;
    this.s = 10;
    this.loc = frameCount; // record when the star is drawn and where it should be accordingly
  }
  display() {
    noStroke();
    fill(this.col);
    rect(this.x - this.s / 2, this.y - this.s / 2, this.s, this.s);
  }
  update() {
    // this.trackX = this.trackR * sin((frameCount - this.loc) / 100 - 2 * PI / 3) + width / 2; // 如果不改trackY会有椭圆行星环的效果
    this.trackX = this.trackR * sin((frameCount - this.loc) / 100 / this.rail ** 1.39 - 4 * PI / 5) + width;
    this.trackY = this.trackR * cos((frameCount - this.loc) / 100 / this.rail ** 1.39 - 4 * PI / 5) + height + (this.trackR - this.dx) ** 1.855 / 880;
    this.x = lerp(this.x, this.trackX, 0.05);
    this.y = lerp(this.y, this.trackY, 0.05);
  }
}

function mouseClicked() {
  stars.push(new Star(mouseX, mouseY))
}

// function drawBGStars(x, y, dis) {
//   let jx = noise(x * 0.3, y * 0.3) * dis * 39;
//   let jy = noise(x * 0.3 + 200, y * 0.3 + 200) * dis * 39;

//   fill(starH, 100, 100, 2 * 0.35);
//   circle(x + jx, y + jy, 2);
// }