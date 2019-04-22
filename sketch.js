let fps = 30
let dt = 1 / fps
let frameStart = 0
let accumulator = 0

let bodies = []


const gravity = new Vector(0, 100)

let mouseBody

function testScene() {
  // for (let i = 100; i < width; i += 100) {
  mouseBody = new Body(Polygon.rect(60, 60))
  // mouseBody = new Body(new Circle(30))
  mouseBody.position = new Vector(0, height / 2)
  mouseBody.applyImpulse(new Vector(0, 10), new Vector(0, 0))
  // mouseBody.orientation = PI / 4
  bodies.push(mouseBody)
  // }

  let circle2 = new Body(Polygon.rect(width, 50), 0)
  circle2.position = new Vector(width / 2, height / 2 + 200)

  bodies.push(circle2)

}

Object.prototype.let = function(block) {
  block(this)
  return this
}

function randomScene() {
  bodies.push(new Body(Polygon.rect(width, 50), 0).let(it => {
    it.position.x = width / 2
    it.position.y = height - 25
  }))
  
  bodies.push(new Body(Polygon.rect(width, 50), 0).let(it => {
    it.position.x = width / 2
    it.position.y = 25
  }))
  
  bodies.push(new Body(Polygon.rect(50, height), 0).let(it => {
    it.position.x = 25
    it.position.y = height / 2
  }))
  
  bodies.push(new Body(Polygon.rect(50, height), 0).let(it => {
    it.position.x = width - 25
    it.position.y = height / 2
  }))
  
  for (let i = 0; i < 20; i++) {
    let position = new Vector(random(100, width - 200), random(100, height - 200))

    let shape
    let r = random(2) | 0
    if (r == 0) {
    shape = new Circle(random(25, 50))
    } else {
      shape = Polygon.rect(random(50, 100), random(50, 100))
    }

    let body = new Body(shape)
    body.position = position
    // body.orientation = random(-PI, PI)

    let velocity = new Vector(random(-80, 80), random(-80, 80))
    body.velocity = velocity

    bodies.push(body)
  }
}

function setup() {
  ellipseMode(RADIUS)
  createCanvas(windowWidth, windowHeight);
  frameRate(fps)

  // testScene()
  randomScene()
}

function draw() {
  background(220)

  let currentTime = millis() / 1000
  accumulator += currentTime - frameStart
  frameStart = currentTime

  while (accumulator > dt) {
    updatePhysics(dt)
    accumulator -= dt
  }

  bodies.forEach(body => {
    body.draw()
  })
}

let springBody = null
let springPos = null

function updatePhysics(dt) {
  // Generate new collision info
  let contacts = []
  for (let i = 0; i < bodies.length; i++) {
    let a = bodies[i]

    for (let j = i + 1; j < bodies.length; j++) {
      let b = bodies[j]

      if (a.invMass == 0 && b.invMass == 0) {
        continue
      }

      let manifold = new Manifold(a, b)
      manifold.solve()
      if (manifold.contactCount > 0) {
        contacts.push(manifold)
      }
    }
  }

  if (mouseIsPressed) {
    let mouse = new Vector(mouseX, mouseY)
    if (springBody == null) {
      for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i]
        if (body.isPointInside(mouse)) {
          springBody = body
          springPos = mouse.sub(body.position).rotate(-body.orientation)
          break
        }
      }
    }
  } else {
    springBody = null
  }
    
  if (springBody !== null) {
    let pos = springBody.position
    let a = springPos.rotate(springBody.orientation).add(springBody.position)
    let delta = new Vector(mouseX, mouseY).sub(a)
    let force = delta.mult(100)
    let damping = springBody.velocity.mult(50)
    springBody.applyImpulse(force.sub(damping), a.sub(springBody.position))
    push()
    noFill()
    stroke("#FF0")
    line(a.x, a.y, mouseX, mouseY)
    ellipse(a.x, a.y, 10)
    pop()
  }
    
  // Integrate forces
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i]
    if (body.invMass === 0) {
      continue
    }

    let dts = dt * 0.5

    body.velocity = body.velocity.add(body.force.mult(body.invMass * dts))
    body.velocity = body.velocity.add(gravity.mult(dts))
    body.angularVelocity += body.torque * body.invInertia * dts
  }

  // Initialize collision
  for (let i = 0; i < contacts.length; i++) {
    contacts[i].initialize()
  }

  // Solve collision
  for (let i = 0; i < contacts.length; i++) {
    contacts[i].applyImpulse()
  }

  // Integrate velocities
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i]
    if (body.invMass === 0.0) {
      continue
    }

    body.position = body.position.add(body.velocity.mult(dt))
    body.orientation += body.angularVelocity * dt

    let dts = dt * 0.5

    body.velocity = body.velocity.add(body.force.mult(body.invMass * dts))
    body.velocity = body.velocity.add(gravity.mult(dts))
    body.angularVelocity += body.torque * body.invInertia * dts
  }

  // Correct Positions
  for (let i = 0; i < contacts.length; i++) {
    contacts[i].positionalCorrection();
  }
    
  // Clear all forces
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i]
    body.force.x = 0
    body.force.y = 0
    body.torque = 0
  }
}