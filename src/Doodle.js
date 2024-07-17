import Config from "./config.js";

const { DOODLE_HEIGHT, DOODLE } = Config;

export class Doodle {
	constructor(imgs) {
		this.imgs = imgs;
		this.reset();
	}

	reset() {
		this.y = height;
		this.jumpFrame = 0;
		this.jumpStart = this.y;
		this.acceleration = height / (100 / DOODLE.JUMP_SPEED);
		this.x = width / 2;
		this.isFarting = false;
		this.isBigJump = false;
	}

	updatePosition() {
		this._updateY();
		this._updateX();
	}

	_updateY() {
		this.jumpFrame += 1;
		this.acceleration -=
			height / ((100 / DOODLE.JUMP_SPEED) * DOODLE.JUMP_HEIGHT);
		this.y = this.y - this.acceleration;
	}

	_updateX() {
		angleMode(DEGREES);
		if (keyIsDown(LEFT_ARROW) === true) {
			this.x -= DOODLE.MOVE_SPEED;
		} else if (rotationY < -3) {
			this.x += rotationY / 2;
		}
		if (keyIsDown(RIGHT_ARROW) === true) {
			this.x += DOODLE.MOVE_SPEED;
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
			tl: { x: this.x, y: this.y - DOODLE.HEIGHT },
			tr: { x: this.x + DOODLE.WIDTH, y: this.y - DOODLE.HEIGHT },
			bl: { x: this.x, y: this.y },
			br: { x: this.x + DOODLE.WIDTH, y: this.y },
		};
	}

	fart() {
		this.isFarting = true;
		this.doneFarting = false;
	}

	draw() {
		imageMode(CORNERS);
		const img = this.isFalling() ? this.imgs.sitting : this.imgs.jumping;
		image(img, this.x, this.y - DOODLE.HEIGHT, this.x + DOODLE.WIDTH, this.y);
		if (this.isFarting && !this.isFalling()) {
			imageMode(CENTER);
			image(
				this.imgs.fart,
				this.x - DOODLE.HEIGHT / 6,
				this.y - DOODLE.HEIGHT / 2,
				DOODLE.HEIGHT / 4,
				DOODLE.HEIGHT / 4
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
			height / 2,
			DOODLE.WIDTH,
			DOODLE.HEIGHT
		);
	}

	newJump(platformY) {
		this.jumpFrame = 0;
		this.jumpStart = platformY;
		this.y = platformY;
		this.acceleration = height / (100 / DOODLE.JUMP_SPEED);
		if (this.doneFarting) {
			this.isFarting = false;
		} else {
			this.doneFarting = true;
		}
		if (this.isBigJump === true) {
			this.acceleration *= 1.5;
			this.isBigJump = false;
		}
	}

	bigJump() {
		this.isBigJump = true;
	}

	isFalling() {
		return this.acceleration <= 0;
	}

	hasFallenOff() {
		return this.isFalling() && this.y > height + DOODLE.WIDTH;
	}

	shiftY(increase) {
		this.jumpStart += increase;
		this.y += increase;
	}
}
