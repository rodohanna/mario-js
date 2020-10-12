import * as PIXI from "pixi.js";
import BrickBox from "./brickbox";
import Coin from "./coin";
import Goomba from "./goomba";
import Mario from "./mario";
import Mushroom from "./mushroom";
import { MysteryBox } from "./mysterybox";
import { Tile } from "./objects";
import Turtle from "./turtle";
import Brick from "./brick";
import { Rect, Vector2 } from "./util";

const PLAYER_TEXTURE = "assets/sprites/player.png";
const ENEMY_TEXTURE = "assets/sprites/enemy.png";
const TILE_TEXTURE = "assets/sprites/tiles.png";
const ITEMS_TEXTURE = "assets/sprites/items.png";

const textureCache = {};

function getBaseTexture(textureKey) {
  if (!textureCache[textureKey]) {
    textureCache[textureKey] = PIXI.BaseTexture.from(textureKey);
  }
  return textureCache[textureKey];
}

export function loadBaseTextures() {
  [PLAYER_TEXTURE, ENEMY_TEXTURE, TILE_TEXTURE, ITEMS_TEXTURE].map(
    getBaseTexture
  );
}

export function loadMushroom() {
  const baseTexture = getBaseTexture(ITEMS_TEXTURE);

  const idleFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 0, 16, 16)),
  ];

  const mushroomIdle = new PIXI.AnimatedSprite(idleFrames);
  mushroomIdle.zIndex = 0;
  [mushroomIdle].forEach(initAnimation);
  return new Mushroom(
    "mushroom",
    [{ animation: mushroomIdle, name: "idle" }],
    new Rect(0, 0, 16, 16)
  );
}

export function loadCoin() {
  const baseTexture = getBaseTexture(ITEMS_TEXTURE);

  const idleFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 112, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(16, 112, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(32, 112, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(48, 112, 16, 16)),
  ];

  const coinIdle = new PIXI.AnimatedSprite(idleFrames);
  coinIdle.zIndex = 3;
  [coinIdle].forEach(initAnimation);
  coinIdle.animationSpeed = 0.32;

  return new Coin(
    "coin",
    [{ animation: coinIdle, name: "idle" }],
    new Rect(0, 0, 16, 16)
  );
}

export function loadMario() {
  const baseTexture = getBaseTexture(PLAYER_TEXTURE);

  // Small
  const runningFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(96, 32, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(112, 32, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(128, 32, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(112, 32, 16, 16)),
  ];
  const idleFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(80, 32, 16, 16)),
  ];
  const jumpFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(160, 32, 16, 16)),
  ];
  const deathFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(176, 32, 16, 16)),
  ];

  // Big
  const bigRunningFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(96, 0, 16, 32)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(112, 0, 16, 32)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(128, 0, 16, 32)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(112, 0, 16, 32)),
  ];
  const bigIdleFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(80, 0, 16, 32)),
  ];
  const bigJumpFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(160, 0, 16, 32)),
  ];

  const marioIdle = new PIXI.AnimatedSprite(idleFrames);
  const marioRunning = new PIXI.AnimatedSprite(runningFrames);
  const marioJumping = new PIXI.AnimatedSprite(jumpFrames);
  const marioDeath = new PIXI.AnimatedSprite(deathFrames);

  const bigMarioIdle = new PIXI.AnimatedSprite(bigIdleFrames);
  const bigMarioRunning = new PIXI.AnimatedSprite(bigRunningFrames);
  const bigMarioJumping = new PIXI.AnimatedSprite(bigJumpFrames);
  [
    marioIdle,
    marioRunning,
    marioJumping,
    bigMarioIdle,
    bigMarioRunning,
    bigMarioJumping,
  ].forEach(initAnimation);
  const mario = new Mario(
    "mario",
    [
      { animation: marioIdle, name: "idle" },
      { animation: marioRunning, name: "running" },
      { animation: marioJumping, name: "jumping" },
      { animation: marioDeath, name: "dead" },
      { animation: bigMarioIdle, name: "big-idle" },
      { animation: bigMarioRunning, name: "big-running" },
      { animation: bigMarioJumping, name: "big-jumping" },
    ],
    new Rect(100, 0, 16, 16)
  );
  return mario;
}

export function loadGoomba() {
  const baseTexture = getBaseTexture(ENEMY_TEXTURE);
  const movingFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 16, 16, 16)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(16, 16, 16, 16)),
  ];
  const deathFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(32, 16, 16, 16)),
  ];
  const goombaMoving = new PIXI.AnimatedSprite(movingFrames);
  const goombaDeath = new PIXI.AnimatedSprite(deathFrames);
  [goombaMoving, goombaDeath].forEach(initAnimation);
  return new Goomba(
    "goomba",
    [
      { animation: goombaMoving, name: "moving" },
      { animation: goombaDeath, name: "dead" },
    ],
    new Rect(0, 0, 16, 16)
  );
}

export function loadTurtle() {
  const baseTexture = getBaseTexture(ENEMY_TEXTURE);
  const movingFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(96, 8, 16, 24)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(112, 8, 16, 24)),
  ];
  const shellFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(160, 16, 16, 16)),
  ];
  const turtleMoving = new PIXI.AnimatedSprite(movingFrames);
  const shellMoving = new PIXI.AnimatedSprite(shellFrames);
  [turtleMoving, shellMoving].forEach(initAnimation);
  return new Turtle(
    "turtle",
    [
      { animation: turtleMoving, name: "moving" },
      { animation: shellMoving, name: "shell" },
    ],
    new Rect(0, 0, 16, 24)
  );
}

