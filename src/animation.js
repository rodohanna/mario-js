export function processAnimationFrame(ctx, ...objects) {
  const camera = ctx.getCamera();

  for (const object of objects) {
    if (object.name) {
      const animationName = object.getCurrentAnimationName();
      if (!animationName) {
        console.error(object);
        throw new Error("Could not retrieve animation name for object");
      }
      const flipped = object.physics.lastAttemptedVelocity.x < 0;
      for (const animation of object.animations) {
        animation.animation.stop();
        animation.animation.x = object.body.x - camera.x;
        animation.animation.y = object.body.y - camera.y;
        animation.animation.rotation = object.rotation;
        if (animation.name === animationName) {
          if (object.animating) {
            animation.animation.play();
          }
          animation.animation.visible = object.visible;
        } else {
          animation.animation.visible = false;
        }
        if (flipped && object.flips) {
          animation.animation.scale.x = object.flippedScale;
          animation.animation.anchor.x = object.flippedAnchor;
        } else {
          animation.animation.scale.x = object.normalScale;
          animation.animation.anchor.x = object.normalAnchor;
        }
      }
    } else {
      object.sprite.x = object.body.x - camera.x;
      object.sprite.y = object.body.y - camera.y;
    }
  }
}
