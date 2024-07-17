import Config from "./config.js";

const { SNACKS, PLATFORMS } = Config;

export class Snacks {
	constructor(snackImgs) {
		this.positions = [];
		this.imgs = snackImgs;
	}

	reset() {
		this.positions = [];
	}

	addSnack(blx, bly) {
		const snackImgs = Object.values(this.imgs.food);
		const img = snackImgs[Math.floor(Math.random() * snackImgs.length)];
		let h = SNACKS.HEIGHT;
		if (img === this.imgs.food.frappe) {
			h *= 1.8;
		}
		const pos = {
			x: blx + PLATFORMS.WIDTH / 4,
			y: bly - h + 10,
			w: SNACKS.WIDTH,
			h,
			img,
		};
		this.positions.push(pos);
	}

	draw() {
		this.positions.forEach((pos) => {
			// draw a monster on the platform
			imageMode(CORNERS);
			if (pos.eaten) {
				image(this.imgs.crumbs, pos.x, pos.y, pos.x + pos.w, pos.y + pos.h);
			} else {
				image(pos.img, pos.x, pos.y, pos.x + pos.w, pos.y + pos.h);
			}
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

	eat(pos) {
		const snack = this.positions.find((p) => p === pos);
		if (!snack) {
			console.error("missing snack!", pos);
			return;
		}
		if (!this.isEaten(snack)) {
			snack.eaten = true;
		}
	}

	isEaten(pos) {
		return pos.eaten === true;
	}
}
