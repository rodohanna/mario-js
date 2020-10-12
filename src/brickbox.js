import { Vector2 } from "./util";

const { Entity } = require("./objects");

export default class BrickBox extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.physics.gravity = false;
    this.state = "idle";
    this.startingY = body.y;
    this.broken = false;
  }

  handleCollision(ctx, entity, direction) {
    if (entity.name === "mario" && direction === "up") {
      this.state = "bouncing up";
      this.scheduleDelayedAction(() => {
        this.state = "bouncing down";
      }, 0.125);
      if (!entity.isSmall) {
        this._break(ctx);
      }
    }
  }

  update(ctx) {
    this.processDelayedActions(ctx);

    if (this.state === "bouncing up") {
      this.body.y -= 75 * ctx.dt;
    } else if (this.state === "bouncing down") {
      this.body.y += 80 * ctx.dt;
      if (this.body.y > this.startingY) {
        this.body.y = this.startingY;
        this.state = "idle";
        if (this.broken) {
          this.physics.collides = false;
        }
      }
    }
  }

  getCurrentAnimationName() {
    return "idle";
  }

  _break(ctx) {
    this.broken = true;
    this.visible = false;
    const topLeft = new Vector2(this.body.x, this.body.y);
    const topRight = new Vector2(this.body.x + this.body.w, this.body.y);
    const bottomLeft = new Vector2(this.body.x, this.body.y - this.body.h);
    const bottomRight = new Vector2(
      this.body.x + this.body.w,
      this.body.y - this.body.h
    );
    const horizontalSpeed = 50;
    const rotationStep = 25;
    ctx.spawnBrick(topRight, rotationStep, horizontalSpeed);
    ctx.spawnBrick(topLeft, -rotationStep, -horizontalSpeed);
    ctx.spawnBrick(bottomLeft, -rotationStep, -horizontalSpeed);
    ctx.spawnBrick(bottomRight, rotationStep, horizontalSpeed);
    ctx.playSound("break_block");
  }
}
