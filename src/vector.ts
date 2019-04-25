let sqrt = Math.sqrt
let sq = (x: number) => x * x
let cos = Math.cos
let sin = Math.sin

export class Vector {
  x: number
  y: number
  
  constructor(x?: number, y?: number) {
    x = (x == undefined) ? 0 : x
    y = (y == undefined) ? 0 : y
    
    if (!isFinite(x) || !isFinite(y)) {
      let error = new VectorError("x and y must be numbers, was (" + x + ", " + y + ")")
      
      console.log(error.stack)
      
      throw error
    }
    
    this.x = x
    this.y = y
  }
  
  length() {
      return sqrt(sq(this.x) + sq(this.y));
  }
  
  lengthSquared() {
    return sq(this.x) + sq(this.y)
  }
  
  neg() {
    return new Vector(-this.x, -this.y)
  }
  
  toString() {
    return "[" + this.x + ", " + this.y + "]"
  }
  
  unit() {
    return this.div(this.length())
  }
  
  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y)
  }
  
  sub(other: Vector) {
    return new Vector(this.x - other.x, this.y - other.y)
  }
  
  mult(value: number) {
    if (!isFinite(value)) {
      throw new VectorError("value must be finite, was " + value)
    }
    
    return new Vector(this.x * value, this.y * value)
  }
  
  div(value: number) {
    return new Vector(this.x / value, this.y / value)
  }
  
  dot(other: Vector) {
    return this.x * other.x + this.y * other.y
  }
  
  cross(other: Vector) {
    return this.x * other.y - this.y * other.x
  }
  
  crossScalar(s: number) {
    return new Vector(s * this.y, -s * this.x)
  }
  
  scalarCross(s: number) {
    return new Vector(-s * this.y, s * this.x)
  }
  
  rotate(theta: number) {
    return new Vector(this.x * cos(theta) - this.y * sin(theta), this.x * sin(theta) + this.y * cos(theta))
  }
  
  equals(other: Vector) {
    return this.x == other.x && this.y == other.y
  }
}

class VectorError extends Error {}