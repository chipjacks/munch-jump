let doodleY = 0;
let speed = 30;
let platformY = 0;
let platformPositions = [];

function setup() {
  createCanvas(
    window.innerWidth,
    window.innerHeight,
    document.getElementById("main-canvas")
  );
  background(255);
  textSize(50);
  strokeWeight(4);
  textAlign(CENTER);
  text("Click to play!", width / 2, height / 2);
  doodleY = window.innerHeight;
  frameRate(speed);
}

function draw() {
  // refresh the background every loop. This is necessary to clear the screen
  background(0);
  // set the color of the outline for the shape to be drawn
  stroke(255, 50, 100);
  // set fill color
  fill(255, 100, 100);

  // draw a circle at the mouse position
  ellipse(mouseX, doodleY, 80);
  platformPositions = [];
  drawPlatform(window.innerWidth - 100, platformY - window.innerHeight / 4);
  drawPlatform(window.innerWidth / 2, platformY - (window.innerHeight / 4) * 2);
  drawPlatform(100, platformY);
  drawPlatform(window.innerWidth - 100, platformY + window.innerHeight / 4);
  drawPlatform(window.innerWidth / 2, platformY + (window.innerHeight / 4) * 2);
  updateY();
  detectCollision();
}

function mouseMoved() {
  // set the color of the outline for the shape to be drawn
  stroke(255, 50, 100);
  // set fill color
  fill(255, 100, 100);

  // draw a circle at the mouse position
  ellipse(mouseX, doodleY, 80);
}

const updateY = () => {
  doodleY =
    window.innerHeight -
    (Math.sin((frameCount / 8) % Math.PI) * window.innerHeight) / 2;
  platformY = platformY + speed / 4;
  if (platformY > window.innerHeight) {
    platformY = 0;
  }
};

const detectCollision = () => {
  platformPositions.forEach((pos) => {
    if (pos.x + 50 > mouseX && pos.x - 50 < mouseX) {
      if (pos.y < doodleY && pos.y > doodleY - 20) {
        text("collision!", width / 2, height / 2);
      }
    }
  });
};

const drawPlatform = (x, y) => {
  platformPositions.push({ x: x, y: y });
  // set the color of the outline for the shape to be drawn
  stroke(255, 50, 100);
  // set fill color
  fill(255, 100, 100);
  rect(x, y, 100, 20);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
