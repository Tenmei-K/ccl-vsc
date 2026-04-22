// http://127.0.0.1:5500/project-b/
// http://10.209.89.3:5500/project-b/

let colors = ["hsl(202, 100%, 85%)", "hsl(49, 100%, 80%)", "hsl(0, 90%, 86%)", "hsl(71, 80%, 80%)"]
let stars = [];
let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];

let railStars = [];
let railShowUp = true;

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ maxHands: 4, flipped: true });
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));

  if (railShowUp == true) {
    for (let y = 0; y <= height; y += 0.1 * height) {
      setInterval(function () {
        railStars.push(new RailStar(y));
      }, 500);
      if (y >= height * 0.99) {
        railShowUp = false;
      }
    }
  }

  for (let i = 0; i < railStars.length; i++) {
    railStars[i].display();
    if (millis() > 100000) {
      railStars[i].update();
    }
  }


  // drawRails();

  // 【draw front stars】
  // for (let x = 0; i < stars.length; i++) {
  //   stars[i].display()
  //   stars[i].update();
  // }


}

class RailStar {
  constructor(y) { // 只在创建new时运行一次
    this.y = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.15, height * 0.2); // 随机分布值
    this.col = (0, 0, 100, map(abs(this.dx), 0, height * 0.05, 80, 50) + random(5, 10));

    this.rotateDeg = 0;

    this.choice = random(31); // 提供轨道选择比例
    if (this.choice < 4) {
      this.railR = 0.8
    } else if (this.choice >= 4 && this.choice < 4 + 5) {
      this.railR = 1.0
    } else if (this.choice >= 9 && this.choice < 9 + 6.1) {
      this.railR = 1.22
    } else if (this.choice >= 15.1 && this.choice < 15.1 + 7.2) {
      this.railR = 1.45
    } else {
      this.railR = 1.74
    }

    this.trackR = this.railR * height + this.dx; // 加了随机分布值的轨道
    this.x = (this.trackR ** 2 - this.y ** 2) ** 0.5;

    this.s = 10; // 星星的边长（暂定）
    // this.loc = frameCount; // record when the star is drawn and where it should be accordingly
  }
  display() {
    if (this.x <= width + this.s * 5 && this.y <= height + this.s * 10) {
      fill(this.col);
    } else {
      noFill();
    }
    noStroke();
    push();
    translate(this.x, this.y);
    // rotate(this.rotateDeg);
    rect(- this.s / 2, - this.s / 2, this.s, this.s);
    pop();
  }
  update() {

    this.rotateDeg = - map(this.trackR, 0.78 * height, 1.79 * height, frameCount / 10, frameCount / 12) % 360;

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15)
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    if (this.trackY > height + this.s * 10 && this.trackX < width) {
      this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.49;
    }

    this.x = this.trackR * sin(1 / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width; // sin里面的乘方是为了控制不同轨道的流速
    this.y = this.trackR * cos(1 / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880; // 最后括号外的乘方是为了控制轨道的y 
    // this.x = lerp(this.x, this.trackX, 0.028);
    // this.y = lerp(this.y, this.trackY, 0.028);
  }
}




// function drawBGStars(x, y, dis) {
//   let jx = noise(x * 0.3, y * 0.3) * dis * 39;
//   let jy = noise(x * 0.3 + 200, y * 0.3 + 200) * dis * 39;

//   fill(starH, 100, 100, 2 * 0.35);
//   circle(x + jx, y + jy, 2);
// }

function drawRails() {
  noFill();
  stroke("#ffffff1f");
  strokeWeight(1);
  for (let i = 0; i < railRs.length; i++) {
    // stroke(100);
    circle(width, height + (railRs[i] * height) ** 1.855 / 880, railRs[i] * height * 2); // [0.8, 1.0, 1.22, 1.45, 1.74];
    // stroke(50)
    // circle(width, height + (railRs[i] * height) ** 1.801 / 590, railRs[i] * height * 2); // [0.9, 1.1, 1.32, 1.55, 1.84];
  }
}