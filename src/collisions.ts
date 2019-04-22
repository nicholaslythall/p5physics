const CR = [
  null, null, null,
  null, new CollisionCircleCircle(), new CollisionCirclePolygon(),
  null, new CollisionPolygonCircle(), new CollisionPolygonPolygon()
]

class Manifold {
  constructor(a, b) {
    this.a = a
    this.b = b
    this.penetration = 0
    this.normal = new Vector()
    this.contacts = []
    this.contactCount = 0
    this.e = 0
    this.df = 0
    this.sf = 0
  }
  
  solve() {
    let aShape = this.a.shape.type
    let bShape = this.b.shape.type
    
    let handler = CR[aShape * SHAPE_COUNT + bShape]
    handler.handleCollision(this, this.a, this.b)
  }
  
  initialize() {
    this.e = min(this.a.restitution, this.b.restitution)
    for (let i = 0; i < this.contacts.count; i++) {
      // calculate radii from center of mass to contact
      let ra = contacts[i].sub(this.a.position)
      let rb = contacts[i].sub(this.b.position)
      
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
      print("here")
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
    }
  }
    
  positionalCorrection() {
    let correction = max(this.penetration - PENETRATION_ALLOWANCE) /
        (this.a.invMass + this.b.invMass) * PENETRATION_CORRECTION
    
    this.a.position = this.a.position.add(this.normal.mult(-this.a.invMass * correction))
    this.b.position = this.b.position.add(this.normal.mult(this.b.invMass * correction))
  }
}

const PENETRATION_ALLOWANCE = 0.05
const PENETRATION_CORRECTION = 0.4
    
class Collision {
  constructor(a, b, manifold) {
    this.a = a
    this.b = b
    this.manifold = manifold
  }
}

function aabbVsAABB(a, b) {
  let n = b.position.sub(a.position)

  let aExtent = a.size.div(2)
  let bExtent = b.size.div(2)

  let overlapX = aExtent.x + bExtent.x - abs(n.x)

  if (overlapX <= 0) {
    return null
  }

  let overlapY = aExtent.y + bExtent.y - abs(n.y)

  if (overlapY <= 0) {
    return null
  }

  let manifold = new Manifold(a, b)
  
  if (overlapX < overlapY) {
    if (n.x < 0) {
      manifold.normal = new Vector(-1, 0)
    } else {
      manifold.normal = new Vector(1, 0)
    }
    manifold.penetration = overlapX
  } else {
    if (n.y < 0) {
      manifold.normal = new Vector(0, -1)
    } else {
      manifold.normal = new Vector(0, 1)
    }
    manifold.penetration = overlapY
  }

  return manifold
}

function circleVsCircle(a, b) {
  let totalRadius = a.radius + b.radius
  let n = b.position.sub(a.position)

  if (sq(totalRadius) < n.lengthSquared()) {
    return null
  }

  // Circles have collieded, now compute manifold
  let d = n.length()
  if (d != 0) {
    return new Manifold(
      a,
      b,
      a.radius + b.radius - d,
      n.div(d)
    )
  } else {
    return new Manifold(
      a,
      b,
      a.radius,
      new Vector(1, 0)
    )
  }
}

function aabbVsCircle(a, b) {
  let n = b.position.sub(a.position)

  let aExtent = a.size.div(2)

  let closest = new Vector(
    clamp(-aExtent.x, aExtent.x, n.x),
    clamp(-aExtent.y, aExtent.y, n.y)
  )

  let inside = false

  if (n.equals(closest)) {
    inside = true

    if (abs(n.x) > abs(n.y)) {
      if (closest.x > 0) {
        closest.x = aExtent.x
      } else {
        closest.x = -aExtent.x
      }
    } else {
      if (closest.y > 0) {
        closest.y = aExtent.y
      } else {
        closest.y = -aExtent.y
      }
    }
  }

  let normal = n.sub(closest)
  let distanceSquared = normal.lengthSquared()
  let r = b.radius

  if (distanceSquared > sq(r) && !inside) {
    return null
  }

  let distance = sqrt(distanceSquared)

  let manifold = new Manifold(a, b, r - distance)

  if (inside) {
    ellipse(b.position.x, b.position.y, 20)
    manifold.normal = closest.unit()
  } else {
    manifold.normal = normal.unit()
  }

  return manifold
}

function circleVSAABB(a, b) {
  let manifold = aabbVsCircle(b, a)
  if (manifold === null) {
    return null
  }
  
  manifold.normal = manifold.normal.neg()
  let aa = manifold.a
  let bb = manifold.b
  
  manifold.a = bb
  manifold.b = aa
  
  return manifold
}

function resolveCollision(a, b, normal) {
  
  // Calculate the relative velocity between the bodies
  let relativeVelocity = b.velocity.sub(a.velocity)

  // Calculate the relative velocity in terms of the collision normal
  let velAlongNormal = relativeVelocity.dot(normal)

  // Do not resolve if velocities are separating
  if (velAlongNormal > 0) {
    return
  }

  // Calculate restitution
  let e = min(a.restitution, b.restitution)

  // Calculate the impulse scalar
  let j = -(1 + e) * velAlongNormal
  j /= a.invMass + b.invMass

  // Apply the impulse
  let impulse = normal.mult(j)
  a.velocity = a.velocity.sub(impulse.mult(a.invMass))
  b.velocity = b.velocity.add(impulse.mult(b.invMass))
    
  // TODO Friction
}

function positionalCorrection(a, b, normal, penetration) {
  let percent = 0.2
  let slop = 0.01
  let correction = normal.mult(max(penetration - slop, 0) / (a.invMass + b.invMass) * percent)
  a.position = a.position.sub(correction.mult(a.invMass))
  b.position = b.position.add(correction.mult(b.invMass))
}