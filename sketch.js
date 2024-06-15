class Doodle {
  constructor() {
    this.y = window.innerHeight;
    this.jumpFrame = 0;
  }

  updateY() {
    this.y =
      window.innerHeight -
      (Math.sin((frameCount / 8) % Math.PI) * window.innerHeight) / 2;
  }

  draw() {
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    // draw a circle at the mouse position
    ellipse(mouseX, this.y, 80);
  }
}

class Platform {
  constructor() {
    this.y = 0;
    this.positions = [];
  }

  draw(x, y) {
    this.positions.push({ x: x, y: y });
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    rect(x, y, 100, 20);
  }

  resetPositions() {
    this.positions = [];
  }
}

class Game {
  constructor() {
    this.speed = 30;
    this.doodle = new Doodle();
    this.platform = new Platform();
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

    this.platform.resetPositions();
    this.platform.draw(100, this.platform.y);
    this.platform.draw(
      window.innerWidth - 100,
      this.platform.y + window.innerHeight / 4
    );
    this.platform.draw(
      window.innerWidth / 2,
      this.platform.y + (window.innerHeight / 4) * 2
    );
    this.platform.draw(
      window.innerWidth - 100,
      this.platform.y + (window.innerHeight / 4) * 3
    );
    this.platform.draw(
      window.innerWidth / 2,
      this.platform.y + (window.innerHeight / 4) * 4
    );

    this.doodle.updateY();
    this.detectCollision();
  }

  detectCollision() {
    this.platform.positions.forEach((pos) => {
      if (pos.x + 50 > mouseX && pos.x - 50 < mouseX) {
        if (pos.y < this.doodle.y && pos.y > this.doodle.y - 20) {
          text("collision!", width / 2, height / 2);
        }
      }
    });
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
