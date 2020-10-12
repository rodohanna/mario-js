import { Vector2 } from "./util";

export class Object {
  constructor(body) {
    this.body = body;
  }
}

export class Entity extends Object {
  constructor(name, animations, body) {
    super(body);
    this.name = name;
    this.animations = animations;
    this.visible = true;
    this.dead = false;
    this.flips = true;
    this.physics = new Physics(new Vector2(0, 0));
    this.delayedActions = [];
    this.animating = true;
    this.normalScale = 1;
    this.normalAnchor = 0;
    this.flippedScale = -1;
    this.flippedAnchor = 1;
    this.rotation = 0;
  }

  setX(x) {
    this.body.x = x;
  }

  setY(y) {
    this.body.y = y;
  }

  keepInBounds(ctx, projectedPositionX) {
    /**
     * Don't let the player fall off of the left side of the world.
     */
    if (projectedPositionX < 0) {
      this.setX(0);
      this.physics.velocity.x = 0;
      return true;
    }

    if (projectedPositionX > ctx.worldDimensions.x - this.body.w) {
      /**
       * Don't let the player fall of of the right side of the world.
       */
      this.setX(ctx.worldDimensions.x - this.body.w);
      this.physics.velocity.x = 0;
      return true;
    }

    return false;
  }

  handleCollision(ctx, entity, direction) {}

  scheduleDelayedAction(func, timeToWait = 0) {
    this.delayedActions.push({ func, timeToWait, counter: 0 });
  }

  processDelayedActions(ctx) {
    for (let i = 0; i < this.delayedActions.length; ++i) {
      const action = this.delayedActions[i];
      action.counter += ctx.dt;
      if (action.counter >= action.timeToWait) {
        action.func(ctx);
        this.delayedActions.splice(i, 1);
        i--;
      }
    }
  }

  getCurrentAnimationName() {
    throw new Error("getCurrentAnimationName not overriden");
  }
}

export class Tile extends Object {
  constructor(sprite, body) {
    super(body);
    this.sprite = sprite;
  }
}

export class Physics {
  constructor(velocity) {
    this.velocity = velocity;
    this.isOnGround = true;
    this.jumping = false;
    this.collides = true;
    this.gravity = true;
    this.lastAttemptedVelocity = new Vector2(0, 0);
  }
}
