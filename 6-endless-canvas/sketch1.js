const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const World = Matter.World;

// the Matter engine to animate the world
let engine;
let world;
let backgroundSound;
let glitzersound;
let mouse;
let isDrag = false;
// an array to contain all the blocks created
let blocks = [];
let murmel;
let trampolinA;
let trampolinB;
let trampolinC;
let trampolinD;

let canvasElem;
let off = { x: 0, y: 0 };

let Heißluftballon;
let Mond;
let Stern;
let sparkleTrail = [];
let swarmHistory = [];

let hgWolken;
let hgBerge;
let vg;

function preload() {
	backgroundSound = loadSound("Mystery in the Forest.mp3");
	glitzersound = loadSound("Fairy Glitter.wav");
	Heißluftballon = loadImage("Heißluftballon.png");
	Mond = loadImage("Mond-groß.png");
	Stern = loadImage("Stern.png");
	Pilz1 = loadImage("Pilz1.png");
	Pilz2 = loadImage("Pilz2.png");
}

// das ist die Dimension des kompletten Levels
const dim = { w: 6480, h: 720 };

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("thecanvas");
	noStroke();
	// Das ist nötig für den 'Endless Canvas'
	canvasElem = document.getElementById("thecanvas");

	engine = Engine.create();
	world = engine.world;

	new BlocksFromSVG(world, "Achterbahn-Strecke.svg", blocks, {
		isStatic: true,
	});
	console.log("OK");
	//new BlocksFromSVG(world, "Heißluftballon.svg", blocks, { isStatic: true });

	// the ball has a label and can react on collisions
	murmel = new Ball(
		world,
		{ x: 235, y: 100, r: 40, image: Mond },
		{
			label: "Murmel",
			density: 0.005,
			restitution: 0.25,
			friction: 0.5,
			frictionAir: 0.0,
			collisionFilter: {
				category: 0b0001,
				mask: 0b0001,
			},
		}
	);
	blocks.push(murmel);

	// the box triggers a function on collisions
	blocks.push(
		new Block(
			world,
			{
				x: 250,
				y: 250,
				w: 50,
				h: 30,
				trigger: (ball, block) => {
					//Backgroundsound abspielen
					backgroundSound.play();
				},

				scale: 0.3,
				offset: { x: 0, y: -80 },
				image: Heißluftballon,
			},
			{
				isStatic: true,
				density: 0.1,
				restitution: 0.2,
				frictionAir: 0.01,
			}
		)
	);

	//Block mit Murmel wird schwerer
	blocks.push(
		new BlockCore(
			world,
			{
				x: 500,
				y: 800,
				w: 60,
				h: 60,
				color: "blue",
				trigger: (ball, block) => {
					Matter.Body.setDensity(murmel.body, 0.019);
				},
			},
			{
				isStatic: true,
				isSensor: true,
				density: 0.05,
				restitution: 0.5,
				frictionAir: 0.01,
			}
		)
	);

	// the box triggers a function on collisions, hier wird die Murmel geschubst und erstellt
	blocks.push(
		new Block(
			world,
			{
				x: 2270,
				y: 420,
				w: 60,
				h: 60,
				image: Stern,
				scale: 0.3,

				trigger: (ball, block) => {
					Matter.Body.applyForce(ball.body, ball.body.position, {
						x: 2,
						y: 0.0,
					}); //hier wird die Murmel geschubst
					const velocityMultiplier = 2; // Du kannst den Multiplikator anpassen, um die Geschwindigkeit zu ändern
					const currentVelocity = ball.body.velocity;
					Matter.Body.setVelocity(ball.body, {
						x: currentVelocity.x * velocityMultiplier,
						y: currentVelocity.y * velocityMultiplier,
					});
					//GLitzersound abspielen
					glitzersound.play();
				},
			},
			{
				isStatic: true,
				isSensor: true,
				// density: 0.05,
				// restitution: 0.5,
				// frictionAir: 0.01,
			}
		)
	);

	//Wände bei den ersten Pilzen
	blocks.push(
		new Block(
			world,
			{
				x: 1400,
				y: 595,
				w: 500,
				h: 10,
			},
			{
				isStatic: true,
			}
		)
	);
	blocks.push(
		new Block(
			world,
			{
				x: 1150,
				y: 540,
				w: 10,
				h: 100,
			},
			{
				isStatic: true,
			}
		)
	);

	blocks.push(
		new Block(
			world,
			{
				x: 1560,
				y: 500,
				w: 10,
				h: 280,
			},
			{
				isStatic: true,
			}
		)
	);

	//Wände bei den zweiten Pilzen
	blocks.push(
		new Block(
			world,
			{
				x: 3280,
				y: 540,
				w: 500,
				h: 10,
			},
			{
				isStatic: true,
			}
		)
	);
	blocks.push(
		new Block(
			world,
			{
				x: 3070,
				y: 440,
				w: 10,
				h: 200,
			},
			{
				isStatic: true,
			}
		)
	);

	blocks.push(
		new Block(
			world,
			{
				x: 3450,
				y: 450,
				w: 10,
				h: 280,
			},
			{
				isStatic: true,
			}
		)
	);

	//Wand über Looping
	blocks.push(
		new Block(
			world,
			{
				x: 2400,
				y: 40,
				w: 10,
				h: 80,
			},
			{
				isStatic: true,
			}
		)
	);

	trampolinA = new Block(
		world,
		{
			x: 1450,
			y: 535,
			w: 165,
			h: 19,
			color: "green",
			offset: { x: 0, y: 47 },
			image: Pilz1,
		},
		{ isStatic: true, restitution: 1.3 }
	);
	trampolinB = new Block(
		world,
		{
			x: 1260,
			y: 580,
			w: 100,
			h: 18,
			color: "red",
			offset: { x: 0, y: 27 },
			image: Pilz2,
		},
		{ isStatic: true, restitution: 1.3 }
	);
	trampolinC = new Block(
		world,
		{
			x: 3380,
			y: 530,
			w: 100,
			h: 17,
			color: "orange",
			offset: { x: 0, y: 26 },
			image: Pilz2,
		},
		{ isStatic: true, restitution: 1.3 }
	);
	trampolinD = new Block(
		world,
		{
			x: 3200,
			y: 500,
			w: 165,
			h: 20,
			color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
		},
		{ isStatic: true, restitution: 1.3 }
	);

	// add a mouse so that we can manipulate Matter objects
	mouse = new Mouse(engine, canvas, { stroke: "blue", strokeWeight: 3 });

	// process mouseup events in order to drag objects or add more balls
	mouse.on("startdrag", (evt) => {
		isDrag = true;
	});
	mouse.on("mouseup", (evt) => {
		if (!isDrag) {
			let ball = new Ball(
				world,
				{
					x: off.x + evt.mouse.position.x,
					y: off.y + evt.mouse.position.y,
					r: 15,
					color: "yellow",
				},
				{ isStatic: false, restitution: 0.9, label: "Murmel" }
			);
			blocks.push(ball);
		}
		isDrag = false;
	});

	// process collisions - check whether block "Murmel" hits another Block
	Events.on(engine, "collisionStart", function (event) {
		var pairs = event.pairs;
		pairs.forEach((pair, i) => {
			if (pair.bodyA.label == "Murmel") {
				pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block);
			}
			if (pair.bodyB.label == "Murmel") {
				pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block);
			}
		});
	});

	//Looping linke seite
	const openLeft = new PolygonFromSVG(
		world,
		{
			fromFile: "Achterbahn-Looping-links.svg",
			color: "#638781",
			stroke: "#638781", // hides the gaps
			xweight: 0.0,
		},
		{
			isStatic: true,
			friction: 0.0,
			collisionFilter: {
				category: 0b0010,
			},
		}
	);
	blocks.push(openLeft);
	console.log(openLeft);

	//rechte seite Looping
	const openRight = new PolygonFromSVG(
		world,
		{
			fromFile: "Achterbahn-Looping-rechts.svg",
			color: "#638781",
			stroke: "#638781", // hides the gaps
		},
		{
			isStatic: true,
			friction: 0.0,
			collisionFilter: {
				category: 0b0001,
			},
		}
	);
	blocks.push(openRight);

	// the box closes openLeft and opens openRight, hier wird getriggert
	blocks.push(
		new BlockCore(
			world,
			{
				x: 2440,
				y: 215,
				w: 300,
				h: 50,
				color: "yellow",
				trigger: (ball, block) => {
					openLeft.body.collisionFilter.category = 0b0001;
					openRight.body.collisionFilter.category = 0b0010;
				},
			},
			{ isStatic: true, isSensor: true }
		)
	);
	hgWolken = select("#sprite-foregroundWolken");
	hgBerge = select("#sprite-background");
	vg = select("#sprite-foreground");

	// run the engine
	Runner.run(engine);
}

