import { Entity } from "./objects";

export default class Brick extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);
    this.physics.collides = false;
    this.rotationStep = 10;
    this.physics.velocity.y = -250;
    this.speed = 100;
    this.flips = false;
    this.normalAnchor = 0.5;
    this.normalScale = 0.5;
  }

  update(ctx) {
    this.rotation += ctx.dt * this.rotationStep;
    this.body.x += ctx.dt * this.speed;
  }

  setRotationStep(rotationStep) {
    this.rotationStep = rotationStep;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  getCurrentAnimationName() {
    return "moving";
  }
}
