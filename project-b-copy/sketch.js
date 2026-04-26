// http://127.0.0.1:5500/project-b-copy/

let colors = ["hsl(202, 100%, 85%)", "hsl(49, 100%, 80%)", "hsl(0, 90%, 86%)", "hsl(71, 80%, 80%)"]
let stars = [];
let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];

let railStars = [];
let railStarLoc = 320;
let bgRailStars = [];

let cirA = 1;
let cirR = 280;
let interactionStart = false;

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ maxHands: 4, flipped: true });
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);

  // 轨道上星星冒出的过程
  setInterval(function () {
    if (railStarLoc > - 45) {
      railStars.push(new RailStar(railStarLoc, 0.8, 0));
      railStarLoc -= 0.5;
    }
  }, 2);

  // 提前push最底边背景的星星
  for (let loc = 0; loc < 2160; loc += 0.75) {
    bgRailStars.push(new RailStar(loc, 0.34, loc));
  }
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));

  if (railStarLoc <= - 45) {

    if (interactionStart == false) {
      // 重新push一整圈railStars
      railStars = [];
      for (let loc = 0; loc < 2160; loc += 2.5) {
        railStars.push(new RailStar(loc, 0.9, loc));
      }

      interactionStart = true;
    }

    for (let i = 0; i < bgRailStars.length; i++) {
      bgRailStars[i].display();
      bgRailStars[i].update();
    }

    fill(0, 0, 100, cirA);
    noStroke();
    circle(width / 2, height / 2, cirR);
    cirA -= 0.02;
    cirR += 39;
    if (cirA <= 0) {
      cirR = 0
    }

  }

  // console.log(railStars.length)
  for (let i = 0; i < railStars.length; i++) {
    railStars[i].display();
    if (railStarLoc <= - 45) {
      railStars[i].update();
    }
  }


  // drawRails();


}

class RailStar {
  constructor(loc, maxA, i) { // 只在创建new时运行一次
    this.dx = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18); // 随机分布值
    this.col = color(233, map(abs(this.dx), 0, height * 0.18, 10, -5), 100, map(abs(this.dx), 0, height * 0.18, maxA, maxA / 8));
    // this.col = color(0, 0, 100, 0.5);

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
    this.trackR = this.railR * height + this.dx; // 轨道

    this.loc = loc;
    this.dRad = 0;

    this.x = this.trackR * sin((frameCount - this.loc) / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width;
    this.y = this.trackR * cos((frameCount - this.loc) / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880;

    this.s = 10; // 星星的边长（暂定）
  }

  display() {
    fill(this.col);
    noStroke();
    push();
    translate(this.x, this.y);
    // rotate(this.rotateDeg);
    rect(- this.s / 2, - this.s / 2, this.s, this.s);
    pop();
  }

  update() {

    // this.rotateDeg = - (frameCount / 18) % 360;

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15)
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    // if (this.y > height + this.s * 10 && this.x < width) {
    //   this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.46;
    // }

    this.x = this.trackR * sin((frameCount - this.loc) / 180 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width; // sin里面的乘方是为了控制不同轨道的流速
    this.y = this.trackR * cos((frameCount - this.loc) / 180 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880; // 最后括号外的乘方是为了控制轨道的y 

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