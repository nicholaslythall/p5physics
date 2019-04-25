import { CollisionHandler } from "./CollisionHandler";
import { Manifold } from "./collisions";
import { Polygon } from "./shapes";
import { Body } from "./body"
import { Vector } from "./vector";

const BIAS_RELATIVE = 0.95
const BIAS_ABSOLUTE = 0.01

function gt(a: number, b: number) {
  return a >= b * BIAS_RELATIVE + a * BIAS_ABSOLUTE
}

export class CollisionPolygonPolygon implements CollisionHandler {
  handleCollision(manifold: Manifold, a: Body, b: Body) {
    const shapeA = a.shape as Polygon
    const shapeB = b.shape as Polygon
    
    manifold.contactCount = 0
    
    const faceA = [0]
    let penetrationA = this.findAxisLeastPenetration(faceA, shapeA, a, shapeB, b)
    if (penetrationA >= 0) {
      return
    }
    
    const faceB = [0]
    let penetrationB = this.findAxisLeastPenetration(faceB, shapeB, b, shapeA, a)
    if (penetrationB >= 0) {
      return
    }
    
    let referenceIndex
    let flip
    
    let referencePoly: Polygon
    let referenceBody: Body
    let incidentPoly: Polygon
    let incidentBody: Body
    
    if (gt(penetrationA, penetrationB)) {
      referencePoly = shapeA
      referenceBody = a
      incidentPoly = shapeB
      incidentBody = b
      referenceIndex = faceA[0]
      flip = false
    } else {
      referencePoly = shapeB
      referenceBody = b
      incidentPoly = shapeA
      incidentBody = a
      referenceIndex = faceB[0]
      flip = true
    }
    
    // World space incident face
    let incidentFace = [new Vector(), new Vector()]
    this.findIncidentFace(incidentFace, referencePoly, referenceBody, incidentPoly, incidentBody, referenceIndex)
    
    
    
    // Setup reference face vertices
    let v1 = referencePoly.vertices[referenceIndex]
    let v2 = referencePoly.vertices[(referenceIndex + 1) % referencePoly.vertexCount]
    
    // Transform to world space
    v1 = v1.rotate(referenceBody.orientation).add(referenceBody.position)
    v2 = v2.rotate(referenceBody.orientation).add(referenceBody.position)
    
    // Orthogonalize
    let sidePlaneNormal = v2.sub(v1).unit()
    let referenceFaceNormal = new Vector(sidePlaneNormal.y, -sidePlaneNormal.x)
    
    let refC = referenceFaceNormal.dot(v1)
    let negSide = -sidePlaneNormal.dot(v1)
    let posSide = sidePlaneNormal.dot(v2)
    
    
    // Clip incident face to reference face side planes
    let clip1 = this.clip(sidePlaneNormal.neg(), negSide, incidentFace)
    if (clip1 < 2) {
      // Due to floating point error, possible to not have required points
      return
    }
    
    let clip2 = this.clip(sidePlaneNormal, posSide, incidentFace)
    if (clip2 < 2) {
      // Due to floating point error, possible to not have required points
      return
    }
    
    // Flip
    if (flip) {
      manifold.normal = referenceFaceNormal
    } else {
      manifold.normal = referenceFaceNormal.neg()
    }
    
    // Keep points behind reference face
    let cp = 0
    let penetration = referenceFaceNormal.dot(incidentFace[0]) - refC
    if (penetration > 0) {
      manifold.contacts[cp] = incidentFace[0]
      manifold.penetration = penetration
      cp++
    } else {
      manifold.penetration = 0
    }
    
    penetration = referenceFaceNormal.dot(incidentFace[1]) - refC
    if (penetration > 0) {
      manifold.contacts[cp] = incidentFace[1]
      manifold.penetration += penetration
      cp++
      
      // Average penetration
      manifold.penetration /= cp
    }
    
    manifold.contactCount = cp
  }
  
  findAxisLeastPenetration(faceIndex: number[], polyA: Polygon, bodyA: Body, polyB: Polygon, bodyB: Body) {
    let bestDistance = -Number.MAX_VALUE
    let bestIndex = 0
    
    for (let i = 0; i < polyA.vertexCount; i++) {
      let normal = polyA.normals[i]
      let worldNormal = normal.rotate(bodyA.orientation)
      let bSpaceNormal = worldNormal.rotate(-bodyB.orientation)
      
      let support = polyB.getSupport(bSpaceNormal.neg())
      
      let bSpaceVertex = (polyA.vertices[i].rotate(bodyA.orientation)
      .add(bodyA.position)
      .sub(bodyB.position))
      .rotate(-bodyB.orientation)
      let dot = bSpaceNormal.dot(support.sub(bSpaceVertex))
      
      if (dot > bestDistance) {
        bestDistance = dot
        bestIndex = i
      }
    }
    
    faceIndex[0] = bestIndex
    return bestDistance
  }
  
  findIncidentFace(v: Vector[], refPoly: Polygon, refBody: Body, incPoly: Polygon, incBody: Body, referenceIndex: number) {
    let referenceNormal = refPoly.normals[referenceIndex]
    
    // Calculate normal in incident's frame of reference
    // Rotate to world space and then into incident space
    referenceNormal = referenceNormal.rotate(refBody.orientation).rotate(-incBody.orientation)
    
    // Find most anti-normal face on incident polygon
    let incidentFace = 0
    let minDot = Number.MAX_VALUE
    
    for (let i = 0; i < incPoly.vertexCount; i++) {
      let dot = referenceNormal.dot(incPoly.normals[i])
      if (dot < minDot) {
        minDot = dot
        incidentFace = i
      }
    }
    
    // Assign face vertices for incidentFace
    v[0] = incPoly.vertices[incidentFace].rotate(incBody.orientation).add(incBody.position)
    incidentFace = (incidentFace + 1) % incPoly.vertexCount
    v[1] = incPoly.vertices[incidentFace].rotate(incBody.orientation).add(incBody.position)
  }
  
  clip(n: Vector, c: number, face: Vector[]) {
    
    let sp = 0
    const out = [
      face[0],
      face[1]
    ]
    
    // Retrieve distances from each endpoint to the line
    let d1 = n.dot(face[0]) - c
    let d2 = n.dot(face[1]) - c
    
    // If negative (behind plane) clip
    if (d1 <= 0) {
      out[sp] = face[0]
      sp += 1
    }
    
    if (d2 <= 0) {
      out[sp] = face[1]
      sp += 1
    }
    
    // If the points are on different sides of the plane
    if (d1 * d2 < 0) {
      let a = d1 / (d1 - d2)
      out[sp] = face[1].sub(face[0]).mult(a).add(face[0])
      sp += 1
    }
    
    face[0] = out[0]
    face[1] = out[1]
    
    if (sp == 3) {
      throw "ClipError: sp == 3"
    }
    
    return sp
  }
}