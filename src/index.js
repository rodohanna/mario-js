import map from "./assets/maps/mario-map.json";
import tileset from "./assets/maps/world1-1-tileset.json";
import { Level } from "./level";
import "./assets/styles/styles.css";

const level = new Level(map, tileset);

level.load();

let lastUpdate = Date.now();
const loop = () => {
  const now = Date.now();
  const dt = (now - lastUpdate) / 1000;
  lastUpdate = now;

  const fixedStep = 0.016; // Todo: time accumulator.

  level.update(fixedStep);

  level.draw(fixedStep);

  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
