interface CollisionHandler {
    handleCollision(manifold: Manifold, a: Body, b: Body): void
}