import { Rect } from "./util";

export function applyGravity(entity, ctx) {
  if (!entity.physics.gravity) {
    return;
  }
  const { projectedPositionY, projectedVelocityY } = projectGravityEffect(
    entity,
    ctx.dt
  );
  entity.physics.isOnGround = false;
  entity.physics.lastAttemptedVelocity.y = projectedVelocityY;
  const collisions = getCollisions(
    entity,
    new Rect(entity.body.x, projectedPositionY, entity.body.w, entity.body.h),
    ctx,
    ["left", "right"]
  );
  if (collisions.length) {
    const collision = collisions[0];
    if (projectedVelocityY > 0) {
      entity.setY(collision.body.y - entity.body.h);
      entity.physics.velocity.y = 0;
      entity.physics.isOnGround = true;
      entity.physics.jumping = false;
    } else if (projectedVelocityY < 0) {
      entity.setY(collision.body.y + collision.body.h);
      entity.physics.velocity.y = 0;
    }
    for (const collision of collisions) {
      if (collision.name) {
        collision.handleCollision(
          ctx,
          entity,
          projectedVelocityY > 0 ? "down" : "up"
        );
        entity.handleCollision(
          ctx,
          collision,
          projectedVelocityY > 0 ? "up" : "down"
        );
      }
    }
  } else {
    entity.setY(projectedPositionY);
    entity.physics.velocity.y = projectedVelocityY;
  }
}

export function projectGravityEffect(entity, dt) {
  const GRAVITY = 1204.8;
  return {
    projectedPositionY:
      entity.body.y + dt * (entity.physics.velocity.y + (dt * GRAVITY) / 2),
    projectedVelocityY: entity.physics.velocity.y + dt * GRAVITY,
  };
}

export function projectHorizontalMovement(entity, horizontalSpeed, dt) {
  return {
    projectedPositionX: entity.body.x + dt * horizontalSpeed,
  };
}

export function projectVerticalMovement(entity, verticalSpeed, dt) {
  return {
    projectedPositionY: entity.body.y + dt * verticalSpeed,
  };
}

export function getCollisions(
  entity,
  proposedBody,
  ctx,
  orientations = ["left"],
  getAnyway = false
) {
  if (!entity.physics.collides && !getAnyway) {
    return [];
  }
  const possibleCollisions = [];
  for (const orientation of orientations) {
    possibleCollisions.push(
      ...ctx.spatial.get({ body: proposedBody }, orientation)
    );
  }
  const collisions = possibleCollisions.filter(
    (object) => entity !== object && collides(object.body, proposedBody)
  );
  if (entity.name === "mario") {
    for (const possible of possibleCollisions) {
      ctx.addDebugRect(possible.body, 0x39cccc);
    }
    for (const collision of collisions) {
      ctx.addDebugRect(collision.body);
    }
  }
  return collisions;
}

export function collides(a, b) {
  const leftA = a.x;
  const rightA = a.x + a.w;
  const topA = a.y;
  const bottomA = a.y + a.h;

  const leftB = b.x;
  const rightB = b.x + b.w;
  const topB = b.y;
  const bottomB = b.y + b.h;

  if (bottomA <= topB) {
    return false;
  }

  if (topA >= bottomB) {
    return false;
  }

  if (rightA <= leftB) {
    return false;
  }

  if (leftA >= rightB) {
    return false;
  }

  return true;
}

export class KaileyChunk {
  constructor(bounds) {
    this.bounds = bounds;
    this.objects = [];
  }
}

export class SpatialIndex {
  constructor(worldDimensions, tileWidth, chunkLength = 16) {
    this.chunks = [];
    this.worldDimensions = worldDimensions;
    this.tileWidth = tileWidth;
    this.chunkLength = chunkLength;

    let chunkNum = worldDimensions.x / (tileWidth * chunkLength);
    if (chunkNum !== Math.trunc(chunkNum)) {
      chunkNum++;
    }
    chunkNum++;
    for (let i = 0; i < chunkNum; ++i) {
      this.chunks.push(
        new KaileyChunk(
          new Rect(
            i * tileWidth * chunkLength,
            0,
            tileWidth * chunkLength,
            worldDimensions.y
          )
        )
      );
    }
  }

  insert(object) {
    const leftChunkIndex = this.getChunkIndex(object, "left");
    const rightChunkIndex = this.getChunkIndex(object, "right");
    this.chunks[leftChunkIndex].objects.push(object);
    if (rightChunkIndex !== leftChunkIndex) {
      this.chunks[rightChunkIndex].objects.push(object);
    }
  }

  get(object, orientation = "left") {
    const chunkIndex = this.getChunkIndex(object, orientation);
    return this.chunks[chunkIndex].objects;
  }

  getChunkIndex(object, orientation) {
    const chunkIndex = Math.trunc(
      this.inferXFromOrientation(object, orientation) /
        (this.tileWidth * this.chunkLength)
    );
    if (chunkIndex < 0 || chunkIndex >= this.chunks.length) {
      console.error({ object, spatial: this });
      throw new Error("Invalid chunkIndex");
    }
    return chunkIndex;
  }

  inferXFromOrientation(object, orientation) {
    if (orientation === "left") {
      return object.body.x;
    } else if (orientation === "right") {
      return object.body.x + object.body.w;
    } else if (orientation === "center") {
      return object.body.x + object.body.w / 2;
    } else {
      throw new Error(`Unknown orientation ${orientation}`);
    }
  }
}
