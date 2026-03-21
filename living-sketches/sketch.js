let timeTook = false;
let pressTime;
let curImage = 0;
let jumpImg;

let ground = [];
let fly = [];

function preload() {
  spinSound = loadSound("sounds/木头咚.wav");
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
  imageMode(CENTER);

  if (mouseIsPressed == false) {
    timeTook = false;
    cursor("pointer");
    tint(360, 100, 100, 1);
    image(ground[curImage], width / 2, height / 2, width, height);
    if (frameCount % 9 == 0) {
      curImage = (curImage + 1) % ground.length;
    }
  } else {
    cursor("default");
    spinSound.setVolume(map(mouseY, 0, height, 1, 0))
    if (frameCount % 3 == 0) {
      curImage = (curImage + 1) % ground.length;
      spinSound.play();
    }
    if (millis() - pressTime < 50) {
      image(jumpImg, width / 2, height / 2 - height / 25, width, height);
      image(ground[curImage], width / 2, height / 2, width, height);
    } else if (millis() - pressTime >= 50 && millis() - pressTime < 100) {
      image(jumpImg, width / 2, height / 2 - height / 6, width, height);
      image(ground[curImage], width / 2, height / 2, width, height);
    } else {
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
      tint(360, 100, 100, 1);
      image(ground[curImage], mouseX, height / 2, width, height);
    }
    tint(178, 40, 100, 1);
  }

  // imageMode(CORNER);
}
