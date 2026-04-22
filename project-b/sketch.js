// http://127.0.0.1:5500/project-b/
// http://10.209.89.3:5500/project-b/

let colors = ["hsl(202, 100%, 85%)", "hsl(49, 100%, 80%)", "hsl(0, 90%, 86%)", "hsl(71, 80%, 80%)"]
let stars = [];
let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];
let PINCH_DISTANCE_THRESHOLD = 50;

let video;
let handPose;
let hands = [];

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ maxHands: 4, flipped: true });
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);

  // create the video and hide it
  video = createCapture(VIDEO, { flipped: true });
  video.size(windowWidth, windowWidth * 480 / 640);
  video.hide();

  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));

  //【ml5】

  // if there is at least one hand
  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      // find the index finger tip and thumb tip from the first hand
      let indexFinger = hands[i].index_finger_tip;
      let thumb = hands[i].thumb_tip;

      // calculate the pinch "distance" between indexFinger and thumb
      let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

      // display two fingers
      stroke("#ffffff39");
      fill("#ffffff28");
      circle(indexFinger.x, indexFinger.y, 18);
      circle(thumb.x, thumb.y, 18);

      if (distance < PINCH_DISTANCE_THRESHOLD) {
        // pinched!

        // get the center (average) of the two fingers
        let centerX = (indexFinger.x + thumb.x) / 2;
        let centerY = (indexFinger.y + thumb.y) / 2;
        let dia = map(distance, 0, PINCH_DISTANCE_THRESHOLD, 60, 1);

        // display a circle to indicate "pinch"
        // fill("#ffffff81");
        // circle(centerX, centerY, dia);
      }
    }
  }


  // drawRails();

  // 【draw front stars】
  for (let i = 0; i < stars.length; i++) {
    stars[i].display()
    stars[i].update();
  }


  // image(video, 0, 0);

}

class Star {
  constructor(x, y) { // 只在创建new时运行一次
    this.x = x;
    this.y = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07); // 随机分布值
    this.col = random(colors)

    this.trackX = x;
    this.trackY = y;
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

    this.s = 10; // 星星的边长（暂定）
    this.loc = frameCount; // record when the star is drawn and where it should be accordingly

    this.dRad = 0; // 使trackX和trackY快速回到屏幕内的rad变化值
  }
  display() {
    if (this.trackX <= width + this.s * 5 && this.trackY <= height + this.s * 10) {
      fill(this.col);
    } else {
      noFill();
    }
    noStroke();
    push();
    translate(this.x, this.y);
    rotate(this.rotateDeg);
    rect(- this.s / 2, - this.s / 2, this.s, this.s);
    pop();
  }
  update() {

    this.rotateDeg = - map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 5, frameCount / 8) % 360;

    this.s = map(this.trackY, -this.s * 10, height + this.s * 10, 6, 15);
    if (this.trackY > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    } // 使星星的边长进大远小

    if (this.trackY > height + this.s * 10 && this.trackX < width) {
      this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.46;
    } // 使trackX和trackY快速转过一圈回到屏幕内

    // this.trackX = this.trackR * sin((frameCount - this.loc) / 100 - 2 * PI / 3) + width / 2; // 如果不改trackY会有椭圆行星环的效果
    this.trackX = this.trackR * sin((frameCount - this.loc) / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width; // sin里面的乘方是为了控制不同轨道的流速
    this.trackY = this.trackR * cos((frameCount - this.loc) / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880; // 最后括号外的乘方是为了控制轨道的y 
    this.x = lerp(this.x, this.trackX, 0.028);
    this.y = lerp(this.y, this.trackY, 0.028);
  }
}


class RailStar {
  constructor(x, y) { // 只在创建new时运行一次
    this.x = x;
    this.y = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.05, height * 0.05); // 随机分布值
    this.col = (0, 0, 100, map(abs(this.dx), 0, height * 0.05, 90, 20) + random(5, 10));

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
    rotate(this.rotateDeg);
    rect(- this.s / 2, - this.s / 2, this.s, this.s);
    pop();
  }
  update() {

    this.rotateDeg = - map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 10, frameCount / 12) % 360;

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15)
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    if (this.trackY > height + this.s * 10 && this.trackX < width) {
      this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.49;
    }

    this.x += this.trackR * sin(1 / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width; // sin里面的乘方是为了控制不同轨道的流速
    this.y += this.trackR * cos(1 / 200 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880; // 最后括号外的乘方是为了控制轨道的y 
    // this.x = lerp(this.x, this.trackX, 0.028);
    // this.y = lerp(this.y, this.trackY, 0.028);
  }
}

function mouseClicked() {
  stars.push(new Star(mouseX, mouseY))
}

// callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

function drawBGStars(x, y, dis) {
  let jx = noise(x * 0.3, y * 0.3) * dis * 39;
  let jy = noise(x * 0.3 + 200, y * 0.3 + 200) * dis * 39;

  fill(starH, 100, 100, 2 * 0.35);
  circle(x + jx, y + jy, 2);
}

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