function scrollEndless(point) {
	// wohin muss verschoben werden damit point wenn möglich in der Mitte bleibt
	off = {
		x: Math.min(
			Math.max(0, point.x - windowWidth / 2),
			dim.w - windowWidth
		),
		y: Math.min(
			Math.max(0, point.y - windowHeight / 2),
			dim.h - windowHeight
		),
	};
	// plaziert den Canvas im aktuellen Viewport
	canvasElem.style.left = Math.round(off.x) + "px";
	canvasElem.style.top = Math.round(off.y) + "px";
	// korrigiert die Koordinaten
	translate(-off.x, -off.y);
	// verschiebt den ganzen Viewport
	window.scrollTo(off.x, off.y);
	// Matter mouse needs the offset as well
	mouse.setOffset(off);
}

function keyPressed(event) {
	switch (keyCode) {
		case 32:
			console.log("Space");
			event.preventDefault();
			Matter.Body.applyForce(murmel.body, murmel.body.position, {
				x: 0.2,
				y: -0.2,
			});
			// Matter. Body.scale(murmel.body, 1.5, 1.5);
			break;
		default:
			console.log(keyCode);
	}
}
function drawSparkle(x, y) {
	const sparkleSize = 2;
	const alphaValue = 200;

	for (let i = 0; i < sparkleTrail.length; i++) {
		fill(255, 255, 255, alphaValue);
		noStroke();
		ellipse(sparkleTrail[i].x, sparkleTrail[i].y, sparkleSize, sparkleSize);
	}
	sparkleTrail.push({ x: x, y: y });
	if (sparkleTrail.length > 60) {
		sparkleTrail.splice(0, 1);
	}
}
let lastPos = { x: 0, y: 0 };

