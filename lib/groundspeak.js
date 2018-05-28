const debug = require("debug")("gc:waldi:groundspeak");
const request = require("superagent");
const uuid = require("uuid/v4");

async function login() {
  debug("Logging in");
  const res = await request
    .post("https://api.groundspeak.com/LiveV6/Geocaching.svc/internal/Login")
    .accept("json")
    .query({ format: "json" })
    .set("User-Agent", "Geocaching/2 CFNetwork/894 Darwin/17.4.0")
    .send({
      ConsumerKey: process.env.GC_CONSUMER_KEY,
      UserName: process.env.GC_USERNAME,
      Password: process.env.GC_PASSWORD
    });
  const accessToken = res.body.GroundspeakAccessToken;
  debug("Access token: %s", accessToken);
  return accessToken;
}

function canLogin() {
  return (
    process.env.GC_USERNAME &&
    process.env.GC_PASSWORD &&
    process.env.GC_CONSUMER_KEY
  );
}

let accessToken = null;

async function postLog(gc, date, text) {
  debug("Posting log for %o", gc);

  if (!accessToken) {
    if (!canLogin()) {
      throw new Error("Missing login info");
    }
    //accessToken = await login();
    accessToken = "a77fa903-abaf-49d0-8c1e-303f0119cc36";
  }

  const logId = uuid().toUpperCase();
  const formattedDate = date.toISOString().replace(/\.000Z$/, ""); // ugh
  const res = await request
    .post(`https://api.groundspeak.com/mobile/v1/geocaches/${gc}/geocachelogs`)
    .accept("json")
    .set("Authorization", "bearer " + accessToken)
    .set("User-Agent", "Geocaching/2 CFNetwork/894 Darwin/17.4.0")
    .send({ guid: logId, loggedDateUtc: formattedDate, text, logTypeId: 2 });
  if (res.status == 422) {
    // duplicate log?
    debug("Could this already have a log?");
    return;
  }
  if (res.status != 201) {
    throw new Error("Unexpected status on geocache post: %o", res.status);
  }
}

module.exports = {
  login,
  canLogin,
  postLog
};
