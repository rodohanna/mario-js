import { Input } from "./input";
import {
  loadMap,
  loadGoomba,
  loadBaseTextures,
  loadMushroom,
  loadCoin,
  loadBrick,
} from "./loader";
import { Renderer } from "./render";
import * as physics from "./physics";
import { processAnimationFrame } from "./animation";
import { debugSpatial } from "./debug";
import { clamp, Rect } from "./util";
import AudioManager from "./audio-manager";

class Context {
  constructor(level, spatial, dt) {
    /**
     * The level should NOT be modified directly. Any changes
     * can be mapped to functions on the context object.
     */
    this._UNSAFE_LEVEL = level;
    this._input = level.input;
    this._renderer = level.renderer;
    this.spatial = spatial;
    this.worldDimensions = level.worldDimensions;
    this.tiles = level.tiles;
    this.entities = level.entities;
    this.paused = level.paused;
    this.dt = dt;
  }

  addDebugRect(rect, color = 0xff4136, alpha = 0.25) {
    return this._renderer.addDebugRect(rect, color, alpha);
  }

  isInputPressed(input) {
    return this._input.inputs[input] && this._input.inputs[input].pressed;
  }

  isInputJustPressed(input) {
    return this._input.inputs[input] && this._input.inputs[input].justPressed;
  }

  getCamera() {
    return this._renderer.camera;
  }

  onScreen(entity) {
    const scaled = new Rect(
      this._renderer.camera.x,
      this._renderer.camera.y,
      this._renderer.camera.w / this._renderer.scale,
      this._renderer.camera.h / this._renderer.scale
    );
    return physics.collides(entity.body, scaled);
  }

  pauseLevel() {
    this._UNSAFE_LEVEL.paused = true;
  }

  unpauseLevel() {
    this._UNSAFE_LEVEL.paused = false;
  }

  spawnMushroom(where) {
    const mushroom = loadMushroom();
    mushroom.setX(where.x);
    mushroom.setY(where.y);
    this._UNSAFE_LEVEL.audio.playSound("powerup_spawn");
    this._UNSAFE_LEVEL.addEntity(mushroom);
  }

  spawnGoomba(where) {
    const goomba = loadGoomba();
    goomba.setX(where.x);
    goomba.setY(where.y);
    this._UNSAFE_LEVEL.addEntity(goomba);
  }

  spawnCoin(where) {
    const coin = loadCoin();
    coin.setX(where.x);
    coin.setY(where.y);
    this._UNSAFE_LEVEL.audio.playSound("coin");
    this._UNSAFE_LEVEL.addEntity(coin);
  }

  spawnBrick(where, rotationStep, speed) {
    const brick = loadBrick();
    brick.setX(where.x);
    brick.setY(where.y);
    brick.setRotationStep(rotationStep);
    brick.setSpeed(speed);
    this._UNSAFE_LEVEL.addEntity(brick);
  }

  playSound(key) {
    this._UNSAFE_LEVEL.audio.playSound(key);
  }

  stopMusic(key) {
    this._UNSAFE_LEVEL.audio.stopMusic(key);
  }
}

export class Level {
  constructor(map, tileset) {
    this.map = map;
    this.tileset = tileset;

    this.renderer = new Renderer();
    this.input = new Input();
    this.audio = new AudioManager();
    this.paused = false;
    this.receivedFirstInteraction = false;
  }

  load() {
    loadBaseTextures();
    const { tiles, scenery, mapEntities, worldDimensions } = loadMap(
      this.map,
      this.tileset
    );

    this.mario = mapEntities.find((entity) => entity.name === "mario");
    this.tiles = tiles;
    this.scenery = scenery;
    this.worldDimensions = worldDimensions;
    this.entities = mapEntities;

    for (const tile of this.tiles) {
      this.renderer.addSprite(tile.sprite);
    }
    for (const tile of this.scenery) {
      this.renderer.addSprite(tile.sprite);
    }
    for (const entity of this.entities) {
      for (const animation of entity.animations) {
        this.renderer.addSprite(animation.animation);
      }
    }

    const baseAudioUrl = `./assets/audio/`;
    const audioAssets = [
      { key: "jump", url: `${baseAudioUrl}jump.wav` },
      { key: "break_block", url: `${baseAudioUrl}break_block.wav` },
      { key: "bump", url: `${baseAudioUrl}bump.wav` },
      { key: "coin", url: `${baseAudioUrl}coin.wav` },
      { key: "level_complete", url: `${baseAudioUrl}level_complete.mp3` },
      { key: "mario_death", url: `${baseAudioUrl}mario_death.wav` },
      { key: "mario_theme", url: `${baseAudioUrl}mario_theme.mp3` },
      { key: "powerdown", url: `${baseAudioUrl}powerdown.wav` },
      { key: "powerup_spawn", url: `${baseAudioUrl}powerup_spawn.wav` },
      { key: "powerup", url: `${baseAudioUrl}powerup.wav` },
      { key: "stomp", url: `${baseAudioUrl}stomp.wav` },
    ];

    for (const audio of audioAssets) {
      this.audio.loadSound(audio.key, audio.url);
    }
  }

  update(dt) {
    this.renderer.clearDebug();

    if (this.input.inputs.p.justPressed) {
      this.renderer.debug = !this.renderer.debug;
    }

    const spatial = new physics.SpatialIndex(this.worldDimensions, 16, 4);
    for (const tile of this.tiles) {
      spatial.insert(tile);
    }
    for (const entity of this.entities) {
      if (entity.physics.collides) {
        spatial.insert(entity);
      }
    }

    const ctx = this.createContext(spatial, dt);

    if (!this.receivedFirstInteraction) {
      if (
        ctx.isInputPressed("up") ||
        ctx.isInputPressed("down") ||
        ctx.isInputPressed("left") ||
        ctx.isInputPressed("right")
      ) {
        // trying to play any sounds before the user has interacted
        // with the document will not work. So, let's wait for mario to move.
        this.receivedFirstInteraction = true;
        this.audio.playMusic("mario_theme");
      } else {
        return;
      }
    }

    debugSpatial(ctx);

    for (const entity of this.entities) {
      if (entity.physics.gravity) {
        physics.applyGravity(entity, ctx);
      }
      if (entity.update) {
        entity.update(ctx);
      }
    }

    this.input.endFrame();
  }

  draw(dt) {
    const ctx = this.createContext(null, dt);

    const xScaleMultiplier = 1 / this.renderer.root.scale.x;
    const yScaleMultiplier = 1 / this.renderer.root.scale.y;
    this.renderer.camera.x = clamp(
      this.mario.body.x -
        Math.trunc((this.renderer.camera.w * xScaleMultiplier) / 2),
      0,
      this.worldDimensions.x - this.renderer.camera.w * xScaleMultiplier
    );

    this.renderer.camera.y =
      -Math.trunc((this.renderer.camera.h / 2) * yScaleMultiplier) +
      Math.trunc(this.worldDimensions.y / 2);

    processAnimationFrame(
      ctx,
      ...this.tiles,
      ...this.entities,
      ...this.scenery
    );

    this.renderer.render();
  }

  createContext(spatial, dt) {
    return new Context(this, spatial, dt);
  }

  addEntity(entity) {
    this.entities.push(entity);
    for (const animation of entity.animations) {
      this.renderer.addSprite(animation.animation);
    }
  }
}
