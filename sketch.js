class Doodle {
	static WIDTH = 60;
	static HEIGHT = 80;
	static RADIUS = Doodle.WIDTH / 2;
	static JUMP_SPEED = 3; // 1-10
	static JUMP_HEIGHT = 20; // 5-30
	static MOVE_SPEED = 25; // 10 - 50

	constructor(imgs) {
		this.imgs = imgs;
		this.reset();
	}

	reset() {
		this.y = height;
		this.jumpFrame = 0;
		this.jumpStart = this.y;
		this.acceleration = height / (100 / Doodle.JUMP_SPEED);
		this.x = width / 2;
		this.isFarting = false;
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
		angleMode(DEGREES);
		console.log("rotationY", rotationY);
		if (keyIsDown(LEFT_ARROW) === true) {
			this.x -= width / (50 - Doodle.MOVE_SPEED);
		} else if (rotationY < -3) {
			this.x += rotationY / 2;
		}
		if (keyIsDown(RIGHT_ARROW) === true || rotationY > 5) {
			this.x += width / (50 - Doodle.MOVE_SPEED);
		} else if (rotationY > 3) {
			this.x += rotationY / 2;
		}
		if (this.x >= width) {
			this.x = this.x % width;
		} else if (this.x <= 0) {
			this.x = width + this.x;
		}
	}

	corners() {
		return {
			tl: { x: this.x, y: this.y - Doodle.HEIGHT },
			tr: { x: this.x + Doodle.WIDTH, y: this.y - Doodle.HEIGHT },
			bl: { x: this.x, y: this.y },
			br: { x: this.x + Doodle.WIDTH, y: this.y },
		};
	}

	fart() {
		this.isFarting = true;
		this.doneFarting = false;
	}

	draw() {
		imageMode(CORNERS);
		const img = this.isFalling() ? this.imgs.sitting : this.imgs.jumping;
		image(img, this.x, this.y - Doodle.HEIGHT, this.x + Doodle.WIDTH, this.y);
		if (this.isFarting && !this.isFalling()) {
			imageMode(CENTER);
			image(
				this.imgs.fart,
				this.x - Doodle.HEIGHT / 6,
				this.y - Doodle.HEIGHT / 2,
				Doodle.HEIGHT / 4,
				Doodle.HEIGHT / 4
			);
		}
		// this._debugCollisionArea();
	}

	_debugCollisionArea() {
		Object.values(this.corners()).forEach((c) => {
			stroke("purple");
			point(c.x, c.y);
		});
	}

	drawMenuImage() {
		imageMode(CENTER);
		image(
			this.imgs.sitting,
			width / 2,
			height / 2 + Doodle.WIDTH,
			Doodle.WIDTH,
			Doodle.HEIGHT
		);
	}

	newJump(platformY) {
		this.jumpFrame = 0;
		this.jumpStart = platformY;
		this.y = platformY;
		this.acceleration = height / (100 / Doodle.JUMP_SPEED);
		if (this.doneFarting) {
			this.isFarting = false;
		} else {
			this.doneFarting = true;
		}
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
	static WIDTH = 120;
	static HEIGHT = 40;

	constructor(img, monsters) {
		this.monsters = monsters;
		this.img = img;
	}

	_spaceBetween() {
		const space = random(height / 12, height / 4);
		return space;
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
		return this._addPlatform(x, y);
	}

	_addPlatform(x, y) {
		const pos = { x: x, y: y, w: Platforms.WIDTH, h: Platforms.HEIGHT };
		this.positions.push(pos);
		return pos;
	}

	shiftY(increase) {
		this.y += increase;
		this.positions = this.positions.map((p) => ({ ...p, y: p.y + increase }));
		this.monsters.positions = this.monsters.positions.map((p) => ({
			...p,
			y: p.y + increase,
		}));
		const topY = Math.min(...this.positions.map((p) => p.y));
		const nextY = this._spaceBetween();
		if (topY > nextY) {
			const y = topY - nextY;
			const pos = this._addPlatformRandomX(y);
			if (this.positions.length > 10 && this.positions.length % 10 == 0) {
				this.monsters.addMonster(pos.x, pos.y);
			}
		}
	}

	draw() {
		this.positions.forEach((pos) => {
			imageMode(CORNERS);
			image(this.img, pos.x, pos.y, pos.x + pos.w, pos.y + pos.h);
		});
		// this._debugCollisionArea();
	}

	corners(pos) {
		return {
			tl: { x: pos.x, y: pos.y },
			tr: { x: pos.x + pos.w, y: pos.y },
			bl: { x: pos.x, y: pos.y + pos.h },
			br: { x: pos.x + pos.w, y: pos.y + pos.h },
		};
	}

	_debugCollisionArea() {
		stroke("purple");
		this.positions.forEach((pos) => {
			Object.values(this.corners(pos)).forEach((c) => {
				point(c.x, c.y);
			});
		});
	}
}

class Monsters {
	static WIDTH = Platforms.WIDTH;
	static HEIGHT = Platforms.WIDTH / 2;

	constructor(monsterImgs) {
		this.positions = [];
		this.imgs = monsterImgs;
	}

	reset() {
		this.positions = [];
	}

	addMonster(blx, bly) {
		const pos = {
			x: blx,
			y: bly - Monsters.HEIGHT + 10,
			w: Monsters.WIDTH,
			h: Monsters.HEIGHT,
		};
		this.positions.push(pos);
	}

	draw() {
		this.positions.forEach((pos) => {
			// draw a monster on the platform
			imageMode(CORNERS);
			image(
				round(frameCount / 10) % 2 == 0
					? this.imgs.weiner
					: this.imgs.weiner_up,
				pos.x,
				pos.y,
				pos.x + pos.w,
				pos.y + pos.h
			);
		});
		// this._debugCollisionArea();
	}

	_debugCollisionArea() {
		stroke("purple");
		this.positions.forEach((pos) => {
			Object.values(this.corners(pos)).forEach((c) => {
				point(c.x, c.y);
			});
		});
	}

	corners(pos) {
		return {
			tl: { x: pos.x, y: pos.y },
			tr: { x: pos.x + pos.w, y: pos.y },
			bl: { x: pos.x, y: pos.y + pos.h },
			br: { x: pos.x + pos.w, y: pos.y + pos.h },
		};
	}

	flatten(pos) {
		const monster = this.positions.find((p) => p === pos);
		if (!monster) {
			console.error("missing monster!", pos);
			return;
		}
		if (!this.isFlattened(monster)) {
			monster.y += (pos.h / 3) * 2;
			monster.h = pos.h / 3;
		}
	}

	isFlattened(pos) {
		return pos.h < Monsters.HEIGHT;
	}
}

class Game {
	static STATE = Object.freeze({
		MENU: "menu",
		PLAYING: "playing",
		GAME_OVER: "game_over",
	});

	static TEXT_COLOR = "lightgreen";

	constructor(images) {
		this.speed = 30;
		this.doodle = new Doodle(images.doodle);
		this.monsters = new Monsters(images.monsters);
		this.platforms = new Platforms(images.log, this.monsters);
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
		strokeWeight(1);
		textAlign(CENTER);
		textFont("Bradley Hand");
		stroke("black");
		fill(Game.TEXT_COLOR);
		text("Click to play!", width / 2, height / 2);
		this.doodle.drawMenuImage();

		if (
			typeof DeviceOrientationEvent.requestPermission === "function" &&
			!permissionGranted
		) {
			// Create a button for requesting permission
			let button = createButton("Allow Device Orientation");
			button.position(width / 4, height / 2 + height / 8);
			button.size(width / 2, height / 10);
			button.style("font-size:2vh");
			button.id("permissionButton");
			button.mousePressed(requestOrientationPermission);
		}
	}

	drawPlaying() {
		// refresh the background every loop. This is necessary to clear the screen
		background("beige");

		//draw everything
		this.platforms.draw();
		this.monsters.draw();
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
		textSize(50);
		textAlign(LEFT);
		text(this.currentScore().toLocaleString(), 30, 50);
	}

	drawGameOver() {
		background("beige");
		textSize(50);
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

	mouseMoved() {}

	mousePressed() {
		if (game.state === Game.STATE.MENU) {
			this.doodle.reset();
			this.monsters.reset();
			this.platforms.initPositions();
			this.state = Game.STATE.PLAYING;
		} else if (game.state == Game.STATE.GAME_OVER) {
			this.doodle.reset();
			this.monsters.reset();
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
						pc.tl.y - dc.br.y <= Doodle.HEIGHT / 4 &&
						pc.tl.y - dc.br.y > 0 - Doodle.HEIGHT / 4
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
					this.doodle.fart();
				} else if (!this.monsters.isFlattened(pos)) {
					this.transitionGameOver();
					return;
				}
			}
		});
	}
}

