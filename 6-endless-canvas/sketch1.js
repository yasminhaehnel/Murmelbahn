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
let pilzsound;
let kometsound;
let SoundPlatschen;
let WasserfallSound;
let Wasserfall1;
let Wasserfall2;
let Wasserfall3;
let Wasserfall4;

let mouse;
let isDrag = false;
// an array to contain all the blocks created
let blocks = [];
let murmel;
let komet;
let ground;

let riesenrad;
let angle = 0;
let swingStiff;
let polyConnectedA;
let polyConnectedB;
let radius = 200;
let gondel;
let Radbild;

let trampolinA;
let trampolinB;
let trampolinC;
let trampolinD;
let trampolinE;
let trampolinF;
let trampolinG;
let trampolinH;
let trampolinI;
let trampolinJ;
let trampolinK;

let canvasElem;
let off = { x: 0, y: 0 };

let Heißluftballon;
let Mond;
let Stern;
let Komet;
let sparkleTrail = [];
let swarmHistory = [];

let hgWolken;
let hgBerge;
let vg;

function preload() {
	backgroundSound = loadSound("Background-Sound-Murmelbahn.mp3");
	glitzersound = loadSound("Fairy Glitter.wav");
	pilzsound = loadSound("jump sound.mp3");
	kometsound = loadSound("Meteor Crash.mp3");
	SoundPlatschen = loadSound("Splashing Water1.mp3");
	WasserfallSound = loadSound("WasserfallSound.mp3");

	Heißluftballon = loadImage("HeißluftballonMitSeil.png");
	Mond = loadImage("Mond-groß.png");
	Stern = loadImage("Stern.png");
	Pilz1 = loadImage("Pilz1.png");
	Pilz2 = loadImage("Pilz2.png");
	Komet = loadImage("Komet.png");
	Karusellschaukel = loadImage("Karusellschaukel.png");
	Sitzhinten = loadImage("Sitzhinten.png");
	Sitzseite = loadImage("Sitzseite.png");
	Waggons = loadImage("Waggons.png");
	Wasserfall = loadImage("Wasser1.png");
	Radbild = loadImage("RadRiesenrad.png");
	GondelRad = loadImage("Gondel.png");
}

