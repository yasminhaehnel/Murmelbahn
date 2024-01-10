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
let fux, fuxImg;
let canvasElem;
let off = { x: 0, y: 0 };

// das ist die Dimension des kompletten Levels 
const dim = { w: 3840, h: 2160 };

// body.collisionFilter = {
//   'group': -1, // default 0
//   'category': 2, // default 1, values 0x0001,0x0002,0x0004,0x0008,0x0010,0x0020,0x0040,0x0080
//   'mask': 0,
// };
// If the two bodies have the same non-zero value of collisionFilter.group, they will always collide if the value is positive, and they will never collide if the value is negative.
// Using the category/mask rules, two bodies A and B collide if each includes the other's category in its mask, i.e. (categoryA & maskB) !== 0 and (categoryB & maskA) !== 0 are both true.

function preload() {
  fuxImg = loadImage('fux.png');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('thecanvas');

  // Das ist nötig für den 'Endless Canvas'
  canvasElem = document.getElementById('thecanvas');

  engine = Engine.create();
  world = engine.world;

  new BlocksFromSVG(world, 'static.svg', blocks, { isStatic: true }); //brauch man evtl

  fux = new PolygonFromSVG(
    world, {
    x: 400,
    y: 150,
    fromFile: 'fux.svg',
    image: fuxImg,
    color: 'yellow',
    trigger: (ball, block) => {
      Matter.Body.applyForce(ball.body, ball.body.position, { x: 0.1, y: -0.1 });
    }
  }, { isStatic: true, restitution: 1.0, friction: 0.0 }
  )
  blocks.push(fux);

  // the box triggers a function on collisions
  blocks.push(new BlockCore(world,
    {
      x: 200, y: 200, w: 60, h: 60, color: 'blue',
      trigger: (ball, block) => { ball.attributes.color = color(Math.random() * 256, Math.random() * 256, Math.random() * 256); }
    },
    { isStatic: false, density: 0.05, restitution: 0.5, frictionAir: 0.01 }
  ));

  //das brauchen wir im code in function setup
  // const openLeft = new PolygonFromSVG(
  //   world, {
  //   fromFile: 'openL.svg',
  //   color: '#638781',
  //   stroke: '#638781', // hides the gaps
  //   weight: 0.0
  // }, {
  //   isStatic: true, friction: 0.0,
  //   collisionFilter: {
  //     category: 0b0010
  //   }
  // });
  // blocks.push(openLeft);

  //das hier auch 
  // const openRight = new PolygonFromSVG(
  //   world, {
  //   fromFile: 'openR.svg',
  //   color: '#638781',
  //   stroke: '#638781', // hides the gaps
  // }, {
  //   isStatic: true, friction: 0.0,
  //   collisionFilter: {
  //     category: 0b0001
  //   }
  // });
  // blocks.push(openRight);

  // the box closes openLeft and opens openRight, dass hier auch 
  // blocks.push(new BlockCore(world,
  //   {
  //     x: 1800, y: 400, w: 600, h: 50, color: 'yellow',
  //     trigger: (ball, block) => {
  //       ball.attributes.color = color(Math.random() * 256, Math.random() * 256, Math.random() * 256);
  //       openLeft.body.collisionFilter.category = 0b0001;
  //       openRight.body.collisionFilter.category = 0b0010;
  //     }
  //   },
  //   { isStatic: true, isSensor: true }
  // ));

  // the ball has a label and can react on collisions
  murmel = new Ball(world,
    { x: 300, y: 100, r: 25, color: 'green' },
    {
      label: "Murmel", density: 0.004, restitution: 0.2, friction: 0.0, frictionAir: 0.0,
      // collisionFilter: {
      //   category: 0b0001,
      //   mask: 0b0001
      // } -muss zu murmel rein unter label etc wie ihier 
    }
  );
  blocks.push(murmel);

  // add a mouse so that we can manipulate Matter objects
  mouse = new Mouse(engine, canvas, { stroke: 'blue', strokeWeight: 3 });

  // process mouseup events in order to drag objects or add more balls
  mouse.on("startdrag", evt => {
    isDrag = true;
  });
  mouse.on("mouseup", evt => {
    if (!isDrag) {
      let ball = new Ball(world, { x: off.x + evt.mouse.position.x, y: off.y + evt.mouse.position.y, r: 15, color: 'yellow' }, { isStatic: false, restitution: 0.9, label: 'Murmel' });
      blocks.push(ball);
    }
    isDrag = false;
  });

  // process collisions - check whether block "Murmel" hits another Block
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;
    pairs.forEach((pair, i) => {
      if (pair.bodyA.label == 'Murmel') {
        pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block)
      }
      if (pair.bodyB.label == 'Murmel') {
        pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block)
      }
    })
  })

  // run the engine
  Runner.run(engine);
}

function scrollEndless(point) {
  // wohin muss verschoben werden damit point wenn möglich in der Mitte bleibt
  off = { x: Math.min(Math.max(0, point.x - windowWidth / 2), dim.w - windowWidth), y: Math.min(Math.max(0, point.y - windowHeight / 2), dim.h - windowHeight) };
  // plaziert den Canvas im aktuellen Viewport
  canvasElem.style.left = Math.round(off.x) + 'px';
  canvasElem.style.top = Math.round(off.y) + 'px';
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
      if (!murmel) {
        murmel = new Ball(world,
          { x: 300, y: 100, r: 25, color: 'green' },
          { label: "Murmel", density: 0.004, restitution: 0.8, friction: 0.0, frictionAir: 0.0 }
        );
        blocks.push(murmel);
      }
      console.log("Space");
      event.preventDefault();
      Matter.Body.applyForce(murmel.body, murmel.body.position, { x: 0.5, y: 0.0 });
      // Matter. Body.scale(murmel.body, 1.5, 1.5);
      break;
    default:
      console.log(keyCode);
  }
}

function draw() {
  clear();

  // position canvas and translate coordinates
  if (murmel) {
    scrollEndless(murmel.body.position);
  } else {
    scrollEndless({ x: 100, y: 100 });
  }

  // animate attracted blocks
  blocks.forEach(block => block.draw());
  mouse.draw();
}
