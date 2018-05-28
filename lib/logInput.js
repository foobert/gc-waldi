const fs = require("fs");
const tmp = require("tmp");
const child_process = require("child_process");

const distance = require("./distance");

async function getLog(candidate, geocache) {
  const tmpFile = tmp.tmpNameSync();
  try {
    fs.writeFileSync(
      tmpFile,
      [
        "# TYFTC",
        "",
        `# Possible log of ${geocache.gc} ${geocache.parsed.name}`,
        `# Time: ${candidate.time}`,
        `# Distance to candidate: ${Math.round(
          distance(candidate, geocache.parsed)
        )}m at weight ${candidate.weight}`,
        `# Link: https://coord.info/${geocache.gc}`,
        "",
        "# Empty lines and lines starting with # are ignored",
        "# Leave the log empty to skip"
      ].join("\n"),
      { encoding: "utf-8" }
    );
    const command = process.env["EDITOR"] || "vi";
    const editor = child_process.spawn(
      "/bin/sh",
      ["-c", command + ' "' + tmpFile + '"'],
      {
        stdio: "inherit"
      }
    );
    await new Promise(accept => {
      editor.on("exit", accept);
    });

    const editedMessage = fs.readFileSync(tmpFile, { encoding: "utf-8" });
    const cleanedMessage = editedMessage
      .split("\n")
      .filter(line => line.trim().length > 0 && !line.trim().startsWith("#"))
      .join("\n");
    return cleanedMessage;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

module.exports = getLog;
