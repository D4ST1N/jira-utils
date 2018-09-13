export default function getPointCoordinates(center, radius, angle) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: center.x + (radius * Math.cos(radians)),
    y: center.y + (radius * Math.sin(radians)),
  };
}
