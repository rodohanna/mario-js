export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

export function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}
