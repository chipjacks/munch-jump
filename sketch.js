class Doodle {
  static WIDTH = 80;
  static RADIUS = Doodle.WIDTH / 2;

  constructor(img) {
    this.img = img;
    this.reset();
  }

  reset() {
    this.y = window.innerHeight;
    this.jumpFrame = 0;
    this.jumpStart = this.y;
    this.acceleration = window.innerHeight / 10;
  }

  updateY() {
    this.jumpFrame += 1;
    this.acceleration -= window.innerHeight / 100;
    this.y = this.y - this.acceleration;
  }

  draw() {
    // set the color of the outline for the shape to be drawn
    stroke(255, 50, 100);
    // set fill color
    fill(255, 100, 100);
    // draw a doodle at the mouse position
    imageMode(CENTER);
    image(this.img, mouseX, this.y, Doodle.WIDTH * 1.2, Doodle.WIDTH);
  }

  drawMenuImage() {
    imageMode(CENTER);
    image(
      this.img,
      width / 2,
      height / 2 + Doodle.WIDTH,
      Doodle.WIDTH * 1.2,
      Doodle.WIDTH
    );
  }

  newJump(platformY) {
    this.jumpFrame = 0;
    this.jumpStart = platformY;
    this.y = platformY;
    this.acceleration = height / 10;
  }

  isFalling() {
    return this.acceleration <= 0;
  }

  hasFallenOff() {
    return this.isFalling() && this.y > height + Doodle.WIDTH;
  }
}

class Platforms {
  static WIDTH = 100;
  static HEIGHT = 20;

  constructor(monsters) {
    this.monsters = monsters;
  }

  _spaceBetween() {
    return window.innerHeight / 4;
  }

  initPositions() {
    this.y = 0;
    this.positions = [];
    var lastY = window.innerHeight;
    this._addPlatform(mouseX - Doodle.RADIUS, lastY - Platforms.HEIGHT);
    while (lastY > 0) {
      lastY -= this._spaceBetween();
      this._addPlatformRandomX(lastY);
    }
  }

  _addPlatformRandomX(y) {
    const x = Math.round(random(0, window.innerWidth - Platforms.WIDTH));
    this._addPlatform(x, y);
    return x;
  }

  _addPlatform(x, y) {
    this.positions.push({
      x: x,
      y: y,
      w: Platforms.WIDTH,
      h: Platforms.HEIGHT,
    });
  }

  shiftY(increase) {
    this.y += increase;
    this.positions = this.positions.map((p) => ({ ...p, y: p.y + increase }));
    this.monsters.positions = this.monsters.positions.map((p) => ({
      ...p,
      y: p.y + increase,
    }));
    const topY = Math.min(...this.positions.map((p) => p.y));
    if (topY > window.innerHeight / 4) {
      const y = topY - this._spaceBetween();
      const x = this._addPlatformRandomX(y);
      if (this.positions.length % 5 == 0) {
        this.monsters.addMonster(x, y - Platforms.HEIGHT);
      }
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
}

class Monsters {
  static WIDTH = Platforms.WIDTH;
  static HEIGHT = Platforms.WIDTH;

  constructor(monsterImgs) {
    this.positions = [];
    this.imgs = monsterImgs;
  }

  addMonster(x, y) {
    text("add monster!", width / 2, height / 2);
    this.positions.push({ x, y });
  }

  draw() {
    this.positions.forEach((pos) => {
      // draw a monster on the platform
      imageMode(CENTER);
      image(
        this.imgs.bear,
        pos.x + Monsters.WIDTH / 2,
        pos.y - Platforms.HEIGHT - 10,
        Monsters.WIDTH,
        Monsters.HEIGHT
      );
    });
  }
}

class Game {
  static STATE = Object.freeze({
    MENU: "menu",
    PLAYING: "playing",
    GAME_OVER: "game_over",
  });

  constructor(images) {
    this.speed = 30;
    this.doodle = new Doodle(images.doodle);
    this.monsters = new Monsters(images.monsters);
    this.platforms = new Platforms(this.monsters);
    this.state = Game.STATE.MENU;
  }

  setup() {
    createCanvas(
      window.innerWidth,
      window.innerHeight,
      document.getElementById("main-canvas")
    );
    this.drawMenu();
    frameRate(this.speed);
  }

  draw() {
    switch (this.state) {
      case Game.STATE.MENU:
        this.drawMenu();
        break;
      case Game.STATE.PLAYING:
        this.drawPlaying();
        break;
      case Game.STATE.GAME_OVER:
        this.drawGameOver();
        break;
      default:
        // Handle unexpected states
        console.error("Unknown game state: " + this.state);
        break;
    }
  }

  drawMenu() {
    background("beige");
    textSize(50);
    strokeWeight(2);
    textAlign(CENTER);
    text("Click to play!", width / 2, height / 2);
    this.doodle.drawMenuImage();
  }

  drawPlaying() {
    // refresh the background every loop. This is necessary to clear the screen
    background("beige");

    //draw everything
    this.doodle.draw();
    this.platforms.draw();
    this.monsters.draw();
    this.drawScore();

    // calculate new positions
    this.doodle.updateY();
    this.detectCollision();
    if (this.doodle.jumpStart < window.innerHeight - window.innerHeight / 8) {
      const diff = window.innerHeight - this.doodle.jumpStart;
      const increase = diff / 15;
      this.doodle.jumpStart += increase;
      this.platforms.shiftY(increase);
    }
  }

  drawScore() {
    fill("lightgreen");
    text(this.currentScore().toLocaleString(), 100, 50);
  }

  drawGameOver() {
    background("beige");
    textSize(50);
    strokeWeight(2);
    textAlign(CENTER);
    fill("lightgreen");
    text(
      `Nice! You scored ${this.currentScore().toLocaleString()}.`,
      width / 2,
      height / 2
    );
    text(
      `Your high score is ${this.highScore().toLocaleString()}.`,
      width / 2,
      height / 2 + 75
    );
    text("Click to play again!", width / 2, height / 2 + 150);
  }

  currentScore() {
    return Math.round(this.platforms.y / 10);
  }

  highScore() {
    return getItem("highScore");
  }

  mouseMoved() {}

  mousePressed() {
    if (game.state === Game.STATE.MENU) {
      this.platforms.initPositions();
      this.state = Game.STATE.PLAYING;
    } else if (game.state == Game.STATE.GAME_OVER) {
      this.doodle.reset();
      this.platforms.initPositions();
      this.state = Game.STATE.PLAYING;
    }
  }

  transitionGameOver() {
    const highScore = getItem("highScore");
    if (highScore == 0 || highScore == null) {
      storeItem("highScore", this.currentScore());
    } else if (this.currentScore() > highScore) {
      storeItem("highScore", this.currentScore());
    }
    this.state = Game.STATE.GAME_OVER;
  }

  detectCollision() {
    if (this.doodle.hasFallenOff()) {
      this.transitionGameOver();
    } else if (this.doodle.isFalling()) {
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
let images;

function preload() {
  images = {
    doodle: loadImage("images/doodle.png"),
    monsters: {
      bear: loadImage("images/bear.png"),
    },
  };
}

function setup() {
  game = new Game(images);
  game.setup();
}

// Add a mousePressed function to start the game
function mousePressed() {
  game.mousePressed();
}

function draw() {
  game.draw();
}

function mouseMoved() {
  game.mouseMoved();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
