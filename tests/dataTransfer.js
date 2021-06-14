const Pool = require("../src")
const path = require("path")

var jobs = 3000;

const pool = new Pool({
    threads: 8,
    messageLogging: true,
    jobLimit: jobs,
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/printData.js'), {token: Math.random()})
}

pool.start()