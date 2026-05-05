// http://127.0.0.1:5500/project-b/
// http://10.209.89.3:5500/project-b/

let mic, fft;
let vol;
let pvol;

let curImage = 0;
let exusiais = [];
let exusiaiY = 0;
let exusiaiDelY = 0.005;
let img1, img2, img3, img4, img5;
let tintA1 = 0;
let tintA2 = 0;
let tintA3 = 0;
let tintA4 = 0;
let tintA5 = 0;

// let pitchAvg = [];

let colors = ["hsl(202, 85%, 62%)", "hsl(49, 100%, 69%)", "hsl(0, 80%, 72%)", "hsl(71, 74%, 55%)"]
// let colors = ["hsl(202, 85%, 57%)", "hsl(49, 100%, 64%)", "hsl(0, 80%, 67%)", "hsl(71, 74%, 50%)"]
let stars = [];
let starCol, starSatu, starBri;

let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];

let PINCH_DISTANCE_THRESHOLD = 65;
// let starCreatingBooleans = []; // 针对每一只手设定
let starCreatedBooleans = []; // 针对每一只手设定

let railStars = [];
let railStarLoc = 340 + 416.5;
let bgRailStars = [];

let cirA = 1.2;
let cirR = 300;
let interactionStart = false;

let video;
let handPose;
let hands = [];

let pinchXs = [];
let pinchYs = [];
let pinchRs = [];
let pinchCols = [];
let pinchSatus = [];
let pinchAs = [];

let secondSoundSet = false;
let timePoint;
let timeSlot = 1060;
let secondSound, B, C, E, G;

