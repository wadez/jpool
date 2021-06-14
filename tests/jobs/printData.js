const {parentPort, workerData} = require("worker_threads");
const fakeSysCall = require("../helpers")


setTimeout(() => {
    parentPort.postMessage("received: " + workerData.token)
}, fakeSysCall.delay)




