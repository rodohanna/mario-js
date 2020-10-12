import { Entity } from "./objects";
import * as physics from "./physics";
import WanderMovementAi from "./wander-movement-ai";

export default class Turtle extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.state = "wander";
    this.speed = 50;
    this.physics.lastAttemptedVelocity.x = -this.speed;
    this.normalScale = -1;
    this.normalAnchor = 1;
    this.flippedScale = 1;
    this.flippedAnchor = 0;
    this.isCollidingWithMario = false;
    this.active = false;
    this.move = new WanderMovementAi(this);
  }

  handleCollision(ctx, entity, direction) {
    if (
      entity.name === "mario" &&
      direction === "down" &&
      !this.isCollidingWithMario
    ) {
      ctx.playSound("stomp");
      this.isCollidingWithMario = true;
      if (this.state === "wander") {
        this.state = "shell-still";
        this.speed = 0;
        this.body.w = 16;
        this.body.h = 16;
        this.physics.lastAttemptedVelocity.x = this.speed;
      } else if (this.state === "shell-still") {
        this.state = "shell-moving";
        this.speed = 200;
      } else if (this.state === "shell-moving") {
        this.state = "shell-still";
      }
    }
  }

  update(ctx) {
    if (ctx.paused) {
      return;
    }
    this.processDelayedActions(ctx);
    if (!this.active && ctx.onScreen(this)) {
      this.active = true;
    }
    if (!this.active) {
      return;
    }

    if (this.isCollidingWithMario) {
      this.isCollidingWithMario = false;
      const collisions = physics.getCollisions(this, this.body, ctx, [
        "left",
        "right",
      ]);
      for (const collision of collisions) {
        if (collision.name === "mario") {
          this.isCollidingWithMario = true;
          break;
        }
      }
    }
    if (this.state !== "shell-still") {
      this.move.act(ctx);
    }
  }

  getCurrentAnimationName() {
    return this.state === "wander" ? "moving" : "shell";
  }
}