function preload() {
  // load the handPose model
  handPose = ml5.handPose({ maxHands: 2, flipped: true });
  // sounds
  secondSound = loadSound("sounds/second.wav");
  B = loadSound("sounds/B.mp3");
  C = loadSound("sounds/C.mp3");
  E = loadSound("sounds/E.mp3");
  G = loadSound("sounds/G.mp3");
  // B = loadSound("sounds/Bb.mp3");
  // C = loadSound("sounds/Cb.mp3");
  // E = loadSound("sounds/Eb.mp3");
  // G = loadSound("sounds/Gb.mp3");
  // rondo = loadSound("sounds/rondo.mp3");

  // images
  for (let i = 1; i <= 3; i++) {
    let exusiai = loadImage("assets/exusiai" + i + ".png");
    exusiais.push(exusiai);
  }

  img1 = loadImage("assets/1.png");
  img2 = loadImage("assets/2.png");
  img3 = loadImage("assets/3.png");
  img4 = loadImage("assets/4.png");
  img5 = loadImage("assets/5.png");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);
  imageMode(CORNER);

  mic = new p5.AudioIn();
  mic.start();
  // fft = new p5.FFT();
  // fft.setInput(mic);
  // for (let i = 0; i < 1024; i++) {
  //   pitchAvg.push(0);
  // }

  // 轨道上星星冒出的过程
  setInterval(function () {
    if (railStarLoc > - 70 + 416.5 && exusiaiY >= height) { // 这样的设置我们一共有four个
      railStars.push(new RailStar(railStarLoc, 0.5, 0));
      railStarLoc -= 0.6;
    }
  }, 17);
  // sound
  timePoint = millis();
  setInterval(function () {
    if (exusiaiY >= height && railStarLoc >= - 70 + 416.5) {
      secondSound.play();
    }
  }, 180)
  setInterval(function () {
    if (railStarLoc < - 70 + 416.5) {
      secondSound.play();
    }
  }, 1060)
  // rondo version
  // setInterval(function () {
  //   if (railStarLoc < - 70) {
  //     secondSound.play();
  //   }
  // }, 1250)

  // create the video and hide it
  video = createCapture(VIDEO, { flipped: true });
  video.size(windowWidth, windowWidth * 480 / 640);
  video.hide();

  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(220, 88, 11, 1 - abs(map(sin(frameCount / 300), 1, -1, 0.9, -0.9)));

  vol = mic.getLevel();
  let VOL_THRESHOLD = 0.2;

  secondSound.setVolume(1.6);
  B.setVolume(0.6);
  C.setVolume(0.6);
  E.setVolume(0.6);
  G.setVolume(0.6);
  // if (railStarLoc < -48 && rondo.isPlaying() == false) {
  //   rondo.play()
  // }


  // animation
  if (exusiaiY < height) {

    // if (secondSound.isPlaying() == false && secondSoundSet == false) {
    if (millis() - timePoint > timeSlot && secondSoundSet == false) { // 到timeSlot后play sound，重置时间记录点，推新slot，单次运行
      secondSound.play();
      timePoint = millis()
      timeSlot -= 92;
      secondSoundSet = true;
    }
    if (secondSound.isPlaying() == false && millis() - timePoint <= timeSlot) { // reset
      secondSoundSet = false;
    }


    if (frameCount % 30 == 0) {
      curImage = (curImage + 1) % exusiais.length;
    }
    // if (frameCount > 100) {
    exusiaiDelY *= 1.02;
    exusiaiY += exusiaiDelY;
    // }
    image(exusiais[curImage], width - height / exusiais[curImage].height * exusiais[curImage].width, exusiaiY, height / exusiais[curImage].height * exusiais[curImage].width, height)
  } else {
    // images // start at 340 (+ 416.5?)
    // if (railStarLoc > - 70 && exusiaiY >= height) {
    if (railStarLoc > - 70 + 416.5) {
      if (railStarLoc <= 330 + 416.5) {
        if (B.isPlaying() == false) {
          B.play();
        }
        tintA1 += 0.03
        tint(100, tintA1)
        image(img1, width * 5 / 9, 0, width * 4 / 9, width * 4 / 9 * img1.height / img1.width);
      }
      if (railStarLoc <= 250 + 416.5) {
        if (C.isPlaying() == false) {
          C.play();
        }
        tintA2 += 0.03
        tint(100, tintA2)
        image(img2, width / 4, 0, width * 3 / 5 - width / 4, (width * 3 / 5 - width / 4) * img2.height / img2.width)
      }
      if (railStarLoc <= 170 + 416.5) {
        if (E.isPlaying() == false) {
          E.play();
        }
        tintA3 += 0.03
        tint(100, tintA3)
        image(img3, width * 4 / 7, height - (width * 4 / 5 - width * 4 / 7) * img3.height / img3.width, width * 4 / 5 - width * 4 / 7, (width * 4 / 5 - width * 4 / 7) * img3.height / img3.width)
      }
      if (railStarLoc <= 90 + 416.5) {
        if (G.isPlaying() == false) {
          G.play();
        }
        tintA4 += 0.03
        tint(100, tintA4)
        image(img4, width / 7, height - (width * 2 / 3 - width / 7) * img4.height / img4.width, width * 2 / 3 - width / 7, (width * 2 / 3 - width / 7) * img4.height / img4.width)
      }
      if (railStarLoc <= 10 + 416.5) {
        tintA5 += 0.03
        tint(100, tintA5)
        image(img5, width * 2 / 3, height - (width * 99 / 100 - width * 2 / 3) * img5.height / img5.width, width * 99 / 100 - width * 2 / 3, (width * 99 / 100 - width * 2 / 3) * img5.height / img5.width)
      }
    }
  }

  /*
  //【pitch】
  let spectrum = fft.analyze();
  let highestIdx = -1;
  let highestDelta = 0;
  for (i = 0; i < spectrum.length; i++) {
    pitchAvg[i] = pitchAvg[i] * 0.95 + spectrum[i] * 0.05;
    let delta = spectrum[i] - pitchAvg[i];
    if (delta > highestDelta) {
      highestDelta = delta;
      highestIdx = i;
    }
  }
  */
  /*
  if (highestIdx < 35) {
    // starCol = color("#4cb4f0")
    starCol = 202
    starSatu = 68
    starBri = 94
  } else if (highestIdx < 75) {
    // starCol = color("#c2e137")
    starCol = 71
    starSatu = 76
    starBri = 88
  } else if (highestIdx < 255) {
    // starCol = color("#ffe261")
    starCol = 49
    starSatu = 62
    starBri = 100
  } else {
    // starCol = color("#f17e7e")
    starCol = 0
    starSatu = 48
    starBri = 95
  }
  */

  if (stars.length % 4 == 0) {
    // starCol = color("#4cb4f0")
    starCol = 202
    starSatu = 68
    starBri = 94
  } else if (stars.length % 4 == 1) {
    // starCol = color("#c2e137")
    starCol = 71
    starSatu = 76
    starBri = 88
  } else if (stars.length % 4 == 2) {
    // starCol = color("#ffe261")
    starCol = 49
    starSatu = 62
    starBri = 100
  } else {
    // starCol = color("#f17e7e")
    starCol = 0
    starSatu = 48
    starBri = 95
  }


  //【bg rail stars】

  for (let i = 0; i < railStars.length; i++) {
    railStars[i].display();
  }

  if (railStarLoc <= - 70 + 416.5) {
    //【bg tiny stars】
    /*
    push();
    translate(width, height / 2);
    rotate(frameCount / 3200);
    let dis = width / 39;
    for (let x = - ((width ** 2 + height ** 2) ** 0.5); x < (width ** 2 + height ** 2) ** 0.5; x += dis) {
      for (let y = - ((width ** 2 + height ** 2) ** 0.5); y < (width ** 2 + height ** 2) ** 0.5; y += dis) {
        drawBGStars(x, y, dis)
      }
    }
    pop();
    */

    // text hint
    fill("white");
    textSize(20);
    textFont('Courier New');
    text("cam: 👌(pinch index finger & thumb) + 🤚(release) = ⭐", 22, 37);
    text("mic: 🔊++ = ?", 22, 67);

    if (interactionStart == false) {
      // 重新push一整圈railStars
      railStars = [];
      for (let loc = 0; loc < 3200; loc += 2.5) {
        railStars.push(new RailStar(loc, 0.55, loc)); // 如果改这里记得把class Star里的this.alp也改了
      }
      for (let loc = 0; loc < 3200; loc += 0.75) {
        bgRailStars.push(new RailStar(loc, 0.15, loc));
      }
      interactionStart = true;
    }

    for (let i = 0; i < bgRailStars.length; i++) {
      bgRailStars[i].display();
      bgRailStars[i].update();
    }
    for (let i = 0; i < railStars.length; i++) {
      railStars[i].update();
    }

    // 爆炸
    fill(0, 0, 100, cirA);
    noStroke();
    circle(width / 2, height / 2, cirR);
    cirA -= 0.032;
    cirR += 50;
    if (cirA <= 0) {
      cirR = 0
    }

    // 过大声音
    if (vol - pvol > VOL_THRESHOLD) {
      for (let i = 0; i < bgRailStars.length; i++) {
        bgRailStars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 4)
      }
      for (let i = 0; i < railStars.length; i++) {
        railStars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 4)
      }
      for (let i = 0; i < stars.length; i++) {
        stars[i].dx *= map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 4)
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
  // 记录上一帧的vol
  pvol = vol;


  //【ml5】&【draw stars】

  // if there is at least one hand
  if (hands.length > 0 && interactionStart == true) {

    for (let i = 0; i < hands.length; i++) {
      // find the index finger tip and thumb tip from the first hand
      let indexFinger = hands[i].index_finger_tip;
      let thumb = hands[i].thumb_tip;
      let indexFingerB = hands[i].index_finger_mcp;
      let thumbB = hands[i].thumb_mcp;

      // calculate the pinch "distance" between indexFinger and thumb
      let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

      // get the center (average) of the two fingers
      let centerX = (indexFinger.x + thumb.x) / 2;
      let centerY = (indexFinger.y + thumb.y) / 2;
      let bottomX = (indexFingerB.x + thumbB.x) / 2;
      let bottomY = (indexFingerB.y + thumbB.y) / 2;

      // fill(0, 100, 100)
      // circle(bottomX, bottomY, 10)
      // calculate angle

      let fingerAngle = atan2(centerY - bottomY, centerX - bottomX); // finger - bottom

      // calculate s of stars
      let s = map(vol, 0, 0.7, 8, 16);
      if (vol > 0.7) {
        s = 16;
      }

      // display two fingers
      stroke("#ffffff56");
      fill("#ffffff46");
      circle(indexFinger.x, indexFinger.y, 18);
      circle(thumb.x, thumb.y, 18);


      if (distance < PINCH_DISTANCE_THRESHOLD) {
        // pinched!
        starCreatedBooleans[i] = false;
        noStroke();
        fill(starCol, starSatu, starBri);
        rect(centerX - s / 2, centerY - s / 2, s, s);

      } else { // the moment release

        if (starCreatedBooleans[i] == false) {
          stars.push(new Star(centerX, centerY, starCol, starSatu, starBri, s, fingerAngle, centerX, bottomX));

          pinchXs[i] = centerX;
          pinchYs[i] = centerY;
          pinchRs[i] = 0;
          pinchAs[i] = 0.3;
          pinchCols[i] = starCol;
          pinchSatus[i] = starSatu - 20;

          if (stars.length % 4 == 1) {
            let sound = B
            sound.play()
          } else if (stars.length % 4 == 2) {
            let sound = C
            sound.play()
          } else if (stars.length % 4 == 3) {
            let sound = E
            sound.play()
          } else {
            let sound = G
            sound.play()
          }
          starCreatedBooleans[i] = true;
        }

        if (starCreatedBooleans[i] == true) {
          noStroke();
          pinchAs[i] -= 0.008
          pinchRs[i] += 9
          // fill(0, 0, 100, pinchA);
          fill(pinchCols[i], pinchSatus[i], 100, pinchAs[i]);
          circle(pinchXs[i], pinchYs[i], pinchRs[i])
        }
      }
    }
  }


  // 【draw front stars】
  for (let i = 0; i < stars.length; i++) {
    stars[i].display();
    stars[i].update();
  }


}

