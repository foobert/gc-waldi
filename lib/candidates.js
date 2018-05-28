const debug = require("debug")("gc:waldi:candidates");
const getDistance = require("./distance");
const _ = require("lodash");

function checkWindow(w) {
  if (w.length < 5) {
    // not enough data points, dismiss
    return;
  }

  const windowDuration = (w[w.length - 1].time - w[0].time) / 1000;
  if (windowDuration < 120) {
    // spent less than 2 minutes here
    return;
  }

  const avgLat = w.map(p => p.lat).reduce((s, x) => s + x, 0) / w.length;
  const avgLon = w.map(p => p.lon).reduce((s, x) => s + x, 0) / w.length;
  const avgTime = new Date(w[0].time + windowDuration * 500);
  const center = { lat: avgLat, lon: avgLon, time: avgTime };

  debug("Found candidate at %d %d", center.lat, center.lon);

  return center;
}

function cluster(points) {
  debug("Clustering %d points", points.length);
  let centers = [];
  for (const point of points) {
    let outlier = true;
    for (const center of centers) {
      const distance = getDistance(center, point);
      if (distance < 50) {
        //debug("fits into existing cluster at %o", center);
        center.lat = (center.lat + point.lat) / 2;
        center.lon = (center.lon + point.lon) / 2;
        center.weight += 1;
        outlier = false;
        break;
      }
    }
    if (outlier) {
      //debug("needs new cluster at %o", point);
      centers.push(Object.assign({ weight: 1 }, point));
    }
  }
  return centers;
}

function findCandidates(points) {
  let windows = {};
  let candidates = [];

  for (const point of points) {
    for (let k of _.keys(windows)) {
      let w = windows[k];
      // close all windows which are older than 10 minutes
      // close all windows which are farer than 500 meters
      if (point.time - k > 10 * 60 * 2000 || getDistance(w[0], point) > 50) {
        const candidate = checkWindow(w);
        if (candidate) {
          candidates.push(candidate);
        }
        delete windows[k];
      }
    }

    // add point to all existing windows
    for (let k of _.keys(windows)) {
      windows[k].push(point);
    }

    // open a new window starting from this point
    windows[point.time] = [point];
  }

  return cluster(candidates);
}

module.exports = findCandidates;
