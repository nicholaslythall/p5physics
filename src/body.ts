/// <reference path="vector.ts" />

class Body {
  constructor(shape, density) {
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
  
  applyForce(force) {
    this.force = this.force.add(force)
  }
  
  applyImpulse(impulse, contactVector) {
    this.velocity = this.velocity.add(impulse.mult(this.invMass))
    this.angularVelocity += this.invInertia * contactVector.cross(impulse)
  }
  
  isPointInside(point) {
    let bodyPoint = point.sub(this.position).rotate(-this.orientation)
    return this.shape.isInside(bodyPoint)
  }
}

Body.prototype.update = function(dt) {
  this.velocity = this.velocity.add(this.force.mult(this.invMass).mult(dt))
  this.position = this.position.add(this.velocity.mult(dt))
  this.force = new Vector()
  
  this.angularVelocity = this.torque * this.invInertia * dt
  this.orientation += this.angularVelocity * dt
  this.torque = 0
}

Body.prototype.draw = function() {
  push()
  noFill()
  stroke(0)
  
  translate(this.position.x, this.position.y)
  rotate(this.orientation)
    
  this.shape.draw()
  
  pop()
}