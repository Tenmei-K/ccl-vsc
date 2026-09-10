// 改动：
//   1. mapHandPoint 的坐标来源改为可配置（HAND_COORD_SOURCE），并加了首次检测日志
//   2. 新增 playOneShot()，绕开 p5.SoundFile.play() 的 counter-buffer 分配
//   3. pixelDensity 提为常量，便于按实际屏幕调整
//   4. Star 构造器里 this.s 的已知 bug 补上了准确注释（行为保持不变）
//   5. kiosk failsafe 补 catch
//
// 部署前可看末尾注释


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
let A1show = false;
let A2show = false;
let A3show = false;
let A4show = false;

let colors = ["hsl(202, 85%, 62%)", "hsl(49, 100%, 69%)", "hsl(0, 80%, 72%)", "hsl(71, 74%, 55%)"];
let stars = [];
let starCol, starSatu, starBri;

// ================= 可调配置 =================

// 画布像素密度。先在展览机上跑 console.log(window.devicePixelRatio)：
//   返回 1  -> 这里填 1，本行等于空操作，无收益也无害
//   返回 2+ -> 填 1 省一大半填充率，但 2px 背景星和提示文字会发虚；
//              觉得糊就改 1.5 折中
const CANVAS_PIXEL_DENSITY = 1;

// ml5 返回的手部关键点坐标处在哪个尺寸空间。
//   "element"   -> p5 元素尺寸，即下面的 HAND_W (640)
//   "intrinsic" -> 摄像头流的原始尺寸 video.elt.videoWidth
// 首次检测到手时控制台会打印实测值（见 gotHands），照着结论改这一行。
// 填错的症状：手指白点位置整体偏移或飞出屏幕，捏合永远判定不成立。
const HAND_COORD_SOURCE = "element";
const DEBUG_HAND_COORDS = true;   // 验证完可改 false 关掉日志

const HAND_W = 640;
const HAND_H = 480;

const MAX_STARS = 600;            // 前景星上限，防止无限增长

const ENABLE_KIOSK_FAILSAFE = true;
const KIOSK_RELOAD_AFTER_MS = 4 * 60 * 60 * 1000; // 跑满 4 小时后开始考虑重启
const KIOSK_IDLE_MS = 30 * 1000;                  // 且至少 30 秒无人时才真的重启
const KIOSK_CHECK_MS = 30 * 1000;

// ============================================

let totalStarsCreated = 0;       // musical/colour sequence counter; never capped
let bgStarPositions = [];        // [x0,y0,x1,y1,...], precomputed once
const pageStartedAt = Date.now();
let lastInteractionAt = Date.now();
let handCoordLogged = false;

let railRs = [0.8, 1.0, 1.22, 1.45, 1.74];
let PINCH_DISTANCE_THRESHOLD = 45;
let starCreatedBooleans = [];

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
let secondSound, B, C, E, G, B8va, C8va, E8va, G8va;

function preload() {
  handPose = ml5.handPose({ maxHands: 2, flipped: true });

  secondSound = loadSound("sounds/second.wav");
  B = loadSound("sounds/B.mp3");
  C = loadSound("sounds/C.mp3");
  E = loadSound("sounds/E.mp3");
  G = loadSound("sounds/G.mp3");
  B8va = loadSound("sounds/B8va.mp3");
  C8va = loadSound("sounds/C8va.mp3");
  E8va = loadSound("sounds/E8va.mp3");
  G8va = loadSound("sounds/G8va.mp3");

  for (let i = 1; i <= 3; i++) {
    exusiais.push(loadImage("assets/exusiai" + i + ".png"));
  }

  img1 = loadImage("assets/1.png");
  img2 = loadImage("assets/2.png");
  img3 = loadImage("assets/3.png");
  img4 = loadImage("assets/4.png");
  img5 = loadImage("assets/5.png");
}

