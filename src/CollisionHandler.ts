import { Manifold } from "./collisions"
import { Body } from "./body"

export interface CollisionHandler {
    handleCollision(manifold: Manifold, a: Body, b: Body): void
}