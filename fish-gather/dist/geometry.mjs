export function photoBounds(width, height, imageWidth, imageHeight, fit = 'contain') {
  if (!imageWidth || !imageHeight || fit === 'cover') return {left:0, top:0, right:width, bottom:height};
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const photoWidth = imageWidth * scale, photoHeight = imageHeight * scale;
  return {left:(width-photoWidth)/2, top:(height-photoHeight)/2, right:(width+photoWidth)/2, bottom:(height+photoHeight)/2};
}
export function insidePhoto(x, y, bounds) {
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}
