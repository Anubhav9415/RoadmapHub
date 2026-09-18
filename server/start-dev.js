"use strict";
require("dotenv").config();
const net = require("net");

function checkPort(host, port) {
  return new Promise(function(resolve) {
    var s = net.connect({ host: host, port: port });
    s.setTimeout(2000);
    s.on("connect", function() { s.destroy(); resolve(true); });
    s.on("timeout", function() { s.destroy(); resolve(false); });
    s.on("error", function() { resolve(false); });
  });
}

checkPort("127.0.0.1", 27017).then(function(isUp) {
  if (!isUp) {
    console.log("Local MongoDB not found - starting mongodb-memory-server");
    var MMS = require("mongodb-memory-server");
    MMS.MongoMemoryServer.create({ instance: { dbName: "roadmap-portal" } }).then(function(mongod) {
      var uri = mongod.getUri();
      process.env.MONGODB_URI = uri;
      console.log("In-memory MongoDB at: " + uri);
      require("./server.js");
    }).catch(function(e) {
      console.error("mongodb-memory-server failed:", e.message);
      process.exit(1);
    });
  } else {
    console.log("Local MongoDB detected");
    require("./server.js");
  }
});
