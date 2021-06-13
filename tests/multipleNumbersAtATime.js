const Pool = require("../src")
const path = require("path")

var jobs = 30;

const pool = new Pool({
    jobLimit: jobs, // no job limit means pool will run until stopped
    messageLogging: true,
    threads: 8,
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/findRandomNumber.js'))
}


pool.start()