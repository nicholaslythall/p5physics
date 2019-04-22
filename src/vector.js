class Vector {
  constructor(x, y) {
    x = (x == undefined) ? 0 : x
    y = (y == undefined) ? 0 : y
    
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      let error = new VectorError(
        "x and y must be numbers, was (" + x + ", " + y + ")"
      )
      
      print(error.stack)
      
      throw error
    }
    
    this.x = x
    this.y = y
  }
}

Vector.prototype.length = function() {
  return sqrt(sq(this.x) + sq(this.y));
}

Vector.prototype.lengthSquared = function() {
  return sq(this.x) + sq(this.y)
}

Vector.prototype.neg = function() {
  return new Vector(-this.x, -this.y)
}

Vector.prototype.toString = function() {
  return "[" + this.x + ", " + this.y + "]"
}

Vector.prototype.unit = function() {
  return this.div(this.length())
}

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y)
}

Vector.prototype.sub = function(other) {
  return new Vector(this.x - other.x, this.y - other.y)
}

Vector.prototype.mult = function(value) {
  if (!Number.isFinite(value)) {
    throw new VectorError("value must be finite, was " + value)
  }
  
  return new Vector(this.x * value, this.y * value)
}

Vector.prototype.div = function(value) {
  return new Vector(this.x / value, this.y / value)
}

Vector.prototype.dot = function(other) {
  return this.x * other.x + this.y * other.y
}

Vector.prototype.cross = function(other) {
  return this.x * other.y - this.y * other.x
}

Vector.prototype.crossScalar = function(s) {
  return new Vector(s * this.y, -s * this.x)
}

Vector.prototype.scalarCross = function(s) {
  return new Vector(-s * this.y, s * this.x)
}

Vector.prototype.rotate = function(theta) {
  return new Vector(
    this.x * cos(theta) - this.y * sin(theta),
    this.x * sin(theta) + this.y * cos(theta)
  )
}

Vector.prototype.equals = function(other) {
  return this.x == other.x && this.y == other.y
}

class VectorError extends Error {}