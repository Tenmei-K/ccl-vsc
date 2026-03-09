/*
Template for IMA's Creative Coding Lab 

Project A: Generative Creatures
CCLaboratories Biodiversity Atlas 
*/

/*
// canvas区别
let canvas = createCanvas(800, 500);
canvas.parent("p5-canvas-container");
*/


let s = 25; // 背景切分正方形边长
let delx; // x向斜线间隔
let dely; // y向斜线间隔
let a;
let d; // 斜杠中点到鼠标的距离
let r = 0; // 鼠标让slash位移
let r1 = 0; // creature 1让slash位移
let r2 = 0; // creature 2让slash位移
let bgH; // 背景颜色h起点

let rotateRad; // 斜线旋转角度

// click
let pressX;
let pressY;
let releaseX;
let releaseY;

// boolean
let observe = true;
let feed = false;
let feedClicked = false;
let foodPlaced = false;
let feed1 = false; // creature 1吃到食物
let feed2 = false; // creature 2吃到食物
let call = false;
let leave = false;

// bump
let beforeBump = false; // 互冲boolean
let bump = false;
let bumped = false;
let bumpCounter = 0;
let bumpTime; // 记录碰撞millis()
let bumpSpeed = 0.0005;

let bumpX, bumpY; // 碰撞点
let bumpDeg = 0; // 碰撞时slash最大旋转角度
let lerpDeg = 0; // 碰撞时slash实时旋转角度

// food
let foodX = 25;
let foodY = 425;
let foodDeg = 0;
let foodH;
let fedTime;
let feedDeg1 = 0;
let feedDeg2 = 0;

let feedCounter = 0;

// call
let callX = 25;
let callY = 470;
let callH;
let callA = 1;
let callD = 20;

// leave
let leaveTime;

// creature 1
let circleX1, circleY1; // 生物位置
let circleD11 = 0; // 第一信号直径
let circleD12 = 0; // 第二信号直径
let circleS11 = 1; // 第一信号透明度
let circleS12 = 1; // 第二信号透明度
let circle11Show = true; // 第一信号显示boolean
let circle12Show = true; // 第二信号显示boolean
let targetX1, targetY1; // 前往位置
// creature 2
let circleX2, circleY2;
let circleD21 = 0;
let circleD22 = 0;
let circleS21 = 0.9;
let circleS22 = 0.9;
let circle21Show = true;
let circle22Show = true;
let targetX2, targetY2;

let creature2show = false;
let creature2showTime;

// cursor booleans
let aboveFeed;
let aboveCall;

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.parent("p5-canvas-container");
    frameRate(60);
    colorMode(HSB);
    delx = random(20, 25);
    dely = random(25, 30);

    ranH = random(180, 200);

    rotateRad = random(1, 4) / 12;

    circleX1 = width / 2;
    circleY1 = height / 2;
    targetX1 = random(0, width);
    targetY1 = random(0, height);

    circleX2 = width / 2;
    circleY2 = height / 2;
    targetX2 = random(0, width);
    targetY2 = random(0, height);

    foodH = (ranH + 120) % 360;
    callH = (ranH + 240) % 360;
}

function mousePressed() {
    // 保存press时x, y
    pressX = mouseX;
    pressY = mouseY;
    console.log("press:", pressX, pressY);

    if (
        pressX > 0 &&
        pressX < 50 &&
        pressY > 410 &&
        pressY < 445 &&
        feed == false &&
        (feedCounter == 0 || (feedCounter > 0 && millis() - fedTime > 5000)) &&
        call == false &&
        bump == false &&
        feedClicked == false
    ) {
        observe = false;
        feed = true;
        feedClicked = false;
        call = false;
    }
    if (
        pressX > 0 &&
        pressX < 50 &&
        pressY > 455 &&
        pressY < 490 &&
        feed == false &&
        (feedCounter == 0 || (feedCounter > 0 && millis() - fedTime > 5000)) &&
        call == false &&
        bump == false
    ) {
        observe = false;
        feed = false;
        feedClicked = false;
        call = true;
    }
}
function mouseReleased() {
    // 保存release时x, y
    releaseX = mouseX;
    releaseY = mouseY;
    console.log("release:", releaseX, releaseY);

    if (feed == true && feedClicked == false) {
        // foodX = pressX;
        // foodY = pressY;
        feedClicked = true;
    }
}

