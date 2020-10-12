import { Entity } from "./objects";

export default class Coin extends Entity {
  constructor(name, animations, body) {
    super(name, animations, body);

    this.physics.collides = false;
    this.physics.velocity.y = -250;
  }

  update(_ctx) {
    if (this.physics.velocity.y > 300) {
      this.visible = false;
      this.physics.gravity = false;
    }
  }

  getCurrentAnimationName() {
    return "idle";
  }
}
