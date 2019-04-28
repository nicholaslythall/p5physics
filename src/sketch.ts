import { Vector } from "./vector"
import { Body } from "./body"
import { Shape, Circle, Polygon, SHAPE_DEBUG } from "./shapes"
import { Manifold } from "./collisions"
import p5 = require("p5");

export const sketch = (p: p5) => {

  const fps = 60
  const dt = 1 / fps
  let frameStart = 0
  let accumulator = 0

  const bodies: Body[] = []

  const gravity = new Vector(0, 100)

  function randomScene() {
    const width = p.width
    const height = p.height
    const random = p.random

    let wall = new Body(Polygon.rect(width, 50), 0)
    wall.position = new Vector(width / 2, height - 25)
    bodies.push(wall)

    wall = new Body(Polygon.rect(width, 50), 0)
    wall.position = new Vector(width / 2, 25)
    bodies.push(wall)

    wall = new Body(Polygon.rect(50, height), 0)
    wall.position = new Vector(25, height / 2)
    bodies.push(wall)

    wall = new Body(Polygon.rect(50, height), 0)
    wall.position = new Vector(width - 25, height / 2)
    bodies.push(wall)

    for (let i = 0; i < 20; i++) {
      let position = new Vector(random(100, width - 200), random(100, height - 200))

      let shape: Shape
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

  p.setup = function () {
    p.ellipseMode(p.RADIUS)
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(fps)

    Circle.prototype.draw = function () {
      p.ellipse(0, 0, this.radius)
      if (SHAPE_DEBUG) {
        p.line(0, 0, this.radius, 0)
      }
    }

    Polygon.prototype.draw = function () {
      p.beginShape()
      for (let v of this.vertices) {
        p.vertex(v.x, v.y)
      }
      p.endShape(p.CLOSE)
    }

    randomScene()
  }

  p.draw = function () {
    p.background(220)

    let currentTime = p.millis() / 1000
    accumulator += currentTime - frameStart
    frameStart = currentTime

    while (accumulator > dt) {
      updatePhysics(dt)
      accumulator -= dt
    }

    bodies.forEach(body => {
      p.push()
      p.translate(body.position.x, body.position.y)
      p.rotate(body.orientation)

      p.noFill()
      p.stroke(0)
      body.draw()
      p.pop()
    })
  }

  let springBody: Body | null = null
  let springPos: Vector | null = null

  function updatePhysics(dt: number) {
    // Generate new collision info
    let contacts: Manifold[] = []
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

    if (p.mouseIsPressed) {
      let mouse = new Vector(p.mouseX, p.mouseY)
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

    if (springBody !== null && springPos !== null) {
      let pos = springBody.position
      let a = springPos.rotate(springBody.orientation).add(springBody.position)
      let delta = new Vector(p.mouseX, p.mouseY).sub(a)
      let force = delta.mult(100)
      let damping = springBody.velocity.mult(50)
      springBody.applyImpulse(force.sub(damping), a.sub(springBody.position))
      p.push()
      p.noFill()
      p.stroke("#FF0")
      p.line(a.x, a.y, p.mouseX, p.mouseY)
      p.ellipse(a.x, a.y, 10)
      p.pop()
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
    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < contacts.length; i++) {
        contacts[i].applyImpulse()
      }
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
}