import Config from "./config.js";

const { PLATFORMS, DOODLE } = Config;

export class Platforms {
	constructor(img, monsters, snacks) {
		this.monsters = monsters;
		this.snacks = snacks;
		this.img = img;
	}

	_spaceBetween() {
		let space = random(height / 12, height / 4);
		let aspectRatio = width / height;
		return space / aspectRatio / 2;
	}

	initPositions() {
		this.y = 0;
		this.positions = [];
		var lastY = height;
		this._addPlatform(width / 2 - DOODLE.WIDTH / 2, lastY - PLATFORMS.HEIGHT);
		while (lastY > 0) {
			lastY -= this._spaceBetween();
			this._addPlatformRandomX(lastY);
		}
	}

	_addPlatformRandomX(y) {
		const x = Math.round(random(0, width - PLATFORMS.WIDTH));
		return this._addPlatform(x, y);
	}

	_addPlatform(x, y) {
		const pos = { x: x, y: y, w: PLATFORMS.WIDTH, h: PLATFORMS.HEIGHT };
		const prevPos = this.positions.at(-1);
		if (
			prevPos &&
			Math.abs(pos.x - prevPos.x) < PLATFORMS.MIN_DISTANCE &&
			Math.abs(pos.y - prevPos.y) < PLATFORMS.MIN_DISTANCE
		) {
			return;
		}
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
		this.snacks.positions = this.snacks.positions.map((p) => ({
			...p,
			y: p.y + increase,
		}));
		const topY = Math.min(...this.positions.map((p) => p.y));
		const nextY = this._spaceBetween();
		if (topY > nextY) {
			const y = topY - nextY;
			const pos = this._addPlatformRandomX(y);
			if (
				pos &&
				this.positions.length > 10 &&
				this.positions.length % 10 == 0
			) {
				this.monsters.addMonster(pos.x, pos.y);
			}
			if (pos && this.positions.length > 7 && this.positions.length % 7 == 0) {
				this.snacks.addSnack(pos.x, pos.y);
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