function setup() {
  // 收益完全取决于实际屏幕的 devicePixelRatio，见顶部 CANVAS_PIXEL_DENSITY 注释。
  // 若展览机 devicePixelRatio 为 1，这行不产生任何效果（也无害）。
  pixelDensity(CANVAS_PIXEL_DENSITY);

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  colorMode(HSB);
  imageMode(CORNER);

  // Precompute the static noise field once instead of recalculating thousands
  // of noise() + color() calls every frame.
  createBGStarPositions();

  mic = new p5.AudioIn();
  mic.start();

  // These values were previously being set every draw() frame.
  secondSound.setVolume(1.2);
  B.setVolume(0.6);
  C.setVolume(0.6);
  E.setVolume(0.6);
  G.setVolume(0.6);
  B8va.setVolume(0.6);
  C8va.setVolume(0.6);
  E8va.setVolume(0.6);
  G8va.setVolume(0.6);

  // 轨道上星星冒出的过程
  setInterval(function () {
    if (railStarLoc > -55 + 416.5 && exusiaiY >= height) {
      railStars.push(new RailStar(railStarLoc, 0.5, 0));
      railStarLoc -= 0.6;
    }
  }, 10);

  timePoint = millis();
  setInterval(function () {
    if (exusiaiY >= height && railStarLoc >= -55 + 416.5) {
      secondSound.play();
    }
  }, 180);

  // 注意：这个 interval 的条件在 railStarLoc 走完后永久为真，会一直跑到页面关闭。
  // 原先的 secondSound.play() 每次都会新分配一条 counter buffer + 一个
  // 永不自我终止的 AudioWorkletNode，是无人互动时唯一持续增长的内存来源。
  setInterval(function () {
    if (railStarLoc < -55 + 416.5) {
      playOneShot(secondSound, 1.2);
    }
  }, 1060);

  // HandPose does not need a full-window camera texture. 640x480 preserves
  // the original 4:3 coordinate system; mapHandPoint() scales results back.
  video = createCapture(VIDEO, { flipped: true });
  video.size(HAND_W, HAND_H);
  video.hide();

  handPose.detectStart(video, gotHands);

  // Installation failsafe: after 4h, reload only when nobody has been seen
  // for at least 30s. A full reload reliably releases JS/TFJS/WebGL/video state.
  if (ENABLE_KIOSK_FAILSAFE) {
    setInterval(kioskFailsafeCheck, KIOSK_CHECK_MS);
  }

  p5.disableFriendlyErrors = true;
}