function mouseClicked() {
    // 【interaction boolean change】
    console.log(
        "observe = " +
        observe +
        " feed = " +
        feed +
        " feedClicked = " +
        feedClicked +
        " call = " +
        call +
        " bump = " +
        bump
    );
}

function draw() {
    // 【cursor】
    if (
        mouseX > 0 &&
        mouseX < 50 &&
        mouseY > 410 &&
        mouseY < 440 &&
        call == false
    ) {
        aboveFeed = true;
    } else {
        aboveFeed = false;
    }
    if (
        mouseX > 0 &&
        mouseX < 50 &&
        mouseY > 460 &&
        mouseY < 490 &&
        feed == false
    ) {
        aboveCall = true;
    } else {
        aboveCall = false;
    }
    if (
        aboveCall == true &&
        call == false &&
        bump == false &&
        (feedCounter == 0 || (feedCounter > 0 && millis() - fedTime > 5000))
    ) {
        cursor("pointer");
    } else if (
        (aboveFeed == true &&
            feed == false &&
            bump == false &&
            (feedCounter == 0 || (feedCounter > 0 && millis() - fedTime > 5000))) ||
        (feed == true && feedClicked == false && bump == false)
    ) {
        cursor("grab");
    } else if (
        (feed == false && millis() - fedTime <= 5000) ||
        call == true ||
        bump == true ||
        leave == true
    ) {
        cursor("default");
    } else {
        cursor("default");
    }

    // 【background】
    for (let x = 0; x <= width / s; x += 1) {
        for (let y = 0; y <= height / s; y += 1) {
            strokeWeight(0);
            bgH = map(
                noise(x / 10 + frameCount / 300, y / 10 + frameCount / 300),
                0,
                1,
                ranH,
                ranH + 35
            );
            fill(bgH, 60, 75);
            rect(x * s, y * s, s, s);
        }
    }

    // 【slashes】

    if (bump == true) {
        lerpDeg = lerp(lerpDeg, 500, 0.01);
    } else {
        lerpDeg = 0;
    }
    strokeWeight(1.6);
    for (let x = -0.1 * width; x < width * 1.1; x += delx) {
        for (let y = -0.1 * height, i = 0; y < height * 1.5; y += dely, i++) {
            stroke(187, 0, 100, a);
            a = 0.4;

            // 受鼠标影响/生物碰撞影响 向下移动距离
            if (call == true) {
                d = dist(mouseX, mouseY, x, y);
                r = map(d, 0, 50, 30, 0);
                if (d > 50) {
                    r = 0;
                }
            } else if (beforeBump == true) {
                r1 = map(dist(circleX1, circleY1, x, y), 0, 50, 50, 0);
                r2 = map(dist(circleX2, circleY2, x, y), 0, 50, 50, 0);
                if (dist(circleX1, circleY1, x, y) > 50) {
                    r1 = 0;
                }
                if (dist(circleX2, circleY2, x, y) > 50) {
                    r2 = 0;
                }
            } else {
                r = 0;
                r1 = 0;
                r2 = 0;
            }

            // bump后爆炸旋转设置
            if (bump == true) {
                if (dist(x, y, bumpX, bumpY) > 150) {
                    bumpDeg = 0;
                } else {
                    bumpDeg = map(dist(x, y, bumpX, bumpY), 0, 150, 495, 0) - lerpDeg;
                    if (bumpDeg < 0) {
                        bumpDeg = 0;
                    }
                }
            } else {
                bumpDeg = 0;
            }

            // default流动效果
            let noiseOrigin = noise(
                x / 50 + frameCount / 300,
                y / 50 + frameCount / 300
            );
            let noiseMap = map(noiseOrigin, 0, 1, -18, 18); // 流动时斜杠上下移动距离
            if (feed == true && feedClicked == true) {
                if (dist(x, y, circleX1, circleY1) > 50) {
                    feedDeg1 = 0;
                } else {
                    feedDeg1 = map(dist(x, y, circleX1, circleY1), 0, 50, PI, 0);
                }
                if (creature2show == false || dist(x, y, circleX2, circleY2) > 50) {
                    feedDeg2 = 0;
                } else {
                    feedDeg2 = map(dist(x, y, circleX2, circleY2), 0, 50, PI, 0);
                }
            }
            if (i % 2 == 0) {
                push();
                translate(x, y);
                rotate(PI * rotateRad + feedDeg1 + feedDeg2 + radians(bumpDeg));
                line(
                    r + r1 + r2 - delx / 2,
                    r + r1 + r2 - dely / 2 + noiseMap,
                    r + r1 + r2 + delx / 2,
                    dely / 2 + r + r1 + r2 + noiseMap
                );
                pop();
            } else {
                push();
                translate(x + (delx * 3) / 4, y);
                rotate(PI * rotateRad + feedDeg1 + feedDeg2 + radians(bumpDeg));
                line(
                    r + r1 + r2 - delx / 2,
                    r + r1 + r2 - dely / 2 + 2 + noiseMap,
                    r + r1 + r2 + delx / 2,
                    dely / 2 + r + r1 + r2 + 2 + noiseMap
                );
                pop();
            }
        }
    }

    // 【food】
    push();
    translate(foodX, foodY);
    rotate(foodDeg);
    strokeWeight(1.5);
    stroke(100, 0, 100, 0.7);
    fill(foodH, 90, 100, 0.75);
    rect(-9, -9, 18, 18);

    if (feed == true) {
        if (mouseIsPressed == true && foodPlaced == false) {
            foodX = mouseX;
            foodY = mouseY;
        }
        if (feedClicked == true) {
            // 松开鼠标后触发
            if (foodPlaced == false) {
                foodX = releaseX;
                foodY = releaseY;
                foodPlaced = true;
                console.log("foodPlaced = " + foodPlaced);
            }
            foodDeg += map(
                dist(foodX, foodY, circleX1, circleY1),
                0,
                50,
                PI / 12,
                PI / 128
            );
            if (dist(foodX, foodY, circleX1, circleY1) > 50) {
                foodDeg = 0;
            }
        }
        if (dist(circleX1, circleY1, foodX, foodY) < 8) {
            feedCounter += 1;
            console.log("feedCounter = " + feedCounter);
            feed1 = true;
            feed2 = false;
            feed = false;
            feedClicked = false;
            foodPlaced = false;
            observe = true;
            foodX = -20;
            foodY = 0;
            foodDeg = 0;
            fedTime = millis();
        } else if (
            dist(circleX2, circleY2, foodX, foodY) < 8 &&
            creature2show == true
        ) {
            feedCounter += 1;
            console.log("feedCounter = " + feedCounter);
            feed1 = false;
            feed2 = true;
            feed = false;
            feedClicked = false;
            foodPlaced = false;
            observe = true;
            foodX = -20;
            foodY = 0;
            foodDeg = 0;
            fedTime = millis();
        }
    } else if (millis() - fedTime <= 5000 || call == true) {
        foodX = -20;
        foodY = 0;
    } else {
        foodX = 25;
        foodY = 425;
    }
    if (millis() - fedTime > 5000) {
        feed1 = false;
        feed2 = false;
    }
    pop();

    // 【call】
    noFill();
    if (feed == true || millis() - fedTime <= 5000) {
        strokeWeight(0);
    } else {
        strokeWeight(2.2);
    }
    stroke(callH, 180, 100, callA);
    circle(callX, callY, callD);

    if (call == true) {
        callX = mouseX;
        callY = mouseY;
        callD += 0.81;
        callA -= 0.003;
    }
    if (callA <= 0) {
        callD = 20;
        callA = 1;
        callX = 25;
        callY = 470;
        observe = true;
        call = false;
    }

    // 【creature】
    if (feedCounter >= 2 && millis() - fedTime > 5000 && creature2show == false) {
        ///////////////////////////////////////////////////////////////////////////////
        creature2show = true;
        creature2showTime = millis();
    }

    // 【creature 1】
    noFill();
    stroke(255);
    noStroke();
    circle(circleX1, circleY1, 10);

    if (beforeBump == true) {
        bumpSpeed += 0.005;
        circleX1 = lerp(circleX1, circleX2, bumpSpeed);
        circleY1 = lerp(circleY1, circleY2, bumpSpeed);
    }
    // movement & interaction
    if (observe == true || leave == true) {
        // step 5% towards the target each frame
        circleX1 = lerp(circleX1, targetX1, 0.05);
        circleY1 = lerp(circleY1, targetY1, 0.05);
        // new target every 160 frames
        if (frameCount % 160 == 159) {
            targetX1 = random(0, width);
            targetY1 = random(0, height);
        }
    }
    if (feed == true) {
        if (feedClicked == false) {
            circleX1 = lerp(circleX1, foodX, 0.003);
            circleY1 = lerp(circleY1, foodY, 0.003);
        }
        if (feedClicked == true) {
            circleX1 = lerp(circleX1, foodX, 0.006);
            circleY1 = lerp(circleY1, foodY, 0.006);
        }
    }
    if (call == true) {
        circleX1 = lerp(circleX1, mouseX, 0.008);
        circleY1 = lerp(circleY1, mouseY, 0.008);
    }
    if (bump == true) {
        circleX1 = lerp(circleX1, targetX1, 0.1);
        circleY1 = lerp(circleY1, targetY1, 0.1);
        if (frameCount % 50 == 0) {
            targetX1 = random(0, width);
            targetY1 = random(0, height);
        }
    }

    // signal 1
    strokeWeight(1);
    if (feed == true) {
        strokeWeight(1);
        if (frameCount % 90 == 1) {
            circle11Show = true;
            circleD11 = 30;
            circleS11 = 1;
        }
        if (circle11Show == true) {
            noFill();
            stroke(100, 0, 100, circleS11);
            circle(circleX1, circleY1, circleD11);
            circleD11 += 5;
            circleS11 -= 0.02;
            if (circleS11 < 0) {
                circle11Show = false;
            }
        }
        if (frameCount % 90 == 10) {
            circle12Show = true;
            circleD12 = 30;
            circleS12 = 1;
        }
        if (circle12Show == true) {
            noFill();
            stroke(100, 0, 100, circleS12);
            circle(circleX1, circleY1, circleD12);
            circleD12 += 5;
            circleS12 -= 0.02;
            if (circleS12 < 0) {
                circle12Show = false;
            }
        }
    } else if (millis() - fedTime <= 5000 && feed1 == true) {
        strokeWeight(2.5);
        if (frameCount % 60 == 1) {
            circle11Show = true;
            circleD11 = 30;
            circleS11 = 1;
        }
        if (circle11Show == true) {
            noFill();
            stroke(foodH, 50, 100, circleS11);
            circle(circleX1, circleY1, circleD11);
            circleD11 += 5;
            circleS11 -= 0.02;
            if (circleS11 < 0) {
                circle11Show = false;
            }
        }
        if (frameCount % 60 == 10) {
            circle12Show = true;
            circleD12 = 30;
            circleS12 = 1;
        }
        if (circle12Show == true) {
            noFill();
            stroke(foodH, 50, 100, circleS12);
            circle(circleX1, circleY1, circleD12);
            circleD12 += 5;
            circleS12 -= 0.02;
            if (circleS12 < 0) {
                circle12Show = false;
            }
        }
    } else if (call == true) {
        strokeWeight(2);
        let callSignalS = map(
            dist(circleX1, circleY1, callX, callY),
            0,
            350,
            80,
            0
        );
        if (dist(circleX1, circleY1, callX, callY) > 350) {
            callSignalS = 0;
        }
        if (frameCount % 75 == 1) {
            circle11Show = true;
            circleD11 = 30;
            circleS11 = 1;
        }
        if (circle11Show == true) {
            noFill();
            stroke(callH, callSignalS, 100, circleS11);
            circle(circleX1, circleY1, circleD11);
            circleD11 += 5;
            circleS11 -= 0.02;
            if (circleS11 < 0) {
                circle11Show = false;
            }
        }
        if (frameCount % 75 == 10) {
            circle12Show = true;
            circleD12 = 30;
            circleS12 = 1;
        }
        if (circle12Show == true) {
            noFill();
            stroke(callH, callSignalS, 100, circleS12);
            circle(circleX1, circleY1, circleD12);
            circleD12 += 5;
            circleS12 -= 0.02;
            if (circleS12 < 0) {
                circle12Show = false;
            }
        }
    } else if (bump == true) {
        strokeWeight(3);
        if (frameCount % 50 == 1) {
            circle11Show = true;
            circleD11 = 30;
            circleS11 = 1;
        }
        if (circle11Show == true) {
            noFill();
            stroke(0, 100, 100, circleS11);
            circle(circleX1, circleY1, circleD11);
            circleD11 += 7;
            circleS11 -= 0.02;
            if (circleS11 < 0) {
                circle11Show = false;
            }
        }
        if (frameCount % 50 == 10) {
            circle12Show = true;
            circleD12 = 30;
            circleS12 = 1;
        }
        if (circle12Show == true) {
            noFill();
            stroke(0, 100, 100, circleS12);
            circle(circleX1, circleY1, circleD12);
            circleD12 += 7;
            circleS12 -= 0.02;
            if (circleS12 < 0) {
                circle12Show = false;
            }
        }
    } else {
        strokeWeight(1);
        if (frameCount % 200 == 1) {
            circle11Show = true;
            circleD11 = 30;
            circleS11 = 1;
        }
        if (circle11Show == true) {
            noFill();
            stroke(100, 0, 100, circleS11);
            circle(circleX1, circleY1, circleD11);
            circleD11 += 5;
            circleS11 -= 0.02;
            if (circleS11 < 0) {
                circle11Show = false;
            }
        }
        if (frameCount % 200 == 10) {
            circle12Show = true;
            circleD12 = 30;
            circleS12 = 1;
        }
        if (circle12Show == true) {
            noFill();
            stroke(100, 0, 100, circleS12);
            circle(circleX1, circleY1, circleD12);
            circleD12 += 5;
            circleS12 -= 0.02;
            if (circleS12 < 0) {
                circle12Show = false;
            }
        }
    }

    // 【creature 2】
    noFill();
    stroke(255);
    noStroke();
    circle(circleX2, circleY2, 10);

    if (creature2show == false) {
        circleX2 = circleX1;
        circleY2 = circleY1;
    } else {
        // movement & interaction
        if (beforeBump == true) {
            circleX2 = lerp(circleX2, circleX1, bumpSpeed);
            circleY2 = lerp(circleY2, circleY1, bumpSpeed);
        } else if (observe == true) {
            // step 5% towards the target each frame
            circleX2 = lerp(circleX2, targetX2, 0.05);
            circleY2 = lerp(circleY2, targetY2, 0.05);
            // new target every 160 frames
            if (frameCount % 160 == 79) {
                targetX2 = random(0, width);
                targetY2 = random(0, height);
            }
        } else if (feed == true) {
            if (feedClicked == false) {
                circleX2 = lerp(circleX2, foodX, 0.003);
                circleY2 = lerp(circleY2, foodY, 0.003);
            }
            if (feedClicked == true) {
                circleX2 = lerp(circleX2, foodX, 0.006);
                circleY2 = lerp(circleY2, foodY, 0.006);
            }
        } else if (call == true) {
            circleX2 = lerp(circleX2, mouseX, 0.008);
            circleY2 = lerp(circleY2, mouseY, 0.008);
        } else if (bump == true) {
            circleX2 = lerp(circleX2, targetX2, 0.1);
            circleY2 = lerp(circleY2, targetY2, 0.1);
            if (frameCount % 80 == 0) {
                targetX2 = random(0, width);
                targetY2 = random(0, height);
            }
        } else if (leave == true) {
            circleX2 = lerp(circleX2, 850, 0.004);
            circleY2 = lerp(circleY2, targetY2, 0.004);
        }
    }

    // signal 2
    strokeWeight(1);
    if (creature2show == false) {
        noStroke();
    } else {
        if (feed == true) {
            strokeWeight(1);
            if (frameCount % 90 == 41) {
                circle21Show = true;
                circleD21 = 30;
                circleS21 = 0.9;
            }
            if (circle21Show == true) {
                noFill();
                stroke(100, 0, 100, circleS21);
                circle(circleX2, circleY2, circleD21);
                circleD21 += 4;
                circleS21 -= 0.021;
                if (circleS21 < 0) {
                    circle21Show = false;
                }
            }
            if (frameCount % 90 == 50) {
                circle22Show = true;
                circleD22 = 30;
                circleS22 = 0.9;
            }
            if (circle22Show == true) {
                noFill();
                stroke(100, 0, 100, circleS22);
                circle(circleX2, circleY2, circleD22);
                circleD22 += 4;
                circleS22 -= 0.021;
                if (circleS22 < 0) {
                    circle22Show = false;
                }
            }
        } else if (millis() - fedTime <= 5000 && feed2 == true) {
            strokeWeight(2.5);
            if (frameCount % 60 == 41) {
                circle21Show = true;
                circleD21 = 30;
                circleS21 = 0.9;
            }
            if (circle21Show == true) {
                noFill();
                stroke(foodH, 50, 100, circleS21);
                circle(circleX2, circleY2, circleD21);
                circleD21 += 4;
                circleS21 -= 0.02;
                if (circleS21 < 0) {
                    circle21Show = false;
                }
            }
            if (frameCount % 60 == 50) {
                circle22Show = true;
                circleD22 = 30;
                circleS22 = 0.9;
            }
            if (circle22Show == true) {
                noFill();
                stroke(foodH, 50, 100, circleS22);
                circle(circleX2, circleY2, circleD22);
                circleD22 += 4;
                circleS22 -= 0.02;
                if (circleS22 < 0) {
                    circle22Show = false;
                }
            }
        } else if (call == true) {
            strokeWeight(2);
            let callSignalS = map(
                dist(circleX2, circleY2, callX, callY),
                0,
                350,
                80,
                0
            );
            if (dist(circleX2, circleY2, callX, callY) > 350) {
                callSignalS = 0;
            }
            if (frameCount % 75 == 41) {
                circle21Show = true;
                circleD21 = 30;
                circleS21 = 0.9;
            }
            if (circle21Show == true) {
                noFill();
                stroke(callH, callSignalS, 100, circleS21);
                circle(circleX2, circleY2, circleD21);
                circleD21 += 4;
                circleS21 -= 0.021;
                if (circleS21 < 0) {
                    circle21Show = false;
                }
            }
            if (frameCount % 75 == 50) {
                circle22Show = true;
                circleD22 = 30;
                circleS22 = 0.9;
            }
            if (circle22Show == true) {
                noFill();
                stroke(callH, callSignalS, 100, circleS22);
                circle(circleX2, circleY2, circleD22);
                circleD22 += 4;
                circleS22 -= 0.021;
                if (circleS22 < 0) {
                    circle22Show = false;
                }
            }
        } else if (bump == true) {
            strokeWeight(1.8);
            if (frameCount % 90 == 11) {
                circle21Show = true;
                circleD21 = 30;
                circleS21 = 0.9;
            }
            if (circle21Show == true) {
                noFill();
                stroke(0, 100, 100, circleS21);
                circle(circleX2, circleY2, circleD21);
                circleD21 += 5;
                circleS21 -= 0.021;
                if (circleS21 < 0) {
                    circle21Show = false;
                }
            }
            if (frameCount % 90 == 20) {
                circle22Show = true;
                circleD22 = 30;
                circleS22 = 0.9;
            }
            if (circle22Show == true) {
                noFill();
                stroke(0, 100, 100, circleS22);
                circle(circleX2, circleY2, circleD22);
                circleD22 += 5;
                circleS22 -= 0.021;
                if (circleS22 < 0) {
                    circle22Show = false;
                }
            }
        } else {
            strokeWeight(1);
            if (frameCount % 200 == 41) {
                circle21Show = true;
                circleD21 = 30;
                circleS21 = 0.9;
            }
            if (circle21Show == true) {
                noFill();

                stroke(100, 0, 100, circleS21);
                circle(circleX2, circleY2, circleD21);
                circleD21 += 4;
                circleS21 -= 0.021;
                if (circleS21 < 0) {
                    circle21Show = false;
                }
            }
            if (frameCount % 200 == 50) {
                circle22Show = true;
                circleD22 = 30;
                circleS22 = 0.9;
            }
            if (circle22Show == true) {
                noFill();

                stroke(100, 0, 100, circleS22);
                circle(circleX2, circleY2, circleD22);
                circleD22 += 4;
                circleS22 -= 0.021;
                if (circleS22 < 0) {
                    circle22Show = false;
                }
            }
        }
    }

    // 【bump】
    if (creature2show == true && millis() - creature2showTime >= 5000) {
        if (
            dist(circleX1, circleY1, circleX2, circleY2) > 600 &&
            beforeBump == false &&
            bump == false &&
            observe == true
        ) {
            // renewRandomBump = false;
            // let randomBump = random(0, 10); // 会重复触发
            // console.log("randomBump = " + randomBump)
            if (
                frameCount % 600 == 0 &&
                dist(circleX1, circleY1, circleX2, circleY2) >= 32
            ) {
                console.log(frameCount, dist(circleX1, circleY1, circleX2, circleY2));
                beforeBump = true;
                observe = false;
            }
            // else {
            //   renewRandomBump = false;
            // }
        }
        if (
            dist(circleX1, circleY1, circleX2, circleY2) < 32 &&
            observe == false &&
            bump == false
        ) {
            bumpX = (circleX1 + circleX2) / 2;
            bumpY = (circleY1 + circleY2) / 2;
            console.log(
                "1: " +
                circleX1 +
                circleY1 +
                ", 2: " +
                circleX2 +
                circleY2 +
                ", bump: " +
                bumpX +
                bumpY
            );

            bumpSpeed = 0.001;
            beforeBump = false;
            bump = true;
            bumped = false;
            bumpTime = millis();

            observe = false;
            feed = false;
            feedClicked = false;
            foodPlaced = false;
            call = false;

            foodX = 25;
            foodY = 425;
            foodDeg = 0;
            callD = 20;
            callA = 1;
            callX = 25;
            callY = 470;
        }

        if (millis() - bumpTime >= 6000 && bump == true) {
            console.log("bump停止运行");
            bumpCounter += 1;
            beforeBump = false;
            bump = false;
            console.log("bumpCounter = " + bumpCounter);
            observe = true;
            feed = false;
            feedClicked = false;
            foodPlaced = false;
            call = false;
        }
        if (bumpCounter >= 2) {
            ////////////////////////////////////////////////////////////////////////
            leaveTime = millis();
            bumpCounter = 0;
        }
        if (millis() - leaveTime < 5000) {
            leave = true;
            observe = false;
            feed = false;
            feedClicked = false;
            foodPlaced = false;
            feed1 = false;
            feed2 = false;
            call = false;
        }
        if (millis() - leaveTime >= 5000 && leave == true) {
            feedCounter = 0;
            creature2show = false;
            leave = false;
            observe = true;
            console.log("creature2show = " + creature2show);
            // console.log("feedCounter = " + feedCounter);
            bumpCounter = 0;
        }
    }
} // draw() end
