import * as PIXI from "pixi.js";
import { Rect } from "./util";

export class Renderer {
  constructor(debug = false) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.debug = debug;
    this.app = new PIXI.Application({
      autoDensity: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      backgroundColor: 0x71b8ff,
    });
    this.root = new PIXI.Container();
    this.spriteLayer = new PIXI.Container();
    this.debugLayer = new PIXI.Container();
    this.root.addChild(this.spriteLayer);
    this.spriteLayer.sortableChildren = true;
    this.root.addChild(this.debugLayer);
    this.scale = 2;
    this.root.scale.set(this.scale);
    this.camera = new Rect(0, 0, this.app.screen.width, this.app.screen.height);
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.camera.w = this.app.screen.width;
      this.camera.h = this.app.screen.height;
    });
    document.body.appendChild(this.app.view);
  }

  render() {
    if (this.debug) {
      for (const child of this.debugLayer.children) {
        child.x -= this.camera.x;
        child.y -= this.camera.y;
      }
    }
    this.app.renderer.render(this.root);
  }

  addSprite(sprite) {
    this.spriteLayer.addChild(sprite);
  }

  addDebugRect(rect, color = 0xff4136, alpha = 0.6) {
    if (!this.debug) {
      return;
    }
    const graphic = new PIXI.Graphics();
    graphic.beginFill(color);
    graphic.drawRect(rect.x, rect.y, rect.w, rect.h);
    graphic.alpha = alpha;
    graphic.endFill();
    this.debugLayer.addChild(graphic);
  }

  addDebugText(text, where, fontSize = 16) {
    if (!this.debug) {
      return;
    }
    const t = new PIXI.Text(text, {
      fontFamily: "Arial",
      fontSize,
      fill: 0x000000,
      align: "center",
    });

    t.x = where.x;
    t.y = where.y;
    this.debugLayer.addChild(t);
  }

  clearDebug() {
    this.debugLayer.removeChildren();
  }
}
