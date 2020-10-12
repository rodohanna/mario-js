import { Entity } from "./objects";
import * as physics from "./physics";
import { Rect } from "./util";

export default class Mario extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.jumpFrames = 0;
    this.isSmall = true;
    this.invincible = false;
    this.sizeChangeConst = 4;
    this.changingSize = false;
  }

  update(ctx) {
    this.processDelayedActions(ctx);

    if (this.dead) {
      ctx.pauseLevel();
      return;
    } else if (ctx.paused) {
      return;
    }

    const xSpeed = 200;
    let horizontalSpeed = 0;
    if (ctx.isInputPressed("right")) {
      horizontalSpeed += xSpeed;
    }
    if (ctx.isInputPressed("left")) {
      horizontalSpeed -= xSpeed;
    }
    if (horizontalSpeed) {
      this._applyLateralMovement(ctx, horizontalSpeed);
    } else {
      /**
       * No movement. Let's kill horizontal velocity.
       */
      this.physics.velocity.x = 0;
    }

    if (ctx.isInputJustPressed("up")) {
      this.jumpFrames = !this.physics.jumping ? 3 : 0;
      if (this.jumpFrames) {
        ctx.playSound("jump");
      }
    }

    this._applyVerticalMovement(ctx, -320);
  }

  handleCollision(ctx, entity, direction) {
    if (this.dead) {
      return;
    }
    if (entity.name === "goomba" || entity.name === "turtle") {
      if (direction === "up") {
        this.physics.velocity.y = -200;
      } else {
        if (!this.isSmall && !this.changingSize) {
          this.changingSize = true;
          ctx.playSound("powerdown");
          ctx.pauseLevel();
          this.invincible = true;
          this.animating = false;
          const delay = ctx.dt * this.sizeChangeConst;

          const numActions = 10;
          for (let i = 0; i < numActions; ++i) {
            this.scheduleDelayedAction(() => {
              const small = i % 2 === 0;
              if (small) {
                this._goSmall();
              } else {
                this._goBig();
              }
            }, delay * i);
          }
          this.scheduleDelayedAction(() => {
            this._goSmall();
            ctx.unpauseLevel();
          }, delay * numActions);
          this.scheduleDelayedAction(() => {
            this.invincible = false;
            this.animating = true;
            this.changingSize = false;
          }, delay * (numActions + 2));
        } else if (!this.invincible) {
          this.dead = true;
          ctx.stopMusic("mario_theme");
          ctx.playSound("mario_death");
          this.scheduleDelayedAction(() => {
            this.physics.velocity.y = -400;
            this.physics.collides = false;
          }, ctx.dt * 25);
        }
      }
    } else if (entity.name === "mushroom" && this.isSmall) {
      const delay = ctx.dt * this.sizeChangeConst;
      ctx.playSound("powerup");
      ctx.pauseLevel();
      this.physics.gravity = false;
      this.animating = false;
      this.changingSize = true;

      const numActions = 10;
      for (let i = 0; i < numActions; ++i) {
        this.scheduleDelayedAction(() => {
          const small = i % 2 === 0;
          if (small) {
            this._goSmall();
          } else {
            this._goBig();
          }
        }, delay * i);
      }
      this.scheduleDelayedAction(() => {
        this._goBig();
        this.physics.gravity = true;
        this.animating = true;
        this.changingSize = false;
        ctx.unpauseLevel();
      }, delay * numActions);
    }
  }

  _applyLateralMovement(ctx, horizontalSpeed) {
    this.physics.lastAttemptedVelocity.x = horizontalSpeed;
    const { projectedPositionX } = physics.projectHorizontalMovement(
      this,
      horizontalSpeed,
      ctx.dt
    );

    if (this.keepInBounds(ctx, projectedPositionX)) {
      return;
    }

    /**
     * The player is within the world bounds, let's try and move them.
     */
    const leftCollisions = physics.getCollisions(
      this,
      new Rect(projectedPositionX, this.body.y, this.body.w, this.body.h),
      ctx,
      ["left"]
    );
    const rightCollisions = physics.getCollisions(
      this,
      new Rect(projectedPositionX, this.body.y, this.body.w, this.body.h),
      ctx,
      ["right"]
    );
    if (horizontalSpeed > 0 && rightCollisions.length) {
      const collision = rightCollisions[0];
      this.setX(collision.body.x - this.body.w);
      this.physics.velocity.x = 0;
      for (const collision of rightCollisions) {
        this.handleCollision(ctx, collision, "right");
        if (collision.handleCollision) {
          collision.handleCollision(ctx, this, "left");
        }
      }
    } else if (horizontalSpeed < 0 && leftCollisions.length) {
      const collision = leftCollisions[0];
      this.setX(collision.body.x + collision.body.w);
      this.physics.velocity.x = 0;
      for (const collision of rightCollisions) {
        this.handleCollision(ctx, collision, "left");
        if (collision.handleCollision) {
          collision.handleCollision(ctx, this, "right");
        }
      }
    } else {
      this.setX(projectedPositionX);
      this.physics.velocity.x = horizontalSpeed;
    }
  }

  _applyVerticalMovement(ctx, verticalSpeed) {
    if (this.jumpFrames) {
      this.physics.jumping = true;
      const { projectedPositionY } = physics.projectVerticalMovement(
        this,
        verticalSpeed,
        ctx.dt
      );
      const collisions = physics.getCollisions(
        this,
        new Rect(this.body.x, projectedPositionY, this.body.w, this.body.h),
        ctx,
        ["left", "right"]
      );
      for (const collision of collisions) {
        if (collision.handleCollision) {
          collision.handleCollision(ctx, this, "up");
        }
      }
      if (!collisions.length) {
        this.setY(projectedPositionY);
        this.physics.velocity.y = verticalSpeed;
      }
      this.jumpFrames--;
    }
  }

  _goBig() {
    if (this.isSmall) {
      this.isSmall = false;

      this.body.h = 32;
      this.body.y -= 16;
    }
  }

  _goSmall() {
    if (!this.isSmall) {
      this.isSmall = true;

      this.body.h = 16;
      this.body.y += 16;
    }
  }

  getCurrentAnimationName() {
    if (this.dead) {
      return "dead";
    } else if (this.physics.jumping) {
      return `${this.isSmall ? "" : "big-"}jumping`;
    } else if (this.physics.velocity.x !== 0) {
      return `${this.isSmall ? "" : "big-"}running`;
    } else {
      return `${this.isSmall ? "" : "big-"}idle`;
    }
  }
}