let game;
let images;

function preload() {
	images = {
		doodle: {
			sitting: loadImage("images/doodle.png"),
			jumping: loadImage("images/doodle_jumping.png"),
			fart: loadImage("images/doodle_fart.png"),
		},
		monsters: {
			bear: loadImage("images/bear.png"),
			weiner: loadImage("images/super_weiner_down.png"),
			weiner_up: loadImage("images/super_weiner_up.png"),
		},
		log: loadImage("images/log.png"),
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

function touchStarted() {
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

function isOverlapping(box1, box2) {
	// Helper function to check if one box is to the left of the other
	function isLeftOf(a, b) {
		return a.tr.x < b.tl.x;
	}

	// Helper function to check if one box is to the right of the other
	function isRightOf(a, b) {
		return a.tl.x > b.tr.x;
	}

	// Helper function to check if one box is above the other
	function isAbove(a, b) {
		return a.bl.y < b.tl.y;
	}

	// Helper function to check if one box is below the other
	function isBelow(a, b) {
		return a.tl.y > b.bl.y;
	}

	// If any of these conditions is true, then the boxes do not overlap
	if (
		isLeftOf(box1, box2) ||
		isRightOf(box1, box2) ||
		isAbove(box1, box2) ||
		isBelow(box1, box2)
	) {
		return false;
	}

	// Otherwise, the boxes overlap
	return true;
}

let permissionGranted = false;

function requestOrientationPermission() {
	document.getElementById("permissionButton").remove();
	// Check if the browser requires permission to access device orientation
	if (typeof DeviceOrientationEvent.requestPermission === "function") {
		DeviceOrientationEvent.requestPermission()
			.then((permissionState) => {
				if (permissionState === "granted") {
					permissionGranted = true;
					window.addEventListener("deviceorientation", handleOrientation);
				}
			})
			.catch(console.error);
	} else {
		// Handle regular non-iOS 13+ devices
		window.addEventListener("deviceorientation", handleOrientation);
	}
}

function handleOrientation(event) {}

function checkPermissionState() {
	if (navigator.permissions) {
		navigator.permissions
			.query({ name: "accelerometer" })
			.then((result) => {
				if (result.state === "granted") {
					permissionGranted = true;
					document.getElementById("permissionButton").remove();
					window.addEventListener("deviceorientation", handleOrientation);
				} else if (result.state === "prompt") {
					// Permission has not been requested yet, wait for user action
				} else if (result.state === "denied") {
					// Permission was denied, inform the user
				}
				result.onchange = () => {
					if (result.state === "granted") {
						permissionGranted = true;
						window.addEventListener("deviceorientation", handleOrientation);
					} else {
						permissionGranted = false;
					}
				};
			})
			.catch(console.error);
	}
}
