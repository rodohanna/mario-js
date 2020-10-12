const colors = [
  0x001f3f,
  0x0074d9,
  0x7fdbff,
  0x39cccc,
  0x3d9970,
  0x2ecc40,
  0x01ff70,
  0xffdc00,
  0xff851b,
  0xff4136,
  0x85144b,
  0xf012be,
  0xb10dc9,
  0x111111,
  0xaaaaaa,
  0xdddddd,
  0xffffff,
];
export function debugSpatial(ctx) {
  let ci = 0;
  for (const chunk of ctx.spatial.chunks) {
    ci++;
    if (ci > colors.length) {
      ci = 0;
    }
    ctx.addDebugRect(chunk.bounds, colors[ci]);
  }
}
