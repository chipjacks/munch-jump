class Doodle {
	static WIDTH = 80;
	static RADIUS = Doodle.WIDTH / 2;
	static JUMP_SPEED = 3; // 1-10
	static JUMP_HEIGHT = 20; // 5-30
	static MOVE_SPEED = 25; // 10 - 50

	constructor(img) {
		this.img = img;
		this.reset();
	}

	reset() {
		this.y = height;
		this.jumpFrame = 0;
		this.jumpStart = this.y;
		this.acceleration = height / (100 / Doodle.JUMP_SPEED);
		this.x = width / 2;
	}

	updatePosition() {
		this._updateY();
		this._updateX();
	}

	_updateY() {
		this.jumpFrame += 1;
		this.acceleration -=
			height / ((100 / Doodle.JUMP_SPEED) * Doodle.JUMP_HEIGHT);
		this.y = this.y - this.acceleration;
	}

	_updateX() {
		if (keyIsDown(LEFT_ARROW) === true) {
			this.x -= width / (50 - Doodle.MOVE_SPEED);
			this.x = this.x % width;
		}
		if (keyIsDown(RIGHT_ARROW) === true) {
			this.x += width / (50 - Doodle.MOVE_SPEED);
		}
		if (this.x >= width) {
			this.x = this.x % width;
		} else if (this.x <= 0) {
			this.x = width + this.x;
		}
	}

	draw() {
		// set the color of the outline for the shape to be drawn
		stroke(255, 50, 100);
		// set fill color
		fill(255, 100, 100);
		// draw a doodle at the mouse position
		imageMode(CENTER);
		image(this.img, this.x, this.y, Doodle.WIDTH * 1.2, Doodle.WIDTH);
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
		this.acceleration = height / (100 / Doodle.JUMP_SPEED);
	}

	isFalling() {
		return this.acceleration <= 0;
	}

	hasFallenOff() {
		return this.isFalling() && this.y > height + Doodle.WIDTH;
	}

	shiftY(increase) {
		this.jumpStart += increase;
		this.y += increase;
	}
}

class Platforms {
	static WIDTH = 100;
	static HEIGHT = 20;

	constructor(monsters) {
		this.monsters = monsters;
	}

	_spaceBetween() {
		return height / 4;
	}

	initPositions() {
		this.y = 0;
		this.positions = [];
		var lastY = height;
		this._addPlatform(width / 2 - Doodle.RADIUS, lastY - Platforms.HEIGHT);
		while (lastY > 0) {
			lastY -= this._spaceBetween();
			this._addPlatformRandomX(lastY);
		}
	}

	_addPlatformRandomX(y) {
		const x = Math.round(random(0, width - Platforms.WIDTH));
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
		if (topY > height / 4) {
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
		const canvas = document.getElementById("main-canvas");
		const { w, h } = this._calcAspectRatioBox();
		createCanvas(w, h, canvas);
		this.drawMenu();
		frameRate(this.speed);
	}

	_calcAspectRatioBox() {
		const aspectRatio = 1 / 2;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		let width, height;

		if (windowWidth / aspectRatio <= windowHeight) {
			// Window is wider relative to the aspect ratio
			width = windowWidth;
			height = windowWidth / aspectRatio;
		} else {
			// Window is taller relative to the aspect ratio
			height = windowHeight;
			width = windowHeight * aspectRatio;
		}
		return { w: width, h: height };
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
		this.doodle.updatePosition();
		this.detectCollision();
		if (this.doodle.jumpStart < height - height / 8) {
			const diff = height - this.doodle.jumpStart;
			const increase = diff / 15;
			this.doodle.shiftY(increase);
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
			this.doodle.reset();
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
					pos.x + pos.w + Doodle.RADIUS > this.doodle.x &&
					pos.x - Doodle.RADIUS < this.doodle.x
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

function keyPressed() {
	// prevent any default behavior.
	return false;
}
