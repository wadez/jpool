const Pool = require("../src")
const path = require("path")

var jobs = 3000;

const pool = new Pool({
    jobLimit: jobs,
    messageLogging: true,
    threads: 8,
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/randomDelay.js'))
}


pool.start()