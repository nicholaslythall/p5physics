class CollisionCircleCircle {
  handleCollision(manifold, a, b) {
    let A = a.shape
    let B = b.shape
    A.body = a
    B.body = b
    
    let normal = b.position.sub(a.position)
    
    let dist_sqr = normal.lengthSquared()
    let radius = A.radius + B.radius
    
    if (dist_sqr >= sq(radius)) {
      manifold.contactCount = 0
      return
    }
      
    let distance = sqrt(dist_sqr)
    manifold.contactCount = 1
    if (distance == 0.0) {
      manifold.penetration = A.radius
      manifold.normal = new Vector(1, 0)
      manifold.contacts[0] = a.position
    } else {
      manifold.penetration = radius - distance
      manifold.normal = normal.div(distance)
      manifold.contacts[0] = manifold.normal.mult(A.radius).add(a.position)
    }
  }
}