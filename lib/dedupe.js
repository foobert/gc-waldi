const debug = require("debug")("gc:waldi:dedupe");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

const dirname = path.join(process.env.HOME, ".config", "gc-logs");
const filename = path.join(dirname, "found");

if (!fs.existsSync(dirname)) {
  debug("Creating dedupe config dir at %s", dirname);
  mkdirp.sync(path.dirname(filename));
}

let alreadyFound = [];
if (fs.existsSync(filename)) {
  alreadyFound = fs
    .readFileSync(filename, "utf-8")
    .trim("\n")
    .split("\n");
  debug("Loaded %d items", alreadyFound.length);
}

function check(item) {
  return alreadyFound.includes(item);
}

function found(item) {
  if (!check(item)) {
    alreadyFound.push(item);
  }
  store();
}

function store() {
  fs.writeFileSync(filename, alreadyFound.join("\n") + "\n", "utf-8");
}

module.exports = {
  check,
  found,
  store
};
