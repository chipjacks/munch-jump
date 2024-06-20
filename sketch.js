class Doodle {
  static WIDTH = 80;
  static RADIUS = Doodle.WIDTH / 2;

  constructor(img) {
    this.img = img;
    this.y = window.innerHeight;
    this.jumpFrame = 0;
    this.jumpStart = this.y;
  }

  updateY() {
    this.jumpFrame += 1;
    this.y = this.jumpStart - this._jumpHeight();
  }

  draw() {
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    // draw a circle at the mouse position
    imageMode(CENTER);
    image(this.img, mouseX, this.y, Doodle.WIDTH * 1.2, Doodle.WIDTH);
  }

  newJump(platformY) {
    this.jumpFrame = 0;
    this.jumpStart = platformY;
  }

  isFalling() {
    return (this.jumpFrame / 8) % Math.PI > Math.PI / 2;
  }

  _jumpHeight() {
    return (Math.sin((this.jumpFrame / 8) % Math.PI) * window.innerHeight) / 2;
  }
}

class Platforms {
  static WIDTH = 100;
  static HEIGHT = 20;

  constructor() {
    this.y = 0;
  }

  initPositions() {
    this.positions = [];
    const spaceBetween = window.innerHeight / 4;
    var lastY = window.innerHeight;
    while (lastY > 0) {
      this.addPlatform(lastY, spaceBetween);
      lastY -= spaceBetween;
    }
  }

  addPlatform(lastY, spaceBetween) {
    this.positions.push({
      x: Math.round(random(0, window.innerWidth - Platforms.WIDTH)),
      y: lastY - spaceBetween,
      w: Platforms.WIDTH,
      h: Platforms.HEIGHT,
    });
  }

  shiftY(increase) {
    this.y += increase;
    this.positions = this.positions.map((p) => ({ ...p, y: p.y + increase }));
    const topY = Math.min(...this.positions.map((p) => p.y));
    if (topY > window.innerHeight / 4) {
      this.addPlatform(topY, height / 4);
    }
  }

  debugCollisionArea() {
    this.positions.forEach((pos) => {
      stroke("purple");
      point(pos.x + pos.w + Doodle.RADIUS, pos.y - Doodle.RADIUS);
      point(pos.x + pos.w + Doodle.RADIUS, pos.y - pos.h - Doodle.RADIUS);
      point(pos.x - Doodle.RADIUS, pos.y - Doodle.RADIUS);
      point(pos.x - Doodle.RADIUS, pos.y - pos.h - Doodle.RADIUS);
    });
  }

  draw() {
    this.positions.forEach((pos) => {
      // set the color of the outline for the shape to be drawn
      stroke("gray");
      // set fill color
      fill("lightgreen");
      rect(pos.x, pos.y, pos.w, pos.h, pos.w / 10);
    });
  }

  resetPositions() {}
}

class Game {
  constructor(doodleImg) {
    this.speed = 30;
    this.doodle = new Doodle(doodleImg);
    this.platforms = new Platforms();
  }

  setup() {
    createCanvas(
      window.innerWidth,
      window.innerHeight,
      document.getElementById("main-canvas")
    );
    background("beige");
    textSize(50);
    strokeWeight(2);
    textAlign(CENTER);
    text("Click to play!", width / 2, height / 2);
    frameRate(this.speed);
    this.platforms.initPositions();
  }

  draw() {
    // refresh the background every loop. This is necessary to clear the screen
    background("beige");
    this.platforms.resetPositions();

    //draw everything
    this.doodle.draw();
    this.platforms.draw();

    // calculate new positions
    this.doodle.updateY();
    this.detectCollision();
    if (this.doodle.jumpStart < window.innerHeight - window.innerHeight / 8) {
      this.doodle.jumpStart += window.innerHeight / 50;
      this.platforms.shiftY(window.innerHeight / 50);
    }
  }

  detectCollision() {
    if (this.doodle.isFalling()) {
      this.platforms.positions.forEach((pos) => {
        if (
          pos.x + pos.w + Doodle.RADIUS > mouseX &&
          pos.x - Doodle.RADIUS < mouseX
        ) {
          if (
            pos.y - Doodle.RADIUS < this.doodle.y &&
            pos.y > this.doodle.y - pos.h - Doodle.RADIUS
          ) {
            this.doodle.newJump(pos.y - Doodle.RADIUS);
          }
        }
      });
    }
  }
}

let game;
let doodleImg;

function preload() {
  doodleImg = loadImage("images/doodle.png");
}

function setup() {
  game = new Game(doodleImg);
  game.setup();
}

function draw() {
  game.draw();
}

function mouseMoved() {
  game.doodle.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
