function getDistance(coord1, coord2) {
  const r = 6371000; // earth radius in meters
  const _toRad = x => x * Math.PI / 180;

  const phi1 = _toRad(coord1.lat);
  const phi2 = _toRad(coord2.lat);

  const deltaPhi = _toRad(coord2.lat - coord1.lat);
  const deltaLambda = _toRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = r * c;

  return distance;
}

module.exports = getDistance;
