const SHAPE_AABB = 0
const SHAPE_CIRCLE = 1
const SHAPE_POLYGON = 2
const SHAPE_COUNT = 3

const SHAPE_DEBUG = true

class AABB {
  constructor(size) {
    this.type = SHAPE_AABB
    this.size = size || new Vector(20, 20)
  }

  draw() {
    let min = this.size.div(2)
    rect(min.x, min.y, this.size.x, this.size.y)
  }
}

class Circle {
  constructor(radius) {
    this.type = SHAPE_CIRCLE
    this.radius = radius || 20
  }

  draw() {
    ellipse(0, 0, this.radius)
    if (SHAPE_DEBUG) {
      line(0, 0, this.radius, 0)
    }
  }
  
  computeMass(body, density) {
    body.mass = PI * sq(this.radius) * density
    body.invMass = (body.mass != 0) ? 1 / body.mass : 0
    body.inertia = body.mass * sq(this.radius)
    body.invInertia = (body.inertia != 0) ? 1 / body.inertia : 0
  }
  
  isInside(point) {
    return point.length() <= this.radius
  }
}


class Polygon {
  static rect(w, h) {
    const halfWidth = w / 2
    const halfHeight = h / 2
    return new Polygon([
      new Vector(halfWidth, halfHeight),
      new Vector(halfWidth, -halfHeight),
      new Vector(-halfWidth, -halfHeight),
      new Vector(-halfWidth, halfHeight)
    ])
  }

  constructor(verts) {
    if (!Array.isArray(verts)) {
      throw "PolygonError: verts must be an array"
    }
    if (verts.length < 3) {
      throw "PolygonError: verts must contain at least 3 vertices"
    }

    this.type = SHAPE_POLYGON
    this.vertices = verts

    this.normals = []
    for (let i = 0; i < this.vertexCount; i++) {
      let face = this.vertices[(i + 1) % this.vertexCount].sub(this.vertices[i])
      let normal = new Vector(-face.y, face.x).unit()
      this.normals.push(normal)
    }
  }

  get vertexCount() {
    return this.vertices.length
  }
 
  computeMass(body, density) {
    let c = new Vector()
    let area = 0
    let I = 0
    const inv3 = 1 / 3
    
    for (let i = 0; i < this.vertices.length; i++) {
      let p1 = this.vertices[i]
      let p2 = this.vertices[(i + 1) % this.vertices.length]
      
      let D = p2.cross(p1)
      let triangleArea = 0.5 * D
      
      area += triangleArea
      
      let weight = triangleArea * inv3
      let intx2 = sq(p1.x) + p1.x * p2.x + sq(p2.x)
      let inty2 = sq(p1.y) + p1.y * p2.y + sq(p2.y)
      I += (0.25 * inv3 * D) * (intx2 + inty2)
    }
    
    body.mass = density * area
    body.invMass = (body.mass != 0) ? 1 / body.mass : 0
    body.inertia = I * density
    body.invInertia = (body.inertia != 0) ? 1 / body.inertia : 0
  }
  
  draw() {
    push()
    beginShape()
    for (let v of this.vertices) {
      vertex(v.x, v.y)
    }
    endShape(CLOSE)

    // for (let i = 0; i < this.vertexCount; i++) {
    //   let vertex = this.vertices[i]
    //   let faceHalf = vertex.add(this.vertices[(i + 1) % this.vertexCount].sub(this.vertices[i]).mult(0.5))
    //   let normal = this.normals[i].mult(10)
    //   // stroke("#FF0")
    //   // ellipse(faceHalf.x, faceHalf.y, 20)
    //   stroke("#0F0")
    //   line(faceHalf.x, faceHalf.y, faceHalf.x + normal.x, faceHalf.y + normal.y)
    //   fill(0)
    //   textAlign(CENTER, CENTER)
    //   text(i, faceHalf.x - normal.x, faceHalf.y - normal.y)

    // }

    pop()
  }

  getSupport(direction) {
    let bestProjection = -Number.MAX_VALUE
    let bestVertex = null

    for (let i = 0; i < this.vertexCount; i++) {
      let vertex = this.vertices[i]
      let projection = vertex.dot(direction)

      if (projection > bestProjection) {
        bestVertex = vertex
        bestProjection = projection
      }
    }

    return bestVertex
  }
  
  isInside(point) {
    for (let i = 0; i < this.vertices.length; i++) {
      let s = this.normals[i].dot(point.sub(this.vertices[i]))
      if (s > 0) {
        return false
      }
    }
    
    return true
  }
}