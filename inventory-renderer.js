const chokidar = require("chokidar");
const ffmpeg = require("fluent-ffmpeg");
var fs = require("fs");
const path = require("path");

var videos = fs.readFileSync("videos.json", "utf8");
var videoJson = JSON.parse(videos);

console.log("videoJson", videoJson);

ffmpeg.setFfmpegPath("c:\\note65\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("c:\\note65\\bin\\ffprobe.exe");

const watcher = chokidar.watch("C:/note65/upload", {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

// Something to use when events are received.
const log = console.log.bind(console);
// Add event listeners.
watcher
  .on("add", (path) => {
    log(`File ${path} has been added`);

    const fileName = path.split("\\").pop();
    console.log(fileName);

    // check if the name is present in the json file

    if (videoJson.some((e) => e.Name === fileName)) {
      log("Video already present");
      // Yes it is present no action required
    } else {
      log("Video not present");

      var obj = {
        Name: fileName,
      };

      videoJson.push(obj);

      fs.writeFile("videos.json", JSON.stringify(videoJson), function (err) {
        if (err) throw err;
        console.log("updated json file");

        ffmpeg.ffprobe(
          `c:\\note65\\upload\\${fileName}`,
          function (err, metadata) {
            if (err) {
              console.log(err);
            }
            console.log(metadata);
          }
        );

        // No it is not present add it to the json file and start the transcoodi

        var proc = new ffmpeg({ source: `c:\\note65\\upload\\${fileName}` })
          .withAspect("16:9")
          .withSize("480x320")
          .saveToFile(`c:\\note65\\ws\\${fileName}`, function (stdout, stderr) {
            console.log("file has been converted succesfully");
          });
      });
    }
  })
  .on("change", (path) => log(`File ${path} has been changed`))
  .on("unlink", (path) => log(`File ${path} has been removed`));
