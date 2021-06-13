const {parentPort, workerData} = require("worker_threads");
const fakeSysCall = require("../helpers")

var start = new Date();
const interval = setInterval(() => {
    var number = Math.random()
    var end = new Date();
    var diff = (end - start) / 1000
    var secs = Math.floor(diff * 100) / 100
    if (number > 0.9) {
        parentPort.postMessage(`found ${number} after ${secs} seconds`)
        clearInterval(interval)
        // parentPort.close();
    }
}, 200)




