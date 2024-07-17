import Config from "./config.js";
import { Doodle } from "./Doodle.js";
import { Platforms } from "./Platforms.js";
import { Monsters } from "./Monsters.js";
import { Snacks } from "./Snacks.js";

const { DOODLE_HEIGHT, DOODLE } = Config;

export class Game {
	static STATE = Object.freeze({
		MENU: "menu",
		PLAYING: "playing",
		GAME_OVER: "game_over",
	});

	static TEXT_COLOR = "lightgreen";

	constructor(images, audio) {
		this.speed = 30;
		this.imgs = images;
		this.audio = audio;
		this.doodle = new Doodle(images.doodle);
		this.monsters = new Monsters(images.monsters);
		this.snacks = new Snacks(images.snacks);
		this.platforms = new Platforms(images.log, this.monsters, this.snacks);
		this.state = Game.STATE.MENU;
	}

	setup() {
		const canvas = document.getElementById("main-canvas");
		const { w, h } = { w: window.innerWidth, h: window.innerHeight };
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
		textSize(DOODLE_HEIGHT / 4);
		strokeWeight(1);
		textAlign(CENTER);
		textFont("Bradley Hand");
		stroke("black");
		fill(Game.TEXT_COLOR);
		text("Click to play!", width / 2, height / 2 + DOODLE_HEIGHT * 1.2);
		text(
			"Arrow keys or rotate device to move",
			width / 2,
			height / 2 + DOODLE_HEIGHT * 1.5
		);
		this.drawTitleImage();
		this.doodle.drawMenuImage();
		this.drawAlisonImage();
		if (!checkPermissionGranted()) {
			// Create a button for requesting permission
			let button = createButton("Allow Device Orientation");
			button.position(width - width / 3, 10);
			button.size(width / 3, height / 20);
			button.style("font-size:1vh");
			button.id("permissionButton");
			button.mousePressed(requestOrientationPermission);
		}
	}

	drawTitleImage() {
		imageMode(CENTER);
		image(
			this.imgs.title,
			width / 2,
			height * 0.3,
			DOODLE_HEIGHT * 4,
			DOODLE_HEIGHT * 2
		);
	}

	drawAlisonImage() {
		textAlign(RIGHT);
		const size = 30;
		textSize(size);
		text("Art by Alison Ponce", width - size - 30, height - 20);
		imageMode(CORNERS);
		image(
			this.imgs.alision,
			width - size - 20,
			height - size - 20,
			width,
			height
		);
	}

	drawPlaying() {
		// refresh the background every loop. This is necessary to clear the screen
		background("beige");

		//draw everything
		this.platforms.draw();
		this.monsters.draw();
		this.snacks.draw();
		this.doodle.draw();
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
		fill(Game.TEXT_COLOR);
		stroke("black");
		textSize(DOODLE_HEIGHT / 2);
		textAlign(LEFT);
		text(this.currentScore().toLocaleString(), 30, DOODLE_HEIGHT / 2);
	}

	drawGameOver() {
		background("beige");
		textSize(DOODLE_HEIGHT / 2);
		textAlign(CENTER);
		fill(Game.TEXT_COLOR);
		stroke("black");
		text("Nice!", width / 2, height / 2);
		textSize(30);
		text(
			`You scored ${this.currentScore().toLocaleString()}.`,
			width / 2,
			height / 2 + 50
		);
		text(
			`Your high score is ${this.highScore().toLocaleString()}.`,
			width / 2,
			height / 2 + 100
		);
		textSize(50);
		text("Click to play again!", width / 2, height / 2 + 170);
	}

	currentScore() {
		return Math.round(this.platforms.y / 10);
	}

	highScore() {
		return getItem("highScore");
	}

	mousePressed() {
		if (game.state === Game.STATE.MENU) {
			this.doodle.reset();
			this.monsters.reset();
			this.snacks.reset();
			this.platforms.initPositions();
			this.state = Game.STATE.PLAYING;
			this.audio.background.play();
		} else if (game.state == Game.STATE.GAME_OVER) {
			this.doodle.reset();
			this.monsters.reset();
			this.snacks.reset();
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
			return;
		} else if (this.doodle.isFalling()) {
			const dc = this.doodle.corners();
			this.platforms.positions.forEach((pos) => {
				const pc = this.platforms.corners(pos);
				if (
					(dc.br.x >= pc.tl.x && dc.br.x <= pc.tr.x) ||
					(dc.bl.x <= pc.tr.x && dc.bl.x >= pc.tl.x)
				) {
					if (
						pc.tl.y - dc.br.y <= DOODLE.HEIGHT / 4 &&
						pc.tl.y - dc.br.y > 0 - DOODLE.HEIGHT / 4
					) {
						this.doodle.newJump(pc.tr.y);
					}
				}
			});
		}
		this.monsters.positions.forEach((pos) => {
			if (isOverlapping(this.monsters.corners(pos), this.doodle.corners())) {
				if (this.doodle.isFalling()) {
					this.monsters.flatten(pos);
				} else if (!this.monsters.isFlattened(pos)) {
					this.transitionGameOver();
					return;
				}
			}
		});
		this.snacks.positions.forEach((pos) => {
			if (isOverlapping(this.snacks.corners(pos), this.doodle.corners())) {
				if (!this.snacks.isEaten(pos)) {
					this.snacks.eat(pos);
					this.doodle.bigJump();
					this.doodle.fart();
				}
			}
		});
	}
}

window.Game = Game;