export function loadBrick() {
  const baseTexture = getBaseTexture(ITEMS_TEXTURE);
  const movingFrames = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(64, 32, 16, 16)),
  ];
  const brickMoving = new PIXI.AnimatedSprite(movingFrames);
  brickMoving.anchor.y = 0.5;
  [brickMoving].forEach(initAnimation);
  return new Brick(
    "brick",
    [{ animation: brickMoving, name: "moving" }],
    new Rect(0, 0, 16, 16)
  );
}

export function loadMap(map, tileset) {
  const textures = loadTilesetTextures(tileset, "assets/sprites/tiles.png");
  const { layers, tilewidth, tileheight, width, height } = map;
  const tiles = [];
  const scenery = [];
  const mapEntities = [];
  for (const layer of layers) {
    if (!layer.data) {
      continue;
    }
    const sprites = loadSpritesFromLayer(tileset, layer, textures);
    if (layer.name === "Ground") {
      tiles.push(
        ...sprites.map(
          (sprite) =>
            new Tile(
              sprite,
              new Rect(sprite.x, sprite.y, sprite.width, sprite.height)
            )
        )
      );
    } else if (layer.name === "Background") {
      scenery.push(
        ...sprites.map(
          (sprite) =>
            new Tile(
              sprite,
              new Rect(sprite.x, sprite.y, sprite.width, sprite.height)
            )
        )
      );
    } else if (layer.name === "BrickLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          const boxIdle = new PIXI.AnimatedSprite([sprite.texture]);
          return new BrickBox(
            "brickbox",
            [{ animation: boxIdle, name: "idle" }],
            new Rect(sprite.x, sprite.y, 16, 16)
          );
        })
      );
    } else if (layer.name === "MysteryBoxMushroomLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          return loadMysteryBox(sprite, "mushroom");
        })
      );
    } else if (layer.name === "MysteryBoxCoinLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          return loadMysteryBox(sprite, "coin");
        })
      );
    } else if (layer.name === "GoombaLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          const goomba = loadGoomba();
          goomba.setX(sprite.x);
          goomba.setY(sprite.y);
          return goomba;
        })
      );
    } else if (layer.name === "TurtleLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          const turtle = loadTurtle();
          turtle.setX(sprite.x);
          turtle.setY(sprite.y);
          return turtle;
        })
      );
    } else if (layer.name === "MarioLayer") {
      mapEntities.push(
        ...sprites.map((sprite) => {
          const mario = loadMario();
          mario.setX(sprite.x);
          mario.setY(sprite.y);
          return mario;
        })
      );
    }
  }
  return {
    tiles,
    scenery,
    mapEntities,
    worldDimensions: new Vector2(width * tilewidth, height * tileheight),
  };
}

function loadSpritesFromLayer(tileset, layer, textures) {
  const { tilewidth, tileheight } = tileset;
  const { width } = layer;
  const sprites = [];
  let x = 0;
  let y = 0;
  for (const cell of layer.data) {
    if (cell) {
      const texture = textures[cell - 1];
      const sprite = new PIXI.Sprite(texture);
      sprite.x = x * tilewidth;
      sprite.y = y * tileheight;
      sprites.push(sprite);
    }
    x = (x + 1) % width;
    if (x === 0) {
      y++;
    }
  }
  return sprites;
}

function loadTilesetTextures(tileset, path) {
  const tilesTexture = PIXI.BaseTexture.from(path);
  const textures = [];
  const { columns, tilecount, tilewidth, tileheight } = tileset;
  let row = 0;
  let column = 0;
  for (let i = 0; i < tilecount; ++i) {
    const x = column * tilewidth;
    const y = row * tileheight;
    const w = tilewidth;
    const h = tileheight;
    textures.push(
      new PIXI.Texture(tilesTexture, new PIXI.Rectangle(x, y, w, h))
    );
    column = (column + 1) % columns;
    if (column === 0) {
      row++;
    }
  }
  return textures;
}

function initAnimation(animation) {
  animation.x = 0;
  animation.y = 0;
  animation.animationSpeed = 0.167;
  animation.visible = false;
}

function loadMysteryBox(sprite, type = "coin") {
  const baseTilesTexture = getBaseTexture(TILE_TEXTURE);
  const idleFrames = [sprite.texture];
  let x = 400;
  for (let i = 0; i < 2; ++i) {
    idleFrames.push(
      new PIXI.Texture(baseTilesTexture, new PIXI.Rectangle(x, 0, 16, 16))
    );
    x += 16;
  }
  idleFrames.push(sprite.texture);
  const emptyFrames = [
    new PIXI.Texture(baseTilesTexture, new PIXI.Rectangle(x, 0, 16, 16)),
  ];
  const boxIdle = new PIXI.AnimatedSprite(idleFrames);
  const boxEmpty = new PIXI.AnimatedSprite(emptyFrames);
  [boxIdle, boxEmpty].forEach(initAnimation);
  [boxIdle, boxEmpty].forEach((animatedSprite) => {
    animatedSprite.animationSpeed = 0.1;
    animatedSprite.zIndex = 1;
  });
  const box = new MysteryBox(
    "mysterybox",
    [
      { animation: boxIdle, name: "idle" },
      { animation: boxEmpty, name: "empty" },
    ],
    new Rect(sprite.x, sprite.y, 16, 16)
  );
  box.setType(type);
  return box;
}
