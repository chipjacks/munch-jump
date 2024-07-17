let game;
let images;
let audio;

function preload() {
	images = {
		doodle: {
			sitting: loadImage("images/doodle.png"),
			jumping: loadImage("images/doodle_jumping.png"),
			fart: loadImage("images/doodle_fart.png"),
		},
		monsters: {
			animals: {
				bear: loadImage("images/monsters/bear.png"),
				weiner: loadImage("images/monsters/super_weiner_down.png"),
			},
			weiner_up: loadImage("images/monsters/super_weiner_up.png"),
		},
		snacks: {
			food: {
				cinnyroll: loadImage("images/food/cinnyroll.png"),
				cheese: loadImage("images/food/cheese.png"),
				frappe: loadImage("images/food/frappe.png"),
			},
			crumbs: loadImage("images/food/crumbs.png"),
		},
		log: loadImage("images/log.png"),
		alision: loadImage("images/alison_favicon.png"),
		title: loadImage("images/title.png"),
	};

	soundFormats("mp3");
	audio = {
		background: loadSound("audio/background"),
	};
}

function setup() {
	game = new Game(images, audio);
	game.setup();
}

// Add a mousePressed function to start the game
function mousePressed(e) {
	game.mousePressed();
}

function touchStarted(e) {
	if (e.target.id === "permissionButton") {
		console.log("button pressed");
		return true; // button has a click handler
	} else {
		game.mousePressed();
	}
}

function draw() {
	game.draw();
}

function windowResized() {
	DOODLE_HEIGHT = window.innerHeight / 10;
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

function requestOrientationPermission() {
	// Check if the browser requires permission to access device orientation
	if (typeof DeviceOrientationEvent.requestPermission === "function") {
		DeviceOrientationEvent.requestPermission()
			.then((permissionState) => {
				if (permissionState === "granted") {
					console.log("remove button");
					document.getElementById("permissionButton").remove();
					return true;
				}
			})
			.catch(console.error);
	}
}

function checkPermissionGranted() {
	if (
		typeof DeviceOrientationEvent.requestPermission === "function" &&
		rotationY === 0
	) {
		return false;
	} else {
		return true;
	}
}
