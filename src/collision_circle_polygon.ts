import { CollisionHandler } from "./CollisionHandler";
import { Manifold } from "./collisions";
import { Circle, Polygon } from "./shapes";
import { Body } from "./body"

export const EPSILON = 0.0001

let sq = (x: number) => x * x

export class CollisionCirclePolygon implements CollisionHandler {
  handleCollision(manifold: Manifold, circleBody: Body, polygonBody: Body) {
    const circle = circleBody.shape as Circle
    const polygon = polygonBody.shape as Polygon

    manifold.contactCount = 0

    // Transform circle center into polygon space
    let center = circleBody.position.sub(polygonBody.position).rotate(-polygonBody.orientation)

    // Find edge with minimum penetration
    // Exact concept as using support pointsin polygon vs polygon
    let separation = -Number.MAX_VALUE
    let faceNormal = 0
    for (let i = 0; i < polygon.vertexCount; i++) {

      let s = polygon.normals[i].dot(center.sub(polygon.vertices[i]))
      if (s > circle.radius) {
        return
      }

      if (s > separation) {
        separation = s
        faceNormal = i
      }
    }

    // Grab face's vertices
    let v1 = polygon.vertices[faceNormal]
    let v2 = polygon.vertices[(faceNormal + 1) % polygon.vertexCount]

    // Check to see if center is within polygon
    if (separation < EPSILON) {
      manifold.contactCount = 1
      manifold.normal = polygon.normals[faceNormal].rotate(polygonBody.orientation).neg()
      manifold.contacts[0] = manifold.normal.mult(circle.radius).add(circleBody.position)
      manifold.penetration = circle.radius - separation
      return
    }

    // Determine which voronoi region of the edge center of circle lies within
    let dot1 = center.sub(v1).dot(v2.sub(v1))
    let dot2 = center.sub(v2).dot(v1.sub(v2))
    manifold.penetration = circle.radius - separation

    if (dot1 <= 0.0) {

      // Closest to v1
      if (v1.sub(center).lengthSquared() > sq(circle.radius)) {
        return
      }

      manifold.contactCount = 1
      manifold.normal = v1.sub(center).rotate(polygonBody.orientation).unit()
      manifold.contacts[0] = v1.rotate(polygonBody.orientation).add(polygonBody.position)
    } else if (dot2 <= 0.0) {

      // Closest to v2
      if (v2.sub(center).lengthSquared() > sq(circle.radius)) {
        return
      }

      manifold.contactCount = 1
      manifold.normal = v2.sub(center).rotate(polygonBody.orientation).unit()
      manifold.contacts[0] = v2.rotate(polygonBody.orientation).add(polygonBody.position)

    } else {
      // Closest to face
      let n = polygon.normals[faceNormal]

      if (center.sub(v1).dot(n) > circle.radius) {
        return
      }

      manifold.contactCount = 1
      manifold.normal = n.rotate(polygonBody.orientation).neg()
      manifold.contacts[0] = circleBody.position.add(manifold.normal.mult(circle.radius))
    }
  }
}

export class CollisionPolygonCircle implements CollisionHandler {
  handler: CollisionCirclePolygon
  constructor() {
    this.handler = new CollisionCirclePolygon()
  }

  handleCollision(manifold: Manifold, polygon: Body, circle: Body) {
    this.handler.handleCollision(manifold, circle, polygon)
    manifold.normal = manifold.normal.neg()
  }
}