export class Config {
	static DOODLE_HEIGHT = window.innerHeight / 10;

	// Doodle dimensions and speeds
	static DOODLE = {
		WIDTH: (this.DOODLE_HEIGHT * 3) / 4,
		HEIGHT: this.DOODLE_HEIGHT,
		JUMP_SPEED: 3, // 1-10
		JUMP_HEIGHT: 20, // 5-30
		MOVE_SPEED: 20, // 10 - 50
	};

	// Platforms dimensions
	static PLATFORMS = {
		WIDTH: this.DOODLE_HEIGHT * 1.2,
		HEIGHT: this.DOODLE_HEIGHT * 1.2 * 0.3,
		MIN_DISTANCE: this.DOODLE_HEIGHT,
	};

	// Monsters dimensions
	static MONSTERS = {
		WIDTH: this.PLATFORMS.WIDTH,
		HEIGHT: this.PLATFORMS.WIDTH / 2,
	};

	// Snacks dimensions
	static SNACKS = {
		WIDTH: this.DOODLE_HEIGHT / 2,
		HEIGHT: (this.DOODLE_HEIGHT / 2) * 0.8,
	};
}

export default Config;