function draw() {
	clear();

	//Sound bei Spacetaste
	// if (
	// 	lastPos.x - murmel.body.position.x > 1 ||
	// 	lastPos.y - murmel.body.position.y > 1
	// ) {
	// 	backgroundSound.play();
	// 	console.log("PLAY");
	// } else {
	// 	backgroundSound.stop();
	// 	console.log("STOP");
	// }

	lastPos = { ...murmel.body.position };
	lastPos = { ...murmel.body.position };
	// position canvas and translate coordinates
	scrollEndless(murmel.body.position);

	let newX = murmel.body.position.x + random(-25, 25); //Verschiebung in x-Richtung
	let newY = murmel.body.position.y + random(-40, 30); //Verschiebung in y-Richtung

	swarmHistory.push({ x: newX, y: newY });

	for (let i = 0; i < swarmHistory.length; i++) {
		let sparkleX = swarmHistory[i].x;
		let sparkleY = swarmHistory[i].y;

		drawSparkle(sparkleX, sparkleY);
	}
	if (swarmHistory.length > 5) {
		swarmHistory.splice(0, 1);
	}
	drawSparkle(murmel.body.position.x, murmel.body.position.y);

	// animate attracted blocks
	blocks.forEach((block) => block.draw());
	mouse.draw();
	trampolinA.draw();
	trampolinB.draw();
	trampolinC.draw();
	trampolinD.draw();

	hgWolken.position(off.x * 0, 0);
	hgBerge.position(off.x * 0, 0);
	vg.position(off.x * -0.2, 0);

	translate(off.x, 0);

	Engine.update(engine);
}
