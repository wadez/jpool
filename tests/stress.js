const Pool = require("../src")
const path = require("path")

var jobs = 3000;

const pool = new Pool({
    jobLimit: jobs,
    threads: 256,
    messageLogging: true,
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/randomDelay.js'))
}


pool.start()