class Star {
  constructor(x, y, col, satu, bri, s, angle, cx, bx) { // 只在创建new时运行一次
    // this.creating = true;
    this.x = x;
    this.y = y;
    this.xSave = x; // for calculation
    this.ySave = y; // for calculation
    this.dx = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07); // 随机分布值
    this.dxSave = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07);
    this.col = col;
    this.satu = satu;
    this.bri = bri;
    this.alp = 1;

    this.inTrack = false;
    if (cx > bx) {
      this.trackX = x + height * 0.38 / ((1 + tan(angle) ** 2) ** 0.5);
      this.trackY = y + height * 0.38 * tan(angle) / ((1 + tan(angle) ** 2) ** 0.5);
    } else {
      this.trackX = x - height * 0.38 / ((1 + tan(angle) ** 2) ** 0.5);
      this.trackY = y - height * 0.38 * tan(angle) / ((1 + tan(angle) ** 2) ** 0.5);
    }
    this.pinchAngle = angle;
    this.cx = cx; // fingertip x
    this.bx = bx; // fingerbottom x

    if (this.s < 11) {
      this.choice = random(15.1); // 提供轨道选择比例
      if (this.choice < 4) {
        this.railR = 0.8
      } else if (this.choice >= 4 && this.choice < 4 + 5) {
        this.railR = 1.0
      } else {
        this.railR = 1.22
      }
    } else if (this.s < 14) {
      this.choice = random(18.3); // 提供轨道选择比例
      if (this.choice < 5) {
        this.railR = 1.0
      } else if (this.choice >= 5 && this.choice < 5 + 6.1) {
        this.railR = 1.22
      } else {
        this.railR = 1.45
      }
    } else if (this.s < 17) {
      this.choice = random(22); // 提供轨道选择比例
      if (this.choice < 6.1) {
        this.railR = 1.22
      } else if (this.choice >= 6.1 && this.choice < 6.1 + 7.2) {
        this.railR = 1.45
      } else {
        this.railR = 1.74
      }
    } else {
      this.choice = random(15.9); // 提供轨道选择比例
      if (this.choice < 7.2) {
        this.railR = 1.45
      } else {
        this.railR = 1.74
      }
    }

    this.trackR = this.railR * height + this.dx; // 加了随机分布值的轨道
    // this.rotateDeg = - (map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 0.12, frameCount / 0.08) % 360);
    this.rotateDeg = 0;

    this.s = s; // 星星的边长
    this.sSave = s; // for calculation
    this.loc = frameCount; // record when the star is drawn and where it should be accordingly

    this.dRad = 0; // 使trackX和trackY快速回到屏幕内的rad变化值
  }
  display() {
    if (this.trackX <= width + this.s * 5 && this.trackY <= height + this.s * 10) {
      fill(this.col, this.satu, this.bri, this.alp);
    } else {
      noFill();
    }
    noStroke();
    push();
    translate(this.x, this.y);
    rotate(radians(this.rotateDeg));
    rect(- this.s / 2, - this.s / 2, this.s, this.s);
    pop();
  }
  update() { // remember to check whether there's anything need to be changed in construct()

    // this.rotateDeg = - (map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 0.12, frameCount / 0.08) % 360); // 思路对了
    // this.rotateDeg = - (map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 12, frameCount / 8) % 360); // chudeshuyueda bianhuayueman

    // if (frameCount - this.loc > 4500 && this.rotateDeg > -3) {
    //   this.rotateDeg = 0;
    // } else if (frameCount > this.loc) {
    //   this.rotateDeg = - (map(this.trackR, 0.78 * height, 1.81 * height, frameCount / (0.12 * (frameCount - this.loc + 1000) / 1000), frameCount / (0.08 * (frameCount - this.loc + 1000) / 1000)) % 360);
    // } else {
    //   this.rotateDeg = - (map(this.trackR, 0.78 * height, 1.81 * height, frameCount / 0.12, frameCount / 0.08))
    // }

    // this.rotateDeg -= map(this.trackR, 0.78 * height, 1.81 * height, 1 / 0.12, 1 / 0.08) % 360;
    if (frameCount - this.loc > 7200 && this.rotateDeg > -10) {
      this.rotateDeg = 0;
    } else {
      this.rotateDeg = (this.rotateDeg - (map(this.trackR, 0.78 * height, 1.81 * height, 1 / 0.12, 1 / 0.08) * 1 / ((frameCount - this.loc + 300) / 300))) % 360;
    }

    this.satu = lerp(this.satu, map(abs(this.dx), 0, height * 0.18, 10, -5), 0.00052);
    this.alp = lerp(this.alp, map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8), 0.00052);
    if (abs(this.satu - map(abs(this.dx), 0, height * 0.18, 10, -5)) <= 0.1) {
      this.satu = map(abs(this.dx), 0, height * 0.18, 10, -5)
    }
    if (abs(this.alp - map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8)) <= 0.1) {
      this.alp = map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8)
    }

    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20
    }

    this.s = map(this.trackY, -this.sSave * 10, height + this.sSave * 10, this.sSave - 4, this.sSave + 5);
    if (this.trackY > height + this.s * 10 || this.trackX > width) {
      this.s = this.sSave + 5;
    } // 使星星的边长进大远小

    if (this.y > height + this.s * 10 && this.x < width && this.inTrack == true) {
      // this.dRad += PI * 1.1708 * (this.railR + this.dx / height) ** 0.46;
      this.dRad += PI * 1.14 * (this.railR + this.dx / height) ** 0.46;
    } // 使trackX和trackY快速转过一圈回到屏幕内


    // if (this.inTrack == false && this.pinchAngle !== undefined && abs(degrees(this.pinchAngle)) > 3) {
    if (this.inTrack == false) {
      // this.trackX = lerp(this.xSave - height * 0.38 / tan(this.pinchAngle), this.trackR * sin((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width, 0.05);
      // this.trackY = lerp(this.ySave + height * 0.38 * tan(this.pinchAngle), this.trackR * cos((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880, 0.05);

      if (this.cx > this.bx) {
        this.trackX = lerp(this.xSave + height * 0.38 / ((1 + tan(this.pinchAngle) ** 2) ** 0.5), this.trackR * sin((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width, 0.3);
        this.trackY = lerp(this.ySave + height * 0.38 * tan(this.pinchAngle) / ((1 + tan(this.pinchAngle) ** 2) ** 0.5), this.trackR * cos((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880, 0.3);
      } else {
        this.trackX = lerp(this.xSave - height * 0.38 / ((1 + tan(this.pinchAngle) ** 2) ** 0.5), this.trackR * sin((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width, 0.3);
        this.trackY = lerp(this.ySave - height * 0.38 * tan(this.pinchAngle) / ((1 + tan(this.pinchAngle) ** 2) ** 0.5), this.trackR * cos((frameCount - this.loc) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880, 0.3);
      }
      if (frameCount - this.loc >= 60) {
        this.inTrack = true;
      }
      this.x = lerp(this.x, this.trackX, 0.06);
      this.y = lerp(this.y, this.trackY, 0.06);
    } else { // this.trackX = this.trackR * sin((frameCount - this.loc) / 100 - 2 * PI / 3) + width / 2; // 如果不改trackY会有椭圆行星环的效果
      this.inTrack = true;
      this.trackX = this.trackR * sin((frameCount - this.loc - 5) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width; // sin里面的乘方是为了控制不同轨道的流速
      this.trackY = this.trackR * cos((frameCount - this.loc - 5) / 250 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880; // 最后括号外的乘方是为了控制轨道的y 
      this.x = lerp(this.x, this.trackX, 0.02);
      this.y = lerp(this.y, this.trackY, 0.02);
    }



  }
}


class RailStar {
  constructor(loc, maxA, i) { // 只在创建new时运行一次
    this.dx = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18); // 随机分布值
    this.dxSave = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18);
    this.col = color(233, map(abs(this.dx), 0, height * 0.18, 10, -5), 100, map(abs(this.dx), 0, height * 0.18, maxA, maxA / 8));
    // this.col = color(0, 0, 100, 0.5);

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

    this.x = this.trackR * sin((frameCount - this.loc) / 220 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width;
    this.y = this.trackR * cos((frameCount - this.loc) / 220 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880;

    this.s = 10; // 星星的边长（暂定）
  }

  display() {
    fill(this.col);
    noStroke();
    rect(this.x - this.s / 2, this.y - this.s / 2, this.s, this.s);
  }

  update() {

    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20
    }

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15)
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    this.trackX = this.trackR * sin((frameCount - this.loc) / 220 / this.railR ** 1.39 - 4 * PI / 5) + width;
    this.trackY = this.trackR * cos((frameCount - this.loc) / 220 / this.railR ** 1.39 - 4 * PI / 5) + height + (this.trackR - this.dx) ** 1.855 / 880;
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
  let jx = noise(x * 0.3, y * 0.3) * dis * 5;
  let jy = noise(x * 0.3 + 200, y * 0.3 + 200) * dis * 5;

  fill(color(233, 20, 80, 0.38));
  rect(x + jx - 1, y + jy - 1, 2, 2);
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