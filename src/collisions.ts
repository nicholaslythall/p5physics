import { Vector } from "./vector"
import { Body } from "./body"
import { SHAPE_COUNT } from "./shapes"
import { CollisionHandler } from "./CollisionHandler";
import { CollisionCircleCircle } from "./collision_circle_circle";
import { CollisionPolygonCircle, CollisionCirclePolygon, EPSILON } from "./collision_circle_polygon";
import { CollisionPolygonPolygon } from "./collision_polygon_polygon";

const CR: (CollisionHandler | null)[] = [
  null, null, null,
  null, new CollisionCircleCircle(), new CollisionCirclePolygon(),
  null, new CollisionPolygonCircle(), new CollisionPolygonPolygon()
]

const min = Math.min
const max = Math.max
const sqrt = Math.sqrt
const sq = (x: number) => x * x

const PENETRATION_ALLOWANCE = 0.05
const PENETRATION_CORRECTION = 0.4

export class Manifold {
  a: Body
  b: Body
  penetration: number
  normal: Vector
  contacts: Vector[]
  contactCount: number
  e: number
  dynamicFriction: number
  staticFriction: number

  constructor(a: Body, b: Body) {
    this.a = a
    this.b = b
    this.penetration = 0
    this.normal = new Vector()
    this.contacts = []
    this.contactCount = 0
    this.e = 0
    this.dynamicFriction = 0
    this.staticFriction = 0
  }

  solve() {
    let aShape = this.a.shape.type
    let bShape = this.b.shape.type

    let handler = CR[aShape * SHAPE_COUNT + bShape]
    if (handler !== null) {
      handler.handleCollision(this, this.a, this.b)
    } else {
      throw new Error(`No handler for types ${aShape} and ${bShape}`)
    }
  }

  initialize() {
    // Calculate average restitution
    this.e = min(this.a.restitution, this.b.restitution)

    // Calculate static and dynamic friction
    this.staticFriction = sqrt(sq(this.a.staticFriction) + sq(this.b.staticFriction))
    this.dynamicFriction = sqrt(sq(this.a.dynamicFriction) + sq(this.b.dynamicFriction))

    for (let i = 0; i < this.contacts.length; i++) {
      // calculate radii from center of mass to contact
      let ra = this.contacts[i].sub(this.a.position)
      let rb = this.contacts[i].sub(this.b.position)

      let rv = this.b.velocity.add(rb.scalarCross(this.b.angularVelocity))
        .sub(this.a.velocity).sub(ra.scalarCross(this.a.angularVelocity))

      // GRAVITY NO BOUNCE
      if (rv.lengthSquared() < new Vector(0, 4).mult(1 / 30).lengthSquared() + 0.0001) {
        this.e = 0
      }
    }
  }

  applyImpulse() {
    let a = this.a
    let b = this.b

    if (a.invMass === 0 && b.invMass === 0) {
      a.velocity = new Vector()
      b.velocity = new Vector()
    }

    for (let i = 0; i < this.contacts.length; i++) {
      let ra = this.contacts[i].sub(this.a.position)
      let rb = this.contacts[i].sub(this.b.position)

      let rv = this.b.velocity.add(rb.scalarCross(this.b.angularVelocity))
        .sub(this.a.velocity).sub(ra.scalarCross(this.a.angularVelocity))

      let contactVelocity = rv.dot(this.normal)

      if (contactVelocity > 0) {
        return
      }

      let raCrossN = ra.cross(this.normal)
      let rbCrossN = rb.cross(this.normal)
      let invMassSum = a.invMass + b.invMass +
        (raCrossN * raCrossN) * a.invInertia +
        (rbCrossN * rbCrossN) * b.invInertia

      // Calculate impulse scalar
      let j = -(1.0 + this.e) * contactVelocity
      j /= invMassSum
      j /= this.contacts.length

      // Apply impulse
      let impulse = this.normal.mult(j)
      a.applyImpulse(impulse.neg(), ra)
      b.applyImpulse(impulse, rb)

      // Friction impulse
      let t = rv.add(this.normal.mult(rv.dot(this.normal))).unit()

      let jt = rv.dot(t)
      jt /= invMassSum
      jt /= this.contactCount

      // Don't apply tiny friction impulses
      if (Math.abs(jt) < EPSILON) {
        return
      }

      // Coulumb's law
      let tangentImpulse
      if (Math.abs(jt) < j * this.staticFriction) {
        tangentImpulse = t.mult(jt)
      } else {
        tangentImpulse = t.mult(-j * this.dynamicFriction)
      }

      this.a.applyImpulse(tangentImpulse.neg(), ra)
      this.b.applyImpulse(tangentImpulse, rb)
    }
  }

  positionalCorrection() {
    let correction = max(this.penetration - PENETRATION_ALLOWANCE, 0) /
      (this.a.invMass + this.b.invMass) * PENETRATION_CORRECTION

    this.a.position = this.a.position.add(this.normal.mult(-this.a.invMass * correction))
    this.b.position = this.b.position.add(this.normal.mult(this.b.invMass * correction))
  }
}
