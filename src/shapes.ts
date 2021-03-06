import { Vector } from "./vector"
import { Body } from "./body"

const sq = (x: number) => x * x
const PI = Math.PI

export const SHAPE_AABB = 0
export const SHAPE_CIRCLE = 1
export const SHAPE_POLYGON = 2
export const SHAPE_COUNT = 3

export const SHAPE_DEBUG = true

export interface Shape {
  type: number

  draw(): void
  computeMass(body: Body, density: number): void
  isInside(point: Vector): boolean
}

export class AABB implements Shape {
  type: number
  size: Vector

  constructor(size: Vector) {
    this.type = SHAPE_AABB
    this.size = size || new Vector(20, 20)
  }

  draw() { }

  computeMass(body: Body, density: number) {
    return this.size.x * this.size.y * density
  }

  isInside(point: Vector): boolean {
    let halfWidth = this.size.x / 2
    let halfHeight = this.size.y / 2
    return point.x >= -halfWidth && point.x <= halfWidth && point.y >= -halfHeight && point.y <= halfHeight
  }
}

export class Circle implements Shape {
  type: number
  radius: number

  constructor(radius: number) {
    this.type = SHAPE_CIRCLE
    this.radius = radius || 20
  }

  draw() { }

  computeMass(body: Body, density: number) {
    body.mass = PI * sq(this.radius) * density
    body.invMass = (body.mass != 0) ? 1 / body.mass : 0
    body.inertia = body.mass * sq(this.radius)
    body.invInertia = (body.inertia != 0) ? 1 / body.inertia : 0
  }

  isInside(point: Vector) {
    return point.length() <= this.radius
  }
}


export class Polygon implements Shape {

  static rect(w: number, h: number) {
    const halfWidth = w / 2
    const halfHeight = h / 2
    return new Polygon([
      new Vector(halfWidth, halfHeight),
      new Vector(halfWidth, -halfHeight),
      new Vector(-halfWidth, -halfHeight),
      new Vector(-halfWidth, halfHeight)
    ])
  }

  type: number
  vertices: Vector[]
  normals: Vector[]

  constructor(verts: Vector[]) {
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

  get vertexCount(): number {
    return this.vertices.length
  }

  draw() { }

  computeMass(body: Body, density: number) {
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

  getSupport(direction: Vector): Vector {
    let bestProjection = -Number.MAX_VALUE
    let bestVertex: Vector = this.vertices[0]

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

  isInside(point: Vector) {
    for (let i = 0; i < this.vertices.length; i++) {
      let s = this.normals[i].dot(point.sub(this.vertices[i]))
      if (s > 0) {
        return false
      }
    }

    return true
  }
}