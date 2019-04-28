import { Vector } from "./vector"
import { Shape } from "./shapes"
import { unqiueId } from "./util"

export class Body {
  id: number
  position: Vector
  velocity: Vector
  force: Vector

  orientation: number
  angularVelocity: number
  torque: number

  shape: Shape
  staticFriction = 0.5
  dynamicFriction = 0.3
  restitution: number

  mass: number = 0
  invMass: number = 0
  inertia: number = 0
  invInertia: number = 0

  constructor(shape: Shape, density?: number) {
    this.id = unqiueId()

    this.position = new Vector()
    this.velocity = new Vector()
    this.force = new Vector()

    this.orientation = 0
    this.angularVelocity = 0
    this.torque = 0

    this.shape = shape
    this.shape.computeMass(this, (density == undefined) ? 0.1 : density)

    this.restitution = 0.7
  }

  applyForce(force: Vector) {
    this.force = this.force.add(force)
  }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this.velocity = this.velocity.add(impulse.mult(this.invMass))
    this.angularVelocity += this.invInertia * contactVector.cross(impulse)
  }

  isPointInside(point: Vector) {
    let bodyPoint = point.sub(this.position).rotate(-this.orientation)
    return this.shape.isInside(bodyPoint)
  }

  update(dt: number) {
    this.velocity = this.velocity.add(this.force.mult(this.invMass).mult(dt))
    this.position = this.position.add(this.velocity.mult(dt))
    this.force = new Vector()

    this.angularVelocity = this.torque * this.invInertia * dt
    this.orientation += this.angularVelocity * dt
    this.torque = 0
  }

  draw() {
    this.shape.draw()
  }
}