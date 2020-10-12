import { Entity } from "./objects";
import WanderMovementAi from "./wander-movement-ai";

export default class Goomba extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.speed = 50;
    this.physics.lastAttemptedVelocity.x = -this.speed;
    this.move = new WanderMovementAi(this);
    this.active = false;
    this.deathType = "stomped";
    this.deathDirection = "left";
    this.rotationStep = 5;
  }

  update(ctx) {
    this.processDelayedActions(ctx);
    if (this.dead && this.deathType === "bounced") {
      this.rotation += this.rotationStep * ctx.dt;
    }
    if (ctx.paused) {
      return;
    }
    if (!this.active && ctx.onScreen(this)) {
      this.active = true;
    }
    if (
      (!this.dead || (this.dead && this.deathType === "bounced")) &&
      this.active
    ) {
      if (this.dead) {
        if (this.deathDirection === "left") {
          this.physics.lastAttemptedVelocity.x = -this.speed;
        } else {
          this.physics.lastAttemptedVelocity.x = this.speed;
        }
      }
      this.move.act(ctx);
    }
  }

  handleCollision(ctx, entity, direction) {
    if (this.dead) {
      return;
    }
    if (entity.name === "mario" && direction === "down") {
      ctx.playSound("stomp");
      this._stompDeath(ctx);
    } else if (entity.name === "turtle" && entity.state === "shell-moving") {
      ctx.playSound("bump");
      this._bounceDeath(ctx, direction);
    } else if (
      (entity.name === "brickbox" && direction === "up" && entity.broken) ||
      (entity.name === "mysterybox" && direction === "up" && entity.killsGoomba)
    ) {
      ctx.playSound("stomp");
      this._bounceDeath(ctx, Math.random() > 0.5 ? "left" : "right");
    }
  }

  getCurrentAnimationName() {
    return this.dead && this.deathType === "stomped" ? "dead" : "moving";
  }

  _stompDeath(ctx) {
    this.deathType = "stomped";
    this.dead = true;
    this.physics.collides = false;
    this.physics.gravity = false;
    this.scheduleDelayedAction(() => {
      this.visible = false;
    }, 0.5);
  }

  _bounceDeath(ctx, direction) {
    this.dead = true;
    this.deathType = "bounced";
    this.deathDirection = direction;
    this.speed = 100;
    if (direction === "left") {
      this.rotationStep = -this.rotationStep;
      const flippedAnchor = this.flippedAnchor;
      const flippedScale = this.flippedScale;
      this.flippedAnchor = this.normalAnchor;
      this.flippedScale = this.normalScale;
      this.normalAnchor = flippedAnchor;
      this.normalScale = flippedScale;
    }
    this.physics.velocity.y = -250;
    this.physics.collides = false;
  }
}
