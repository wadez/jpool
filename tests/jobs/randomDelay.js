const {parentPort, workerData} = require("worker_threads");
const fakeSysCall = require("../helpers")


setTimeout(() => {
    parentPort.postMessage(fakeSysCall.getMessage(workerData.jobId))
    // parentPort.close();
}, fakeSysCall.delay)




