const Pool = require("../src")
const path = require("path")

var jobs = 30;

const pool = new Pool({
    jobLimit: jobs,
    messageLogging: true,
    errorLogging: true,

    onStart({halt}) {
        if (this.jobId > 10) {
            halt("greater than three")
        }
    }
})

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/randomDelay.js'))
}


pool.start()