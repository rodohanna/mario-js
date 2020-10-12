import { Entity } from "./objects";
import { Vector2 } from "./util";

export class MysteryBox extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.physics.gravity = false;
    this.state = "idle";
    this.full = true;
    this.shouldSpawnThing = false;
    this.startingY = body.y;
    this.type = "coin";
    this.killsGoomba = false;
  }

  handleCollision(ctx, entity, direction) {
    if (entity.name === "mario" && direction === "up") {
      if (this.full) {
        this.shouldSpawnThing = true;
      }
      if (!entity.isSmall) {
        this.killsGoomba = true;
      }
      this.full = false;
      this.state = "bouncing up";
      this.scheduleDelayedAction(() => {
        this.state = "bouncing down";
      }, 0.125);
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
        this.killsGoomba = false;
        if (this.shouldSpawnThing) {
          this.shouldSpawnThing = false;
          if (Math.random() < 0.01) {
            for (let i = 0; i < 10; ++i) {
              ctx.spawnGoomba(new Vector2(this.body.x, 0));
            }
          } else if (this.type === "mushroom") {
            ctx.spawnMushroom(new Vector2(this.body.x, this.body.y));
          }
        }
      }
    }
    if (this.type === "coin" && this.shouldSpawnThing) {
      this.shouldSpawnThing = false;
      ctx.spawnCoin(new Vector2(this.body.x, this.body.y - 32));
    }
  }

  getCurrentAnimationName() {
    return !this.full ? "empty" : "idle";
  }

  setType(type) {
    if (!["coin", "mushroom"].includes(type)) {
      throw new Error(`Invalid MysteryBox type: ${type}`);
    }
    this.type = type;
  }
}
