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
  colorMode(HSB);
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

  if (mouseIsPressed == false) {
    timeTook = false;
    cursor("pointer");
    tint(360, 100, 100, 1);
    if (frameCount % 9 == 0) {
      curImage = (curImage + 1) % ground.length;
    }
  } else {
    cursor("default");
    if (frameCount % 3 == 0) {
      curImage = (curImage + 1) % ground.length;
    }
    if (millis() - pressTime < 50) {
      image(jumpImg, 0, -fly[curImage].width / 25, width, height);
    } else if (millis() - pressTime >= 50 && millis() - pressTime < 100) {
      image(jumpImg, 0, -fly[curImage].width / 9, width, height);
    } else {
      imageMode(CENTER);
      let h = map(mouseX, 0, width, 0, 360 * 3) % 360;
      let s = map(mouseY, 0, height, 100, 0);
      let a = s / 100;
      tint(h, s, 100, a);
      image(
        fly[curImage],
        mouseX + fly[curImage].width / 100,
        mouseY + fly[curImage].width / 25,
        width,
        height
      );
    }
    tint(178, 40, 100, 1);
  }

  imageMode(CORNER);
  image(ground[curImage], 0, 0, width, height);
}