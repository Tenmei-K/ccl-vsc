/*
let scanned = [];
let eyes;
let rockets;
let doodles1;
let doodles2;

let curEye = 0;
let curRocket = 0;
let rocketY = 500;
let rocketSpeedY = 0;
let curDoodle1 = 0;
let curDoodle2 = 0;

function preload() {
  for (let i = 1; i <= 6; i++) {
    scanned.push(loadImage("20260311120631-" + i + ".jpg"));
  }
}

function setup() {
  createCanvas(800, 500);

  eraseBg(scanned, 10);
  eyes = crop(scanned, 0, 0, 585, 356);
  rockets = crop(scanned, 1600, 90, 650, 420);
  doodles1 = crop(scanned, 1514, 1300, 830, 300);
  doodles2 = crop(scanned, 100, 1300, 366, 311);
}

function draw() {
  background(255);

  // examples: eye

  image(
    eyes[curEye],
    mouseX,
    mouseY,
    eyes[0].width * 0.25,
    eyes[0].height * 0.25
  );

  curEye = floor((frameCount / 20) % eyes.length);

  // rocket

  push();
  translate(width / 2, rocketY);
  rotate(radians(-90));
  imageMode(CENTER);
  image(
    rockets[curRocket],
    0,
    0,
    rockets[0].width * 0.25,
    rockets[0].height * 0.25
  );
  pop();

  // rocket animation only has 4 frames
  curRocket = floor((frameCount / 10) % 4);

  rocketY += rocketSpeedY;
  rocketSpeedY += -0.1;
  if (rocketY < -100) {
    rocketY = 500;
    rocketSpeedY = 0;
  }

  // doodles, using sin()

  image(
    doodles1[curDoodle1],
    0,
    0,
    doodles1[0].width * 0.5,
    doodles1[0].height * 0.5
  );

  curDoodle1 = floor(map(sin(frameCount / 10), -1, 1, 0, doodles1.length));

  image(
    doodles2[curDoodle2],
    400,
    300,
    doodles2[0].width * 0.5,
    doodles2[0].height * 0.5
  );

  let d = dist(mouseX, mouseY, 485, 355);
  if (d < 100) {
    curDoodle2 = floor(map(sin(frameCount / 10), -1, 1, 0, doodles2.length));
  }
}

// You shouldn't need to modify these helper functions:

function crop(imgs, x, y, w, h) {
  let cropped = [];
  for (let i = 0; i < imgs.length; i++) {
    cropped.push(imgs[i].get(x, y, w, h));
  }
  return cropped;
}

function eraseBg(imgs, threshold = 10) {
  for (let i = 0; i < imgs.length; i++) {
    let img = imgs[i];
    img.loadPixels();
    for (let j = 0; j < img.pixels.length; j += 4) {
      let d = 255 - img.pixels[j];
      d += 255 - img.pixels[j + 1];
      d += 255 - img.pixels[j + 2];
      if (d < threshold) {
        img.pixels[j + 3] = 0;
      }
    }
    img.updatePixels();
  }
  // this function uses the pixels array
  // we will cover this later in the semester - stay tuned
}
*/
let timeTook = false;
let pressTime;
let curImage = 0;
let jumpImg;

let ground = [];
let fly = [];

function preload() {
  jumpImg = loadImage("assets/jump.png");

  for (let i = 0; i < 4; i++) {
    let groundName = "assets/ground" + i + ".png";
    let groundImg = loadImage(groundName);
    ground.push(groundImg);

    let flyName = "assets/fly" + i + ".png";
    let flyImg = loadImage(flyName);
    fly.push(flyImg);
  }
}

function setup() {
  createCanvas(400, 400);
}

function mousePressed() {
  if (timeTook == false) {
    pressTime = millis();
    console.log(pressTime);
    timeTook = true;
  }
}

function draw() {
  background(255);
  imageMode(CORNER);
  image(ground[curImage], 0, 0, width, height);
  if (mouseIsPressed == false) {
    timeTook = false;
    cursor("pointer");
    if (frameCount % 10 == 0) {
      curImage = (curImage + 1) % ground.length;
    }
  } else {
    cursor("default");
    if (frameCount % 3 == 0) {
      curImage = (curImage + 1) % ground.length;
    }
    if (millis() - pressTime < 100) {
      image(jumpImg, 0, - fly[curImage].width / 25, width, height);
    } else {
      imageMode(CENTER);
      image(fly[curImage], mouseX + fly[curImage].width / 50, mouseY + fly[curImage].width / 25, width, height);
    }
  }
}
