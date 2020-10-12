import { Entity } from "./objects";
import * as physics from "./physics";
import WanderMovementAi from "./wander-movement-ai";

export default class Mushroom extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.state = "show";
    this.physics.collides = false;
    this.physics.gravity = false;
    this.flips = false;
    this.speed = 100;

    this.move = new WanderMovementAi(this);
  }

  update(ctx) {
    if (ctx.paused) {
      return;
    }
    if (this.state === "show") {
      this.body.y -= 15 * ctx.dt;
      const collisions = physics.getCollisions(
        this,
        this.body,
        ctx,
        ["left", "right"],
        true
      );
      for (const collision of collisions) {
        this.handleCollision(ctx, collision);
        if (collision.handleCollision) {
          collision.handleCollision(ctx, this);
        }
      }
      if (!collisions.length) {
        this.state = "move";
        this.physics.gravity = true;
        this.physics.collides = true;
      }
    } else if (this.state === "move") {
      this.move.act(ctx);
    }
  }

  handleCollision(ctx, entity, _direction) {
    if (entity.name === "mario") {
      this.state = "consumed";
      this.visible = false;
      this.physics.gravity = false;
      this.physics.collides = false;
    }
  }

  getCurrentAnimationName() {
    return "idle";
  }
}
