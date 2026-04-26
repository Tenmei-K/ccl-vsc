// http://127.0.0.1:5500/project-b/
// http://10.209.89.3:5500/project-b/

let mic;
let pvol;

let colors = ["hsl(202, 85%, 67%)", "hsl(49, 100%, 74%)", "hsl(0, 80%, 77%)", "hsl(71, 74%, 60%)"]
let stars = [];
let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];
let PINCH_DISTANCE_THRESHOLD = 50;
let starCreatingColors = []; // 针对每一只手设定
let starCreatedBooleans = []; // 针对每一只手设定

let starsScared = false;

let railStars = [];
let railStarLoc = 320;
let bgRailStars = [];

let cirA = 1.2;
let cirR = 300;
let interactionStart = false;

let video;
let handPose;
let hands = [];

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ maxHands: 1, flipped: true });
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);

  mic = new p5.AudioIn();
  mic.start();

  // 轨道上星星冒出的过程
  setInterval(function () {
    if (railStarLoc > - 25) { // 这样的设置我们一共有三个
      railStars.push(new RailStar(railStarLoc, 0.8, 0));
      railStarLoc -= 0.5;
    }
  }, 1);

  // create the video and hide it
  video = createCapture(VIDEO, { flipped: true });
  video.size(windowWidth, windowWidth * 480 / 640);
  video.hide();

  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  for (let i = 0; i < hands.length; i++) {
    starCreatedBooleans[i] = false;
  }
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));


  let vol = mic.getLevel();
  let VOL_THRESHOLD = 0.6 * (1 - vol);
  // console.log(vol);

  // background stars
  if (railStarLoc <= - 25) {
    fill("white");
    textSize(16);
    text("🖐️->👌->🖐️ = ⭐", 15, 30);
    text("🔊++  =  ?", 15, 50);

    if (interactionStart == false) {
      // 重新push一整圈railStars
      railStars = [];
      for (let loc = 0; loc < 2160; loc += 2.5) {
        railStars.push(new RailStar(loc, 0.9, loc));
      }
      for (let loc = 0; loc < 2160; loc += 0.75) {
        bgRailStars.push(new RailStar(loc, 0.34, loc));
      }
      interactionStart = true;
    }

    // 提前push最底边背景的星星
    for (let i = 0; i < bgRailStars.length; i++) {
      bgRailStars[i].display();
      bgRailStars[i].update();
    }

    fill(0, 0, 100, cirA);
    noStroke();
    circle(width / 2, height / 2, cirR);
    cirA -= 0.035;
    cirR += 50;
    if (cirA <= 0) {
      cirR = 0
    }

    if (vol - pvol > VOL_THRESHOLD) {
      for (let i = 0; i < bgRailStars.length; i++) {
        bgRailStars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 5)
      }
      for (let i = 0; i < railStars.length; i++) {
        railStars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 5)
      }
      for (let i = 0; i < stars.length; i++) {
        stars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 5)
      }
    } else {
      for (let i = 0; i < bgRailStars.length; i++) {
        bgRailStars[i].dx = bgRailStars[i].dxSave
      }
      for (let i = 0; i < railStars.length; i++) {
        railStars[i].dx = railStars[i].dxSave
      }
      for (let i = 0; i < stars.length; i++) {
        stars[i].dx = stars[i].dxSave
      }
    }


  }

  // console.log(railStars.length)
  for (let i = 0; i < railStars.length; i++) {
    railStars[i].display();
    if (railStarLoc <= - 25) {
      railStars[i].update();
    }
  }



  //【ml5】&【draw stars】

  // if there is at least one hand
  if (hands.length > 0 && interactionStart == true) {
    for (let i = 0; i < hands.length; i++) {
      // find the index finger tip and thumb tip from the first hand
      let indexFinger = hands[i].index_finger_tip;
      let thumb = hands[i].thumb_tip;

      // calculate the pinch "distance" between indexFinger and thumb
      let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

      // get the center (average) of the two fingers
      let centerX = (indexFinger.x + thumb.x) / 2;
      let centerY = (indexFinger.y + thumb.y) / 2;

      let s = map(vol, 0, 0.9, 8, 12);

      // display two fingers
      stroke("#ffffff45");
      fill("#ffffff3c");
      circle(indexFinger.x, indexFinger.y, 18);
      circle(thumb.x, thumb.y, 18);


      if (distance < PINCH_DISTANCE_THRESHOLD) {
        // pinched!
        starCreatedBooleans[i] = false;
        let dia = map(distance, 0, PINCH_DISTANCE_THRESHOLD, 60, 1);

        starCreatingColors.push(random(colors));
        fill("white");
        rect(centerX - s / 2, centerY - s / 2, s, s);

        // star.x = centerX;
        // star.y = centerY;


      } else {
        if (starCreatedBooleans[i] == false) {
          stars.push(new Star(centerX, centerY, starCreatingColors[i], s));
          starCreatedBooleans[i] = true;
        }
        // for (let num = 0; num < stars.length; num++) {
        //   stars[num].creating = false;
        // }
      }
    }
  }


  // drawRails();

  // 【draw front stars】
  for (let i = 0; i < stars.length; i++) {
    stars[i].display();
    stars[i].update();
  }


  // image(video, 0, 0);
  pvol = vol;

}

class Star {
  constructor(x, y, col, s) { // 只在创建new时运行一次
    // this.creating = true;
    this.x = x;
    this.y = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07); // 随机分布值
    this.dxSave = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07);
    this.col = col;

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

    this.s = s; // 星星的边长
    this.sSave = s; // for calculation
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

    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20
    }

    this.s = map(this.trackY, -this.sSave * 10, height + this.sSave * 10, this.sSave - 4, this.sSave + 5);
    if (this.trackY > height + this.s * 10 || this.trackX > width) {
      this.s = this.sSave + 5;
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
  constructor(loc, maxA, i) { // 只在创建new时运行一次
    this.dx = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18); // 随机分布值
    this.dxSave = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18);
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

    this.x = this.trackR * sin((frameCount - this.loc) / 150 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width;
    this.y = this.trackR * cos((frameCount - this.loc) / 150 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880;

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

    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20
    }

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15)
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    // if (this.y > height + this.s * 10 && this.x < width) {
    //   this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.46;
    // }

    this.trackX = this.trackR * sin((frameCount - this.loc) / 150 / this.railR ** 1.39 - 4 * PI / 5) + width;
    this.trackY = this.trackR * cos((frameCount - this.loc) / 150 / this.railR ** 1.39 - 4 * PI / 5) + height + (this.trackR - this.dx) ** 1.855 / 880;
    this.x = lerp(this.x, this.trackX, 0.08);
    this.y = lerp(this.y, this.trackY, 0.08);

  }
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