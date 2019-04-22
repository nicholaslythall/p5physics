class CollisionPolygonPolygon {}

CollisionPolygonPolygon.prototype.handleCollision = function(manifold, a, b) {
  const shapeA = a.shape
  const shapeB = b.shape
  shapeA.body = a
  shapeB.body = b

  manifold.contactCount = 0

  const faceA = [0]
  let penetrationA = this.findAxisLeastPenetration(faceA, shapeA, shapeB)
  if (penetrationA >= 0) {
    return
  }

  const faceB = [0]
  let penetrationB = this.findAxisLeastPenetration(faceB, shapeB, shapeA)
  if (penetrationB >= 0) {
    return
  }

  let referenceIndex
  let flip

  let referencePoly
  let incidentPoly

  if (gt(penetrationA, penetrationB)) {
    referencePoly = shapeA
    incidentPoly = shapeB
    referenceIndex = faceA[0]
    flip = false
  } else {
    referencePoly = shapeB
    incidentPoly = shapeA
    referenceIndex = faceB[0]
    flip = true
  }

  // World space incident face
  incidentFace = [new Vector(), new Vector()]
  this.findIncidentFace(incidentFace, referencePoly, incidentPoly, referenceIndex)



  // Setup reference face vertices
  let v1 = referencePoly.vertices[referenceIndex]
  let v2 = referencePoly.vertices[(referenceIndex + 1) % referencePoly.vertexCount]

  // Transform to world space
  v1 = v1.rotate(referencePoly.body.orientation).add(referencePoly.body.position)
  v2 = v2.rotate(referencePoly.body.orientation).add(referencePoly.body.position)

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

const BIAS_RELATIVE = 0.95
const BIAS_ABSOLUTE = 0.01

function gt(a, b) {
  return a >= b * BIAS_RELATIVE + a * BIAS_ABSOLUTE
}

CollisionPolygonPolygon.prototype.findAxisLeastPenetration = function(faceIndex, polyA, polyB) {
  let bestDistance = -Number.MAX_VALUE
  let bestIndex = 0

  for (let i = 0; i < polyA.vertexCount; i++) {
    let normal = polyA.normals[i]
    let worldNormal = normal.rotate(polyA.body.orientation)
    let bSpaceNormal = worldNormal.rotate(-polyB.body.orientation)

    let support = polyB.getSupport(bSpaceNormal.neg())

    let bSpaceVertex = (polyA.vertices[i].rotate(polyA.body.orientation)
        .add(polyA.body.position)
        .sub(polyB.body.position))
      .rotate(-polyB.body.orientation)
    let dot = bSpaceNormal.dot(support.sub(bSpaceVertex))

    if (dot > bestDistance) {
      bestDistance = dot
      bestIndex = i
    }
  }

  faceIndex[0] = bestIndex
  return bestDistance
}

CollisionPolygonPolygon.prototype.findIncidentFace = function(v, refPoly, incPoly, referenceIndex) {
  let referenceNormal = refPoly.normals[referenceIndex]

  // Calculate normal in incident's frame of reference
  // Rotate to world space and then into incident space
  referenceNormal = referenceNormal.rotate(refPoly.body.orientation).rotate(-incPoly.body.orientation)

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
  v[0] = incPoly.vertices[incidentFace].rotate(incPoly.body.orientation).add(incPoly.body.position)
  incidentFace = (incidentFace + 1) % incPoly.vertexCount
  v[1] = incPoly.vertices[incidentFace].rotate(incPoly.body.orientation).add(incPoly.body.position)
}

CollisionPolygonPolygon.prototype.clip = function(n, c, face) {

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