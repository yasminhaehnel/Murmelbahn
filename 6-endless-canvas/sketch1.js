const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const World = Matter.World;

// the Matter engine to animate the world
let engine;
let world;
let mouse;
let isDrag = false;
// an array to contain all the blocks created
let blocks = [];
let murmel;
let trampolineA;
let trampolinB;

let canvasElem;
let off = { x: 0, y: 0 };

let Heißluftballon;

function preload() {
	Heißluftballon = loadImage("Heißluftballon.png");
}

// das ist die Dimension des kompletten Levels
const dim = { w: 3240, h: 720 };

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("thecanvas");
	noStroke();
	// Das ist nötig für den 'Endless Canvas'
	canvasElem = document.getElementById("thecanvas");

	engine = Engine.create();
	world = engine.world;

	new BlocksFromSVG(world, "Achterbahn.svg", blocks, { isStatic: true });
	//new BlocksFromSVG(world, "Heißluftballon.svg", blocks, { isStatic: true });

	// the ball has a label and can react on collisions
	murmel = new Ball(
		world,
		{ x: 235, y: 100, r: 25, color: "Black" },
		{
			label: "Murmel",
			density: 0.005,
			restitution: 0.25,
			friction: 0.5,
			frictionAir: 0.0,
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
				color: "blue",
				trigger: (ball, block) => {
					ball.attributes.color = color(
						Math.random() * 256,
						Math.random() * 256,
						Math.random() * 256
					);
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
  blocks.push(
    new BlockCore(
      world,
      {
        x: 400,
        y: 400,
        w: 60,
        h: 60,
        color: "blue",
        trigger: (ball, block) => {
          ball.attributes.color = color(
            Math.random() * 256,
            Math.random() * 256,
            Math.random() * 256
          );
          Matter.Body.setDensity(murmel.body, 0.019);
        },
      },
      { isStatic: true, isSensor: true, density: 0.05, restitution: 0.5, frictionAir: 0.01 }
    )
  );
  

	trampolineA = new Block(
		world,
		{ x: 1380, y: 650, w: 120, h: 20, color: "red" },
		{ isStatic: true, restitution: 1.3 }
	);
	trampolineB = new Block(
		world,
		{ x: 1240, y: 680, w: 80, h: 20, color: "red" },
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

function draw() {
	clear();

	// position canvas and translate coordinates
	scrollEndless(murmel.body.position);

	// animate attracted blocks
	blocks.forEach((block) => block.draw());
	mouse.draw();
	trampolineA.draw();
	trampolineB.draw();
}
