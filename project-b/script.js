let textWrapper = document.querySelector(".text-wrapper")
let text = document.querySelector("#click")

let a = 1;
let delA = -0.01;

textWrapper.onclick = function () {
    document.location = "unison.html"
}

if (a < 0 || a > 1) {
    delA *= -1
}

setInterval(function () {
    if (a < 0 || a > 1.05) {
        delA *= -1
    }
    a += delA;
    text.style.color = "rgb(255, 255, 255, " + a + ")"
}, 25);

