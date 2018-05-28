const debug = require("debug")("gc:waldi");
const dedupe = require("./lib/dedupe");
const groundspeak = require("./lib/groundspeak");
const getLog = require("./lib/logInput");
const getTrackPoints = require("./lib/gpx");
const findCandidates = require("./lib/candidates");
const getGeocaches = require("./lib/geocaches");
const { canLogin } = require("./lib/groundspeak");

function getBounds(point) {
  return [
    point.lat + 0.001,
    point.lon - 0.001,
    point.lat - 0.001,
    point.lon + 0.001
  ];
}

async function analyze(file) {
  const points = getTrackPoints(file);
  const candidates = findCandidates(points);
  let seen = [];
  for (const candidate of candidates) {
    let box = getBounds(candidate);
    let geocaches = await getGeocaches(box);
    for (const geocache of geocaches) {
      if (seen.includes(geocache.gc)) {
        continue;
      }
      seen.push(geocache.gc);
      if (dedupe.check(geocache.gc)) {
        console.log("🙂 %s %s", geocache.gc, geocache.parsed.name);
      } else {
        if (!canLogin()) {
          console.log(
            "🤔 %s https://coord.info/%s",
            geocache.parsed.name,
            geocache.gc
          );
          continue;
        }
        const msg = await getLog(candidate, geocache);
        if (msg == "EXIT") {
          debug("Aborting processing");
          return;
        }
        if (msg.length > 0) {
          console.log("😀 %s %s", geocache.gc, geocache.parsed.name);
          await groundspeak.postLog(geocache.gc, candidate.time, msg);
        } else {
          console.log("🤨 %s %s", geocache.gc, geocache.parsed.name);
        }
        dedupe.found(geocache.gc);
      }
    }
  }
}

const filename = process.argv[2];

analyze(filename).catch(console.log);
