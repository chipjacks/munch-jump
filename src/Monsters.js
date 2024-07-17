import Config from "./config.js";

const { MONSTERS } = Config;

export class Monsters {
	constructor(monsterImgs) {
		this.positions = [];
		this.imgs = monsterImgs;
	}

	reset() {
		this.positions = [];
	}

	addMonster(blx, bly) {
		const imgs = Object.values(this.imgs.animals);
		const img = imgs[Math.floor(Math.random() * imgs.length)];
		let h = MONSTERS.HEIGHT;
		if (img === this.imgs.animals.bear) {
			h *= 1.5;
		}
		const pos = {
			x: blx,
			y: bly - h + 10,
			w: MONSTERS.WIDTH,
			h,
			img,
		};
		this.positions.push(pos);
	}

	draw() {
		this.positions.forEach((pos) => {
			// draw a monster on the platform
			imageMode(CORNERS);
			let img = pos.img;
			if (pos.img === this.imgs.animals.weiner) {
				img =
					round(frameCount / 10) % 2 == 0
						? this.imgs.animals.weiner
						: this.imgs.weiner_up;
			}
			image(img, pos.x, pos.y, pos.x + pos.w, pos.y + pos.h);
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
		return pos.h < MONSTERS.HEIGHT;
	}
}
