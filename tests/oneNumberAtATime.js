const Pool = require("../src")
const path = require("path")

var jobs = 3000;

const pool = new Pool({
    threads: 1,
    messageLogging: true,
    jobLimit: jobs,
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/findRandomNumber.js'))
}

pool.start()