function draw() {
  background(220, 88, 11);

  vol = mic.getLevel();
  let VOL_THRESHOLD = 0.15;

  // animation
  if (exusiaiY < height) {
    if (millis() - timePoint > timeSlot && secondSoundSet == false) {
      secondSound.play();
      timePoint = millis();
      timeSlot -= 86;
      secondSoundSet = true;
    }

    if (secondSound.isPlaying() == false && millis() - timePoint <= timeSlot) {
      secondSoundSet = false;
    }

    if (frameCount % 30 == 0) {
      curImage = (curImage + 1) % exusiais.length;
    }

    exusiaiDelY *= 1.02;
    exusiaiY += exusiaiDelY;

    image(
      exusiais[curImage],
      width - height / exusiais[curImage].height * exusiais[curImage].width,
      exusiaiY,
      height / exusiais[curImage].height * exusiais[curImage].width,
      height
    );
  } else {
    // 能天使出屏幕后
    if (railStarLoc > -55 + 416.5) {
      if (railStarLoc <= 330 + 416.5) {
        if (B.isPlaying() == false && railStarLoc > 250 + 416.5) B.play();
        tintA1 += 0.03;
        tint(100, tintA1);
        image(img1, width * 5 / 9, 0, width * 4 / 9, width * 4 / 9 * img1.height / img1.width);
      }

      if (railStarLoc <= 250 + 416.5) {
        if (C.isPlaying() == false && railStarLoc > 180 + 416.5) C.play();
        tintA2 += 0.03;
        tint(100, tintA2);
        image(img2, width / 4, 0, width * 3 / 5 - width / 4, (width * 3 / 5 - width / 4) * img2.height / img2.width);
      }

      if (railStarLoc <= 180 + 416.5) {
        if (E.isPlaying() == false && railStarLoc > 110 + 416.5) E.play();
        tintA3 += 0.03;
        tint(100, tintA3);
        image(img3, width * 5 / 9, height - (width * 4 / 5 - width * 5 / 9) * img3.height / img3.width, width * 4 / 5 - width * 5 / 9, (width * 4 / 5 - width * 5 / 9) * img3.height / img3.width);
      }

      if (railStarLoc <= 110 + 416.5) {
        if (G.isPlaying() == false && railStarLoc > 40 + 416.5) G.play();
        tintA4 += 0.03;
        tint(100, tintA4);
        image(img4, width / 7, height - (width * 2 / 3 - width / 7) * img4.height / img4.width, width * 2 / 3 - width / 7, (width * 2 / 3 - width / 7) * img4.height / img4.width);
      }

      if (railStarLoc <= 40 + 416.5) {
        tintA5 += 0.03;
        tint(100, tintA5);
        image(img5, width * 2 / 3, height - (width * 99 / 100 - width * 2 / 3) * img5.height / img5.width, width * 99 / 100 - width * 2 / 3, (width * 99 / 100 - width * 2 / 3) * img5.height / img5.width);
      }
    } else if (interactionStart == false) {
      if (B.isPlaying()) B.stop();
      if (C.isPlaying()) C.stop();
      if (E.isPlaying()) E.stop();
      tintA1 = 0;
      tintA2 = 0;
      tintA3 = 0;
      tintA4 = 0;
    }

    // Use totalStarsCreated for sequence state so trimming old visual stars
    // does not alter the original 16-step music/image logic.
    if (stars.length > 0 && interactionStart == true) {
      if (totalStarsCreated % 16 == 4 && tintA1 <= 1 && A1show == false) tintA1 += 0.03;
      if (totalStarsCreated % 16 == 8 && tintA2 <= 1 && A2show == false) tintA2 += 0.03;
      if (totalStarsCreated % 16 == 12 && tintA3 <= 1 && A3show == false) tintA3 += 0.03;
      if (totalStarsCreated % 16 == 0 && tintA4 <= 1 && A4show == false) tintA4 += 0.03;

      if (tintA1 > 1) A1show = true;
      if (tintA2 > 1) A2show = true;
      if (tintA3 > 1) A3show = true;
      if (tintA4 > 1) A4show = true;

      if (tintA1 > 0 && A1show == true) {
        tintA1 -= 0.01;
        tint(100, tintA1);
        image(img1, width * 5 / 9, 0, width * 4 / 9, width * 4 / 9 * img1.height / img1.width);
      }
      if (tintA2 > 0 && A2show == true) {
        tintA2 -= 0.01;
        tint(100, tintA2);
        image(img2, width / 4, 0, width * 3 / 5 - width / 4, (width * 3 / 5 - width / 4) * img2.height / img2.width);
      }
      if (tintA3 > 0 && A3show == true) {
        tintA3 -= 0.01;
        tint(100, tintA3);
        image(img3, width * 5 / 9, height - (width * 4 / 5 - width * 5 / 9) * img3.height / img3.width, width * 4 / 5 - width * 5 / 9, (width * 4 / 5 - width * 5 / 9) * img3.height / img3.width);
      }
      if (tintA4 > 0 && A4show == true) {
        tintA4 -= 0.01;
        tint(100, tintA4);
        image(img4, width / 7, height - (width * 2 / 3 - width / 7) * img4.height / img4.width, width * 2 / 3 - width / 7, (width * 2 / 3 - width / 7) * img4.height / img4.width);
      }

      if (tintA1 < 0 && totalStarsCreated % 16 != 4) A1show = false;
      if (tintA2 < 0 && totalStarsCreated % 16 != 8) A2show = false;
      if (tintA3 < 0 && totalStarsCreated % 16 != 12) A3show = false;
      if (tintA4 < 0 && totalStarsCreated % 16 != 0) A4show = false;
    }
  }

  // Current star colour follows the original creation sequence, not the
  // capped visual array length.
  if (totalStarsCreated % 4 == 0) {
    starCol = 202;
    starSatu = 68;
    starBri = 94;
  } else if (totalStarsCreated % 4 == 1) {
    starCol = 71;
    starSatu = 76;
    starBri = 88;
  } else if (totalStarsCreated % 4 == 2) {
    starCol = 49;
    starSatu = 62;
    starBri = 100;
  } else {
    starCol = 0;
    starSatu = 48;
    starBri = 95;
  }

  // bg rail stars
  for (let i = 0; i < railStars.length; i++) {
    railStars[i].display();
  }

  if (railStarLoc <= -55 + 416.5) {
    // bg tiny stars: coordinates/noise are now precomputed once.
    push();
    translate(width, height / 2);
    rotate(frameCount / 3200);
    fill(233, 20, 80, 0.38);
    noStroke();
    for (let i = 0; i < bgStarPositions.length; i += 2) {
      rect(bgStarPositions[i], bgStarPositions[i + 1], 2, 2);
    }
    pop();

    fill("white");
    textSize(20);
    textFont("Courier New");
    text("cam: 👌(pinch index finger & thumb) + 🤚(release) = ⭐", 22, 37);
    text("mic: 🔊++ = ?", 22, 67);

    if (interactionStart == false) {
      railStars = [];
      for (let loc = 0; loc < 4800; loc += 2.5) {
        railStars.push(new RailStar(loc, 0.55, loc));
      }
      for (let loc = 0; loc < 4800; loc += 0.75) {
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
    cirA -= 0.02;
    cirR += 39;
    if (cirA <= 0) cirR = 0;

    // 过大声音
    if (vol - pvol > VOL_THRESHOLD) {
      let speedBoost = map(vol - pvol + VOL_THRESHOLD, 0, 0.1, 1, 4);
      for (let i = 0; i < bgRailStars.length; i++) bgRailStars[i].dx *= speedBoost;
      for (let i = 0; i < railStars.length; i++) railStars[i].dx *= speedBoost;
      for (let i = 0; i < stars.length; i++) stars[i].dx *= speedBoost;
    } else {
      for (let i = 0; i < bgRailStars.length; i++) bgRailStars[i].dx = bgRailStars[i].dxSave;
      for (let i = 0; i < railStars.length; i++) railStars[i].dx = railStars[i].dxSave;
      for (let i = 0; i < stars.length; i++) stars[i].dx = stars[i].dxSave;
    }
  }

  pvol = vol;

  // ml5 & draw stars
  if (hands.length > 0 && interactionStart == true) {
    for (let i = 0; i < hands.length; i++) {
      // Scale the 640x480 HandPose coordinates into exactly the same coordinate
      // system the old full-width 4:3 capture used.
      let indexFinger = mapHandPoint(hands[i].index_finger_tip);
      let thumb = mapHandPoint(hands[i].thumb_tip);
      let indexFingerB = mapHandPoint(hands[i].index_finger_mcp);
      let thumbB = mapHandPoint(hands[i].thumb_mcp);

      let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

      let centerX = (indexFinger.x + thumb.x) / 2;
      let centerY = (indexFinger.y + thumb.y) / 2;
      let bottomX = (indexFingerB.x + thumbB.x) / 2;
      let bottomY = (indexFingerB.y + thumbB.y) / 2;

      let fingerAngle = atan2(centerY - bottomY, centerX - bottomX);

      let s = map(vol, 0, 0.7, 8, 16);
      if (vol > 0.7) s = 16;

      stroke("#ffffff56");
      fill("#ffffff46");
      circle(indexFinger.x, indexFinger.y, 18);
      circle(thumb.x, thumb.y, 18);

      if (distance < PINCH_DISTANCE_THRESHOLD) {
        starCreatedBooleans[i] = false;
        noStroke();
        fill(starCol, starSatu, starBri);
        rect(centerX - s / 2, centerY - s / 2, s, s);
      } else {
        if (starCreatedBooleans[i] == false) {
          stars.push(new Star(centerX, centerY, starCol, starSatu, starBri, s, fingerAngle, centerX, bottomX));
          totalStarsCreated++;
          lastInteractionAt = Date.now();

          // Bound long-term memory and per-frame update cost. Sequence state is
          // maintained by totalStarsCreated, so sound/colour logic is unchanged.
          if (stars.length > MAX_STARS) {
            stars.splice(0, stars.length - MAX_STARS);
          }

          pinchXs[i] = centerX;
          pinchYs[i] = centerY;
          pinchRs[i] = 0;
          pinchAs[i] = 0.3;
          pinchCols[i] = starCol;
          pinchSatus[i] = starSatu - 20;

          // 互动期的音高全部走 playOneShot：这是触发最频繁的路径，
          // B/C/E/G 每次 .play() 原本要分配约 1 MB 并跑 26 万次循环赋值，
          // 也是「捏一下掉一帧」的原因。
          if (totalStarsCreated % 16 == 1 || totalStarsCreated % 16 == 5 || totalStarsCreated % 16 == 9) {
            playOneShot(B, 0.6);
          } else if (totalStarsCreated % 16 == 2 || totalStarsCreated % 16 == 6 || totalStarsCreated % 16 == 10) {
            playOneShot(C, 0.6);
          } else if (totalStarsCreated % 16 == 3 || totalStarsCreated % 16 == 7 || totalStarsCreated % 16 == 11) {
            playOneShot(E, 0.6);
          } else if (totalStarsCreated % 16 == 4 || totalStarsCreated % 16 == 8 || totalStarsCreated % 16 == 12) {
            playOneShot(G, 0.6);
          } else if (totalStarsCreated % 16 == 13) {
            playOneShot(B8va, 0.6);
          } else if (totalStarsCreated % 16 == 14) {
            playOneShot(C8va, 0.6);
          } else if (totalStarsCreated % 16 == 15) {
            playOneShot(E8va, 0.6);
          } else {
            playOneShot(G8va, 0.6);
          }

          starCreatedBooleans[i] = true;
        }

        if (starCreatedBooleans[i] == true) {
          noStroke();
          pinchAs[i] -= 0.008;
          pinchRs[i] += 9;
          fill(pinchCols[i], pinchSatus[i], 100, pinchAs[i]);
          circle(pinchXs[i], pinchYs[i], pinchRs[i]);
        }
      }
    }
  }

  // draw front stars
  for (let i = 0; i < stars.length; i++) {
    stars[i].display();
    stars[i].update();
  }
}

class Star {
  constructor(x, y, col, satu, bri, s, angle, cx, bx) {
    this.x = x;
    this.y = y;
    this.xSave = x;
    this.ySave = y;
    this.dx = map(noise(frameCount), 0, 1, -height * 0.03, height * 0.07);
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
    this.cx = cx;
    this.bx = bx;

    // ⚠️ 已知 bug，刻意保留：this.s 要到本段末尾才赋值（见下方 this.s = s），
    // 此处恒为 undefined，所有比较均为 false，每颗星星都落入最后的 else 分支。
    // 结果是 railR 只会取到 1.45 / 1.74，内侧三条轨道实际不会有前景星，
    // 「星星越大轨道越外」的设计从未生效。
    // 这里不修，是为了不改变现有视觉。若要真正启用，把下方的 this.s = s 移到本行之前。
    if (this.s < 11) {
      this.choice = random(15.1);
      if (this.choice < 4) {
        this.railR = 0.8;
      } else if (this.choice >= 4 && this.choice < 9) {
        this.railR = 1.0;
      } else {
        this.railR = 1.22;
      }
    } else if (this.s < 14) {
      this.choice = random(18.3);
      if (this.choice < 5) {
        this.railR = 1.0;
      } else if (this.choice >= 5 && this.choice < 11.1) {
        this.railR = 1.22;
      } else {
        this.railR = 1.45;
      }
    } else if (this.s < 17) {
      this.choice = random(22);
      if (this.choice < 6.1) {
        this.railR = 1.22;
      } else if (this.choice >= 6.1 && this.choice < 13.3) {
        this.railR = 1.45;
      } else {
        this.railR = 1.74;
      }
    } else {
      this.choice = random(15.9);
      if (this.choice < 7.2) {
        this.railR = 1.45;
      } else {
        this.railR = 1.74;
      }
    }

    this.trackR = this.railR * height + this.dx;
    this.rotateDeg = 0;

    this.s = s;
    this.sSave = s;
    this.loc = frameCount;
    this.dRad = 0;
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
    rect(-this.s / 2, -this.s / 2, this.s, this.s);
    pop();
  }

  update() {
    if (frameCount - this.loc > 7200 && this.rotateDeg > -10) {
      this.rotateDeg = 0;
    } else {
      this.rotateDeg = (
        this.rotateDeg -
        map(this.trackR, 0.78 * height, 1.81 * height, 1 / 0.12, 1 / 0.08) *
          1 / ((frameCount - this.loc + 300) / 300)
      ) % 360;
    }

    this.satu = lerp(this.satu, map(abs(this.dx), 0, height * 0.18, 10, -5), 0.00052);
    this.alp = lerp(this.alp, map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8), 0.00052);

    if (abs(this.satu - map(abs(this.dx), 0, height * 0.18, 10, -5)) <= 0.1) {
      this.satu = map(abs(this.dx), 0, height * 0.18, 10, -5);
    }
    if (abs(this.alp - map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8)) <= 0.1) {
      this.alp = map(abs(this.dx), 0, height * 0.18, 0.55, 0.55 / 8);
    }

    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20;
    }

    this.s = map(this.trackY, -this.sSave * 10, height + this.sSave * 10, this.sSave - 4, this.sSave + 5);
    if (this.trackY > height + this.s * 10 || this.trackX > width) {
      this.s = this.sSave + 5;
    }

    if (this.y > height + this.s * 10 && this.x < width && this.inTrack == true) {
      this.dRad += PI * 1.14 * (this.railR + this.dx / height) ** 0.46;
    }

    if (this.inTrack == false) {
      if (this.cx > this.bx) {
        this.trackX = lerp(
          this.xSave + height * 0.38 / ((1 + tan(this.pinchAngle) ** 2) ** 0.5),
          this.trackR * sin((frameCount - this.loc) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width,
          0.3
        );
        this.trackY = lerp(
          this.ySave + height * 0.38 * tan(this.pinchAngle) / ((1 + tan(this.pinchAngle) ** 2) ** 0.5),
          this.trackR * cos((frameCount - this.loc) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880,
          0.3
        );
      } else {
        this.trackX = lerp(
          this.xSave - height * 0.38 / ((1 + tan(this.pinchAngle) ** 2) ** 0.5),
          this.trackR * sin((frameCount - this.loc) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width,
          0.3
        );
        this.trackY = lerp(
          this.ySave - height * 0.38 * tan(this.pinchAngle) / ((1 + tan(this.pinchAngle) ** 2) ** 0.5),
          this.trackR * cos((frameCount - this.loc) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880,
          0.3
        );
      }

      if (frameCount - this.loc >= 60) this.inTrack = true;
      this.x = lerp(this.x, this.trackX, 0.06);
      this.y = lerp(this.y, this.trackY, 0.06);
    } else {
      this.inTrack = true;
      this.trackX = this.trackR * sin((frameCount - this.loc - 5) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width;
      this.trackY = this.trackR * cos((frameCount - this.loc - 5) / 400 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880;
      this.x = lerp(this.x, this.trackX, 0.02);
      this.y = lerp(this.y, this.trackY, 0.02);
    }
  }
}

class RailStar {
  constructor(loc, maxA, i) {
    this.dx = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18);
    this.dxSave = map(noise(frameCount + i), 0, 1, -height * 0.18, height * 0.18);
    this.col = color(233, map(abs(this.dx), 0, height * 0.18, 10, -5), 100, map(abs(this.dx), 0, height * 0.18, maxA, maxA / 8));

    this.choice = random(31);
    if (this.choice < 4) {
      this.railR = 0.8;
    } else if (this.choice >= 4 && this.choice < 9) {
      this.railR = 1.0;
    } else if (this.choice >= 9 && this.choice < 15.1) {
      this.railR = 1.22;
    } else if (this.choice >= 15.1 && this.choice < 22.3) {
      this.railR = 1.45;
    } else {
      this.railR = 1.74;
    }

    this.trackR = this.railR * height + this.dx;
    this.loc = loc;
    this.dRad = 0;

    this.x = this.trackR * sin((frameCount - this.loc) / 350 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + width;
    this.y = this.trackR * cos((frameCount - this.loc) / 350 / this.railR ** 1.39 - 4 * PI / 5 + this.dRad) + height + (this.trackR - this.dx) ** 1.855 / 880;
    this.s = 10;
  }

  display() {
    if (this.x > width + this.s * 10 && this.y > height + this.s * 10) {
      return;
    }
    fill(this.col);
    noStroke();
    rect(this.x - this.s / 2, this.y - this.s / 2, this.s, this.s);
  }

  update() {
    if ((this.dx > 0 && this.dx > this.dxSave * 20) || (this.dx < 0 && this.dx < this.dxSave * 20)) {
      this.dx = this.dxSave * 20;
    }

    this.s = map(this.y, -this.s * 10, height + this.s * 10, 6, 15);
    if (this.y > height + this.s * 10 || this.trackX > width) {
      this.s = 15;
    }

    this.trackX = this.trackR * sin((frameCount - this.loc) / 350 / this.railR ** 1.39 - 4 * PI / 5) + width;
    this.trackY = this.trackR * cos((frameCount - this.loc) / 350 / this.railR ** 1.39 - 4 * PI / 5) + height + (this.trackR - this.dx) ** 1.855 / 880;
    this.x = lerp(this.x, this.trackX, 0.08);
    this.y = lerp(this.y, this.trackY, 0.08);
  }
}

function gotHands(results) {
  hands = results;
  if (results.length > 0) {
    lastInteractionAt = Date.now();

    // 首次检测到手时打印一次，用来确定 HAND_COORD_SOURCE 该填哪个值。
    if (DEBUG_HAND_COORDS && !handCoordLogged) {
      handCoordLogged = true;
      const tipX = results[0].index_finger_tip.x;
      console.log(
        "[handpose] tipX =", tipX.toFixed(1),
        "| video.width =", video.width,
        "| video.elt.videoWidth =", video.elt.videoWidth
      );
      console.log(
        "[handpose] 手在画面中央时，tipX 接近 video.width 的一半 -> HAND_COORD_SOURCE = \"element\"；" +
        "接近 videoWidth 的一半 -> 改成 \"intrinsic\"。"
      );
    }
  }
}

// 把 handPose 的坐标还原到原版「摄像头铺满窗口宽度、4:3」的坐标系。
// 原版 video.size(windowWidth, windowWidth * 480 / 640)，x 和 y 用的是同一个
// 基于宽度的比例，所以这里两轴共用一个 scale。
function handSourceWidth() {
  if (HAND_COORD_SOURCE === "intrinsic") {
    return (video && video.elt && video.elt.videoWidth) || HAND_W;
  }
  return HAND_W;
}

function mapHandPoint(point) {
  const scale = width / handSourceWidth();
  return {
    x: point.x * scale,
    y: point.y * scale
  };
}

// 一次性触发播放，绕开 p5.SoundFile.play()。
//
// p5.sound 的 play() 内部每次都会调 _createCounterBuffer()，新分配一条与音频
// 等长的 Float32 AudioBuffer 并用 JS 循环逐样本赋值（B/C/E/G 约 1 MB、26 万次
// 循环），同时 new 一个 AudioWorkletNode，而其 process() 无条件 return true，
// 永不自我终止。长时间运行下这是主要的内存增长源。
//
// 这里直接复用 p5 已经解码好的 sf.buffer，每次触发只有两个轻量节点，
// 播完即 disconnect。
function playOneShot(sf, vol = 0.6) {
  if (!sf || !sf.buffer) return;
  const ctx = getAudioContext();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = sf.buffer;
  gain.gain.value = vol;
  src.connect(gain).connect(ctx.destination);
  src.onended = () => {
    src.disconnect();
    gain.disconnect();
  };
  src.start();
}

function createBGStarPositions() {
  bgStarPositions = [];
  const dis = width / 39;
  const diagonal = sqrt(width ** 2 + height ** 2);

  for (let x = -diagonal; x < diagonal; x += dis) {
    for (let y = -diagonal; y < diagonal; y += dis) {
      const jx = noise(x * 0.3, y * 0.3) * dis * 5;
      const jy = noise(x * 0.3 + 200, y * 0.3 + 200) * dis * 5;
      bgStarPositions.push(x + jx - 1, y + jy - 1);
    }
  }
}

function kioskFailsafeCheck() {
  const now = Date.now();
  const runtime = now - pageStartedAt;
  const idle = now - lastInteractionAt;

  if (runtime >= KIOSK_RELOAD_AFTER_MS && idle >= KIOSK_IDLE_MS) {
    try {
      if (handPose && typeof handPose.detectStop === "function") {
        handPose.detectStop();
      }
    } catch (e) {
      console.warn("[kiosk] detectStop 失败，仍继续重启：", e);
    }
    // 给检测循环一点时间停下来再硬重置。
    setTimeout(() => location.reload(), 150);
  }
}

function drawRails() {
  noFill();
  stroke("#ffffff1f");
  strokeWeight(1);
  for (let i = 0; i < railRs.length; i++) {
    circle(width, height + (railRs[i] * height) ** 1.855 / 880, railRs[i] * height * 2);
  }
}


// 1) 确认像素密度
//    控制台跑 window.devicePixelRatio。
//    返回 1 -> CANVAS_PIXEL_DENSITY = 1 本来就是空操作，留着即可。
//    返回 2+ -> 保持 1 性能收益明显，但背景星和提示文字会发虚，觉得糊改 1.5。
//
// 2) 长跑验证
//    Chrome DevTools -> More tools -> Performance monitor，看 JS heap size / CPU / DOM nodes，
//    跑 30 分钟以上。heap 会随 GC 上下波动，看的是每次 GC 之后的基线是否还在往上爬。
//    若 heap 基线已平、但任务管理器里的内存仍在涨，说明还有 .play() 没换成 playOneShot
//    （Web Audio 的内存不计入 JS heap，只能这样交叉判断）。