// das ist die Dimension des kompletten Levels
const dim = { w: 12963, h: 720 };

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
		//color: "#C7C6B6",
		//stroke: "#C7C6B6", // hides the gaps
	});
	console.log("OK");
	//new BlocksFromSVG(world, "Heißluftballon.svg", blocks, { isStatic: true });

	// Mond
	murmel = new Ball(
		world,
		{ x: 235, y: 100, r: 40, image: Mond },
		{
			label: "Murmel",
			density: 0.008,
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

	// Mond Halterung
	blocks.push(
		new Block(
			world,
			{
				x: 240,
				y: 140,
				w: 50,
				h: 30,
				//color: "red",
				trigger: (ball, block) => {
					//Backgroundsound abspielen
					backgroundSound.play();
				},

				scale: 0.3,
				offset: { x: 0, y: -80 },
			},
			{
				isStatic: true,
				density: 0.1,
				restitution: 0.2,
				frictionAir: 0.01,
			}
		)
	);

	//Komet Strecke
	ground = new Block(
		world,
		{
			x: 440,
			y: 80,
			w: 440,
			h: 15,
			//color: "orange",
			trigger: (ball, block) => {
				//Crash Sound
				kometsound.play();
			},
		},
		{
			isStatic: true,
			angle: PI / -10,
		}
	);

	//Komet
	komet = new Ball(
		world,
		{
			x: 550,
			y: 20,
			r: 20,
			//color: "red",
			image: Komet,
			isStatic: true,
			scale: 0.3,
			trigger: (ball, block) => {
				Matter.Body.applyForce(ball.body, ball.body.position, {
					x: -0.15,
					y: 0.0,
				});
				Matter.Body.applyForce(block.body, block.body.position, {
					x: 0.1,
					y: -0.05,
				});
				setTimeout(() => {
					console.log("removed", blocks.length);
					blocks = blocks.filter((block) => block != komet);
					Matter.World.remove(world, block.body);
					console.log("removed", blocks.length);
				}, 1000);
			},
		},
		{
			xangle: 0.0,
			frictionAir: 0.0,
			friction: 0.0,
			xlabel: "Murmel",
		}
	);
	blocks.push(komet);

	//////////////////////////////////////////////////////////////////
	//Riesenrad
	riesenrad = new Ball(
		world,
		{
			x: 10280,
			y: 250,
			r: radius,
			//stroke: "white",
			//strokeWeight: 2.5,
			image: Radbild,
			scale: 0.65,
		},
		{ isStatic: false, isSensor: true }
	);

	blocks.push(riesenrad);
	riesenrad.constrainTo(null, {
		pointB: { x: 10280, y: 250 },
		stiffness: 1.0,
		draw: true,
		//color: "yellow",
	});

	//////Gondeln
	cnt = 8;
	for (let i = 0; i < cnt; i++) {
		let x = (radius - 10) * Math.sin(((2 * PI) / cnt) * i);
		let y = (radius - 10) * Math.cos(((2 * PI) / cnt) * i);

		gondel = new Block(
			world,
			{
				x: 10280 + x,
				y: 350 + y,
				w: 60,
				h: 60,
				//color: "white",
				image: GondelRad,
				scale: 0.3,
			},
			{ isStatic: false }
		);
		blocks.push(gondel);

		gondel.constrainTo(riesenrad, {
			pointA: { x: 0, y: -10 },
			pointB: { x: x, y: y },
			length: 10,
			stiffness: 1.0,
			damping: 0.9,
			draw: true,
		});
	}
	/////////////////

	// Stern1, hier wird die Murmel geschubst und erstellt
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
						x: 2.3,
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

	// Stern2, hier wird die Murmel geschubst und erstellt
	blocks.push(
		new Block(
			world,
			{
				x: 5900,
				y: 530,
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

	// Stern3, hier wird die Murmel geschubst und erstellt
	blocks.push(
		new Block(
			world,
			{
				x: 7100,
				y: 490,
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

	//Waggon1 auf Achterbahn
	blocks.push(
		new Block(
			world,
			{
				x: 3820,
				y: 303,
				w: 70,
				h: 20,
				//color: "red",
				image: Waggons,
				scale: 0.5,
				offset: { x: 0, y: -13 },
			},
			{
				isStatic: true,
				angle: Math.PI / 7,
			}
		)
	);

	//Waggon2 auf Achterbahn
	blocks.push(
		new Block(
			world,
			{
				x: 4500,
				y: 313,
				w: 70,
				h: 20,
				//color: "red",
				image: Waggons,
				scale: 0.5,
				offset: { x: 0, y: -17 },
			},
			{
				isStatic: true,
			}
		)
	);

	//Waggon3 auf Achterbahn
	blocks.push(
		new Block(
			world,
			{
				x: 9750,
				y: 325,
				w: 70,
				h: 20,
				//color: "red",
				image: Waggons,
				scale: 0.5,
				offset: { x: 0, y: -16 },
			},
			{
				isStatic: true,
				angle: Math.PI / 9,
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

	//Wände beim Karussel/Pilze

	blocks.push(
		new Block(
			world,
			{
				x: 4790,
				y: 520,
				w: 10,
				h: 200,
				//color: "red",
			},
			{
				isStatic: true,
			}
		)
	);
	//Wand Ballon
	blocks.push(
		new Block(
			world,
			{
				x: 8340,
				y: 480,
				w: 10,
				h: 150,
				//color: "red",
			},
			{
				isStatic: true,
			}
		)
	);
	//Wand2 Ballon
	blocks.push(
		new Block(
			world,
			{
				x: 8655,
				y: 490,
				w: 10,
				h: 150,
				//color: "red",
			},
			{
				isStatic: true,
			}
		)
	);

	//Wand Ende
	blocks.push(
		new Block(
			world,
			{
				x: 12600,
				y: 400,
				w: 30,
				h: 800,
				//color: "blue",
			},
			{
				isStatic: true,
			}
		)
	);

	//Pilz1
	trampolinA = new Block(
		world,
		{
			x: 1450,
			y: 535,
			w: 165,
			h: 19,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "green",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 1.3 }
	);

	//Pilz2
	trampolinB = new Block(
		world,
		{
			x: 1260,
			y: 580,
			w: 100,
			h: 18,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "red",
			offset: { x: 0, y: 27 },
			image: Pilz2,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 1.3 }
	);

	//Pilz3
	trampolinC = new Block(
		world,
		{
			x: 3380,
			y: 530,
			w: 100,
			h: 17,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "orange",
			offset: { x: 0, y: 26 },
			image: Pilz2,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 1.3 }
	);

	//Pilz4
	trampolinD = new Block(
		world,
		{
			x: 3200,
			y: 500,
			w: 165,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 1.3 }
	);

	//Pilz5
	trampolinE = new Block(
		world,
		{
			x: 4880,
			y: 600,
			w: 100,
			h: 17,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "orange",
			offset: { x: 0, y: 26 },
			image: Pilz2,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);

	//Pilz6
	trampolinF = new Block(
		world,
		{
			x: 5000,
			y: 600,
			w: 165,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);

	//Pilz7
	trampolinG = new Block(
		world,
		{
			x: 5150,
			y: 600,
			w: 165,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);
	//Pilz8
	trampolinH = new Block(
		world,
		{
			x: 5300,
			y: 600,
			w: 100,
			h: 17,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "orange",
			offset: { x: 0, y: 26 },
			image: Pilz2,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);
	//Pilz9
	trampolinI = new Block(
		world,
		{
			x: 5450,
			y: 600,
			w: 165,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);
	//Pilz 10
	trampolinJ = new Block(
		world,
		{
			x: 5560,
			y: 600,
			w: 100,
			h: 17,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "orange",
			offset: { x: 0, y: 26 },
			image: Pilz2,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);
	//Pilz11
	trampolinK = new Block(
		world,
		{
			x: 5700,
			y: 605,
			w: 165,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: 47 },
			image: Pilz1,
			scale: 0.3,
		},
		{ isStatic: true, restitution: 0.9 }
	);

	//Plattform für Ballon
	ballon = new Block(
		world,
		{
			x: 8500,
			y: 540,
			w: 300,
			h: 20,
			trigger: (ball, block) => {
				//Backgroundsound abspielen
				// pilzsound.play();
			},
			//color: "blue",
			offset: { x: 0, y: -120 },
			image: Heißluftballon,
			scale: 0.6,
		},
		{ isStatic: true, restitution: 2.5 }
	);

	blocks.push(ballon);
	function update() {
		blocks.forEach((block) => {
			block.update();
		});
	}

	//Karusell///////////////////////////////////////////////////////////
	//Schaukel_1
	swingStiff = new Block(world, {
		x: 4870,
		y: 185,
		w: 100,
		h: 40,
		//color: "white",
		image: Karusellschaukel,
		offset: { x: 0, y: -10 },
		scale: 1.06,
	});
	swingStiff.constrainTo(null, {
		pointA: { x: -48, y: 0 },
		length: 250,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});
	swingStiff.constrainTo(null, {
		pointA: { x: 48, y: 0 },
		length: 250,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});

	//Schaukel_2
	swingStiff2 = new Block(world, {
		x: 5040,
		y: 185,
		w: 80,
		h: 40,
		//color: "white",
		image: Sitzseite,
		offset: { x: 5, y: -10 },
		scale: 1.1,
	});
	swingStiff2.constrainTo(null, {
		pointA: { x: -40, y: 0 },
		length: 320,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});
	swingStiff2.constrainTo(null, {
		pointA: { x: 40, y: 0 },
		length: 320,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});

	//Schaukel_3
	swingStiff3 = new Block(world, {
		x: 5210,
		y: 185,
		w: 80,
		h: 40,
		//color: "white",
		image: Sitzseite,
		offset: { x: 5, y: -10 },
		scale: 1.06,
	});
	swingStiff3.constrainTo(null, {
		pointA: { x: -40, y: 0 },
		length: 320,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});
	swingStiff3.constrainTo(null, {
		pointA: { x: 40, y: 0 },
		length: 320,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});

	//Schaukel4
	swingStiff4 = new Block(world, {
		x: 5380,
		y: 185,
		w: 100,
		h: 40,
		//color: "white",
		image: Sitzhinten,
		offset: { x: 0, y: -10 },
		scale: 1.06,
	});
	swingStiff4.constrainTo(null, {
		pointA: { x: -48, y: 0 },
		length: 250,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});
	swingStiff4.constrainTo(null, {
		pointA: { x: 48, y: 0 },
		length: 250,
		stiffness: 0.05,
		damping: 0.2,
		color: "#14A39A",
		draw: true,
	});
	/////////////////////////////////////////////////////////////////////////

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
			color: "red",
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
			color: "blue",
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

	/////////////////////////////////////////////////////////////Looping2
	//Looping linke seite2
	const openLeft2 = new PolygonFromSVG(
		world,
		{
			fromFile: "Achterbahn-Looping-links2.svg",
			color: "red",
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
	blocks.push(openLeft2);
	console.log(openLeft2);

	//rechte seite Looping2
	const openRight2 = new PolygonFromSVG(
		world,
		{
			fromFile: "Achterbahn-Looping-rechts2.svg",
			color: "blue",
		},
		{
			isStatic: true,
			friction: 0.0,
			collisionFilter: {
				category: 0b0001,
			},
		}
	);
	blocks.push(openRight2);
	/////////////////////////////////////////////////////Ende Looping2

	// Trigger für Looping1
	blocks.push(
		new BlockCore(
			world,
			{
				x: 2440,
				y: 215,
				w: 300,
				h: 50,
				//color: "yellow",
				trigger: (ball, block) => {
					openLeft.body.collisionFilter.category = 0b0001;
					openRight.body.collisionFilter.category = 0b0010;
				},
			},
			{ isStatic: true, isSensor: true }
		)
	);

	//Trigger für Looping2
	blocks.push(
		new BlockCore(
			world,
			{
				x: 7280,
				y: 280,
				w: 300,
				h: 50,
				//color: "yellow",
				trigger: (ball, block) => {
					openLeft2.body.collisionFilter.category = 0b0001;
					openRight2.body.collisionFilter.category = 0b0010;
				},
			},
			{ isStatic: true, isSensor: true }
		)
	);

	//////////////////////////////////////////////////////////Sound für Wasserfall
	blocks.push(
		new Block(
			world,
			{
				x: 10030,
				y: 490,
				w: 100,
				h: 30,
				//color: "red",
				trigger: (ball, block) => {
					//Backgroundsound abspielen
					WasserfallSound.play();
				},

				scale: 0.3,
				offset: { x: 0, y: -80 },
			},
			{
				isStatic: true,
			}
		)
	);

	//////////////////////////////////////////////////////////Sound für Wasserplatschen
	blocks.push(
		new Block(
			world,
			{
				x: 12350,
				y: 500,
				w: 50,
				h: 30,
				//color: "red",
				trigger: (ball, block) => {
					//Backgroundsound abspielen
					SoundPlatschen.play();
				},

				scale: 0.3,
				offset: { x: 0, y: -80 },
			},
			{
				isStatic: true,
			}
		)
	);

	// ///////////// Wasser
	// blocks.push(
	// 	new Block(
	// 		world,
	// 		{
	// 			x: 13100,
	// 			y: 100,
	// 			w: 60,
	// 			h: 60,
	// 			image: Wasserfall,
	// 			scale: 0.1,
	// 		 }
	// 	)
	// );
	//Plattform für Wasserfall 1
	Wasserfall1 = new Block(
		world,
		{
			x: 12350,
			y: 510,
			w: 60,
			h: 60,
			//trigger: (ball, block) => {
			//Backgroundsound abspielen
			// pilzsound.play();
			//},
			//color: "blue",
			//offset: { x: 0, y: -120 },
			image: Wasserfall,
			scale: 0.1,
		},
		{ isStatic: true, isSensor: true }
	);

	blocks.push(Wasserfall1);
	function update() {
		blocks.forEach((block) => {
			block.update();
		});
	}
	//Plattform für Wasserfall   2
	Wasserfall2 = new Block(
		world,
		{
			x: 12400,
			y: 510,
			w: 60,
			h: 60,
			//trigger: (ball, block) => {
			//Backgroundsound abspielen
			// pilzsound.play();
			//},
			//color: "blue",
			//offset: { x: 0, y: -120 },
			image: Wasserfall,
			scale: 0.07,
		},
		{ isStatic: true, isSensor: true }
	);

	blocks.push(Wasserfall2);
	function update() {
		blocks.forEach((block) => {
			block.update();
		});
	}
	//Plattform für Wasserfall   3
	Wasserfall3 = new Block(
		world,
		{
			x: 12450,
			y: 510,
			w: 60,
			h: 60,
			//trigger: (ball, block) => {
			//Backgroundsound abspielen
			// pilzsound.play();
			//},
			//color: "blue",
			//offset: { x: 0, y: -120 },
			image: Wasserfall,
			scale: 0.08,
		},
		{ isStatic: true, isSensor: true }
	);
	blocks.push(Wasserfall3);
	function update() {
		blocks.forEach((block) => {
			block.update();
		});
	}

	//Plattform für Wasserfall   4
	Wasserfall4 = new Block(
		world,
		{
			x: 12500,
			y: 510,
			w: 60,
			h: 60,
			//trigger: (ball, block) => {
			//Backgroundsound abspielen
			// pilzsound.play();
			//},
			//color: "blue",
			//offset: { x: 0, y: -120 },
			image: Wasserfall,
			scale: 0.1,
		},
		{ isStatic: true, isSensor: true }
	);

	blocks.push(Wasserfall4);
	function update() {
		blocks.forEach((block) => {
			block.update();
		});
	}

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
let ballonMove = { x: 0.1, y: 0.1 };
let Wasserfall1Move = { x: 0.1, y: 0.1 };
let Wasserfall2Move = { x: -0.09, y: -0.09 };
let Wasserfall3Move = { x: 0.1, y: 0.1 };
let Wasserfall4Move = { x: -0.09, y: -0.09 };

function draw() {
	clear();

	lastPos = { ...murmel.body.position };
	lastPos = { ...murmel.body.position };
	// position canvas and translate coordinates
	scrollEndless(murmel.body.position);

	// //Komet fällt gerade
	// Matter.Body.setAngle(komet.body, 0);
	// komet.draw();

	let newX = murmel.body.position.x + random(-25, 25); //Verschiebung in x-Richtung
	let newY = murmel.body.position.y + random(-40, 30); //Verschiebung in y-Richtung

	//Glitzereffekt
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

	//Ballon Bewegung
	if (frameCount % 90 == 5) {
		ballonMove.x = -ballonMove.x;
	}
	if (frameCount % 50 == 0) {
		ballonMove.y = -ballonMove.y;
	}
	ballon.body.position.x += ballonMove.x;
	ballon.body.position.y += ballonMove.y;

	//Wasserfall1 Bewegung 1
	if (frameCount % 90 == 5) {
		Wasserfall1Move.x = -Wasserfall1Move.x;
	}
	if (frameCount % 50 == 0) {
		Wasserfall1Move.y = -Wasserfall1Move.y;
	}
	Wasserfall1.body.position.x += Wasserfall1Move.x;
	Wasserfall1.body.position.y += Wasserfall1Move.y;

	//Wasserfall Bewegung 2
	if (frameCount % 90 == 5) {
		Wasserfall2Move.x = -Wasserfall2Move.x;
	}
	if (frameCount % 50 == 0) {
		Wasserfall2Move.y = -Wasserfall2Move.y;
	}
	Wasserfall2.body.position.x += Wasserfall2Move.x;
	Wasserfall2.body.position.y += Wasserfall2Move.y;

	//Wasserfall Bewegung 3
	if (frameCount % 90 == 5) {
		Wasserfall3Move.x = -Wasserfall3Move.x;
	}
	if (frameCount % 50 == 0) {
		Wasserfall3Move.y = -Wasserfall3Move.y;
	}
	Wasserfall3.body.position.x += Wasserfall3Move.x;
	Wasserfall3.body.position.y += Wasserfall3Move.y;

	//Wasserfall Bewegung 4
	if (frameCount % 90 == 5) {
		Wasserfall4Move.x = -Wasserfall4Move.x;
	}
	if (frameCount % 50 == 0) {
		Wasserfall4Move.y = -Wasserfall4Move.y;
	}
	Wasserfall4.body.position.x += Wasserfall4Move.x;
	Wasserfall4.body.position.y += Wasserfall4Move.y;

	// animate attracted blocks
	blocks.forEach((block) => block.draw());
	mouse.draw();
	trampolinA.draw();
	trampolinB.draw();
	trampolinC.draw();
	trampolinD.draw();
	trampolinE.draw();
	trampolinF.draw();
	trampolinG.draw();
	trampolinH.draw();
	trampolinI.draw();
	trampolinJ.draw();
	trampolinK.draw();

	//Karusell
	swingStiff.draw();
	swingStiff2.draw();
	swingStiff3.draw();
	swingStiff4.draw();

	//Riesenrad
	Matter.Body.setAngle(riesenrad.body, angle);
	// Matter.Body.setAngularVelocity(riesenrad.body, 0.15);
	angle += 0.01;
	riesenrad.draw();
	gondel.draw();
	// polyConnectedA.drawConstraints();

	//Gondel Riesenrad
	// swingStiff.draw();
	// swingStiff.drawConstraints();

	//Fläche für Komet
	ground.draw();

	hgWolken.position(off.x * 0, 0);
	hgBerge.position(off.x * 0, 0);
	vg.position(off.x * -0.2, 0);

	translate(off.x, 0);

	// Engine.update(engine);
}
