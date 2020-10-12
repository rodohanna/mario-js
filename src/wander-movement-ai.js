import * as physics from "./physics";
import { Rect } from "./util";

export default class WanderMovementAi {
  constructor(entity) {
    this.entity = entity;
  }

  act(ctx) {
    let horizontalSpeed = this.entity.speed;
    if (this.entity.physics.lastAttemptedVelocity.x < 0) {
      horizontalSpeed = -horizontalSpeed;
    }

    this.entity.physics.lastAttemptedVelocity.x = horizontalSpeed;

    const { projectedPositionX } = physics.projectHorizontalMovement(
      this.entity,
      horizontalSpeed,
      ctx.dt
    );

    if (this.entity.keepInBounds(ctx, projectedPositionX)) {
      this._changeDirection();
      return;
    }

    const collisions = physics.getCollisions(
      this.entity,
      new Rect(
        projectedPositionX,
        this.entity.body.y,
        this.entity.body.w,
        this.entity.body.h
      ),
      ctx,
      ["left", "right"]
    );

    if (collisions.length) {
      for (const collision of collisions) {
        if (collision.name) {
          collision.handleCollision(
            ctx,
            this.entity,
            horizontalSpeed > 0 ? "right" : "left"
          );
          this.entity.handleCollision(
            ctx,
            collision,
            horizontalSpeed < 0 ? "right" : "left"
          );
        }
      }
      this._changeDirection();
    } else {
      this.entity.setX(projectedPositionX);
      this.entity.physics.velocity.x = horizontalSpeed;
    }
  }

  _changeDirection() {
    this.entity.physics.lastAttemptedVelocity.x = -this.entity.physics
      .lastAttemptedVelocity.x;
  }
}
