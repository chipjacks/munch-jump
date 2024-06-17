class Doodle {
  constructor() {
    this.y = window.innerHeight;
    this.jumpFrame = 0;
    this.jumpStart = this.y;
    this.width = 80;
    this.radius = this.width / 2;
  }

  updateY() {
    this.jumpFrame += 1;
    this.y = this.jumpStart - this._jumpHeight() / 2;
  }

  draw() {
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    // draw a circle at the mouse position
    ellipse(mouseX, this.y, this.width);
  }

  newJump(platformY) {
    this.jumpFrame = 0;
    this.jumpStart = platformY;
  }

  isFalling() {
    return (this.jumpFrame / 8) % Math.PI > Math.PI / 2;
  }

  _jumpHeight() {
    return Math.sin((this.jumpFrame / 8) % Math.PI) * window.innerHeight;
  }
}

class Platforms {
  static WIDTH = 100;
  static HEIGHT = 20;

  constructor() {
    this.y = 0;
    this.positions = [];
  }

  draw(x, y) {
    this.positions.push({
      x: x,
      y: y,
      w: Platforms.WIDTH,
      h: Platforms.HEIGHT,
    });
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    rect(x, y, Platforms.WIDTH, Platforms.HEIGHT);
  }

  resetPositions() {
    this.positions = [];
  }
}

class Game {
  constructor() {
    this.speed = 30;
    this.doodle = new Doodle();
    this.platforms = new Platforms();
  }

  setup() {
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
    frameRate(this.speed);
  }

  draw() {
    // refresh the background every loop. This is necessary to clear the screen
    background(0);

    this.doodle.draw();

    this.platforms.resetPositions();
    this.platforms.draw(100, this.platforms.y);
    this.platforms.draw(
      window.innerWidth - 100,
      this.platforms.y + window.innerHeight / 4
    );
    this.platforms.draw(
      window.innerWidth / 2,
      this.platforms.y + (window.innerHeight / 4) * 2
    );
    this.platforms.draw(
      window.innerWidth - 100,
      this.platforms.y + (window.innerHeight / 4) * 3
    );
    this.platforms.draw(
      window.innerWidth / 2,
      this.platforms.y + (window.innerHeight / 4) * 4
    );

    if (this.doodle.jumpStart < window.innerHeight - window.innerHeight / 8) {
      this.doodle.jumpStart += window.innerHeight / 50;
      this.platforms.y += window.innerHeight / 50;
    }
    this.platforms.positions.forEach((pos) => {
      stroke("purple");
      point(pos.x + pos.w + this.doodle.radius, pos.y - this.doodle.radius);
      point(
        pos.x + pos.w + this.doodle.radius,
        pos.y - pos.h - this.doodle.radius
      );
      point(pos.x - this.doodle.radius, pos.y - this.doodle.radius);
      point(pos.x - this.doodle.radius, pos.y - pos.h - this.doodle.radius);
    });
    this.doodle.updateY();
    this.detectCollision();
  }

  detectCollision() {
    if (this.doodle.isFalling()) {
      this.platforms.positions.forEach((pos) => {
        if (
          pos.x + pos.w + this.doodle.radius > mouseX &&
          pos.x - this.doodle.radius < mouseX
        ) {
          if (
            pos.y - this.doodle.radius < this.doodle.y &&
            pos.y > this.doodle.y - pos.h - this.doodle.radius
          ) {
            text("collision!", width / 2, height / 2);
            this.doodle.newJump(pos.y - this.doodle.radius);
          }
        }
      });
    }
  }
}

let game = new Game();

function setup() {
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
