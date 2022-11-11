const express = require("express");
const { spawn } = require("child_process");
const app = express();
const { tsv2json } = require("tsv-json");
const jsonata = require("jsonata");
const port = 80;
app.get("/pos", (req, res) => {
  const sentence = req.query.sentence;
  let dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python3", [
    // change to python3 in DO
    "CyTag/CyTag.py",
    decodeURIComponent(sentence),
  ]);
  // collect data from script
  python.stdout.on("data", (data) => {
    console.log("Pipe data from python script ...", data.toString());
    dataToSend = jsonata(
      `$.{"i":$number($[0])-1,"w":$[1],"root":$[3],"cat":$[4],"pos":$[5],"mut":$[6]}`
    ).evaluate(tsv2json(data.toString()));
  });
  // in close event we are sure that stream from child process is closed
  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend);
  });
});
app.listen(port, () =>
  console.log(`Example app listening on port 
${port}!`)
);
