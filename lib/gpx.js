const xml2js = require("xml2js");
const fs = require("fs");

function getTrackPoints(file) {
  const points = [];
  const gpx = fs.readFileSync(file, "utf-8");
  xml2js.parseString(gpx, function(err, json) {
    if (err) {
      throw new Error("Invalid XML format");
    }
    if (json.gpx.$.xmlns !== "http://www.topografix.com/GPX/1/1")
      throw new Error("Invalid gpx format");

    for (var trk of json.gpx.trk) {
      for (var trkseg of trk.trkseg) {
        for (var trkpt of trkseg.trkpt) {
          const point = {
            lat: parseFloat(trkpt.$.lat),
            lon: parseFloat(trkpt.$.lon),
            time: new Date(trkpt.time)
          };
          // this should be replaced by an async-iterator?
          points.push(point);
        }
      }
    }
  });
  return points;
}

module.exports = getTrackPoints;
