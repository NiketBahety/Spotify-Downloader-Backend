var SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const getPlaylistTracks = require("./getMe.js");
const scrape = require("./scrape.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: "9f041c832bba4aab9a8c27c84246352f",
  clientSecret: "d290e9df995f4ac38eead5a7c9af433c",
});

const app = express();
app.use(cors());

app.get("/", function (req, res) {
  spotifyApi.clientCredentialsGrant().then(
    async function (data) {
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body["access_token"]);

      // 6s8OLJrVYDqyUFZigUdB8S

      let tracks = await getPlaylistTracks(spotifyApi, req.query.id);
      const folderName = req.query.id;
      fs.mkdir(
        __dirname + `/${folderName}`,
        { recursive: true },
        async (err) => {
          if (err) throw err;
          else {
            const zip = new AdmZip();
            const dir = fs.readdirSync(__dirname + "/" + folderName);

            let promiseArray = [];

            for (let track of tracks) {
              let searchQuery = "";
              searchQuery += track.name + " ";
              for (let artist of track.artists) {
                searchQuery += artist.name + " ";
              }
              searchQuery.trim();
              searchQuery = searchQuery.replace(/ /g, "+");
              searchQuery = searchQuery.slice(0, -3);

              const res = await scrape(
                "http://www.youtube.com/results?search_query=" + searchQuery
              );

              const URL = res;
              console.log(URL);
              try {
                promiseArray.push(
                  new Promise((resolve) => {
                    ytdl(URL, {
                      format: "mp3",
                      quality: "highestaudio",
                      filter: "audioonly",
                    })
                      .pipe(
                        fs.createWriteStream(
                          path.join(folderName, track.name + ".mp3")
                        )
                      )
                      .on("close", () => {
                        console.log(track.name);
                        zip.addLocalFile(
                          __dirname +
                            "/" +
                            folderName +
                            "/" +
                            track.name +
                            ".mp3"
                        );
                        resolve();
                      });
                  })
                );
              } catch (err) {
                console.log(err);
              }
            }

            try {
              await Promise.all(promiseArray);

              const outputFile = `${folderName}.zip`;
              const zipData = zip.toBuffer();
              zip.writeZip(__dirname + "/" + outputFile);
              res.set("Content-Type", "application/octet-stream");
              res.set(
                "Content-Disposition",
                `attachment; filename=${outputFile}`
              );
              res.set("Content-Length", zipData.length);
              res.send(zipData);

              fs.unlink(__dirname + "/" + outputFile, (err) => {
                if (err) throw err;
                console.log("Zip file deleted successfully");
              });

              fs.rmSync(__dirname + "/" + folderName, {
                recursive: true,
                force: true,
              });
            } catch (err) {
              console.log(err);
            }
          }
        }
      );
    },
    function (err) {
      console.log("Something went wrong when retrieving an access token", err);
    }
  );
});

app.listen(8000, () => console.log("HTTP Server up and running."));
