let body1
let body2

let collisionHandler = new CollisionCirclePolygon()

function setup() {
  createCanvas(windowWidth, windowHeight);

  body1 = new Body(new Circle(100))
  // body1.orientation = random(-PI, PI)
  body1.position = new Vector(width / 2, height / 2)
  body2 = new Body(Polygon.rect(100, 50))
  // body2.orientation = HALF_PI / 2
  // body2.orientation = random(-PI, PI)

}

function draw() {
  background(220);

  body2.position = new Vector(mouseX, mouseY)

  let manifold1 = new Manifold(body1, body2)
  collisionHandler.handleCollision(manifold1, body1, body2)

  let manifold2 = new Manifold(body2, body1)
  // collisionHandler.handleCollision(manifold2, body2, body1)

  let manifolds = []
  manifolds.push(manifold1)
  // manifolds.push(manifold2)

  noFill()

  let r = body1.shape.radius
  rect(body1.position.x - r, body1.position.y - r, r * 2, r * 2)

  for (let body of [body1, body2]) {
    push()
    translate(body.position.x, body.position.y)
    rotate(body.orientation)
    if (manifold1.contactCount > 0 || manifold2.contactCount > 0) {
      stroke("#F00")
    }

    body.shape.draw()
    pop()
  }

  push()
  for (let m of manifolds) {
    for (let c of m.contacts) {
      stroke("#FF0")
      ellipse(c.x, c.y, 5)
      line(c.x, c.y, c.x + m.normal.x * -m.penetration, c.y + m.normal.y * -m.penetration)
    }
  }
  pop()
}