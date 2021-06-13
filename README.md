## JPool
A simple job queue which provides control over a NodeJS worker_thread pool.

## What is it
Jobs taking seconds to complete over time is expensive in the long run. This library makes it possible to execute thousands of in under a minute! This is the final result.

![image](https://res.cloudinary.com/practicaldev/image/fetch/s--vS93gyhh--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://im2.ezgif.com/tmp/ezgif-2-df6b11eac2e5.gif)


## Installation
[![npm package](https://nodei.co/npm/jpool.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jpool/)

## Features
The amount of threads is variable, and all states are deterministic. A job will either pass, fail, or halt. This allows the pool to gracefully shut down or quit abruptly without zombies or runaway processes.

## Usage
Clients need at least 2 files. The file that houses the main event loop, and the job file. Jobs are added to the queue by referencing the file name.

```js
// create a new pool. Pass options to configure the initial state.
const pool = new Pool({threads: 8});

// add a job to the queue
pool.add(path.resolve(__dirname, 'jobs/findRandomNumber.js'));

// process all jobs in queue and listen for more.
pool.start()

// jobs can be added while pool is running
pool.add(path.resolve(__dirname, 'jobs/findRandomNumber.js'));

// stop the pool
pool.stop()
```


#### Basic example (Main.js)
```js
const Pool = require("jpool")
const path = require("path")

var jobs = 30;

const pool = new Pool()

for (var i = 0; i < jobs; i++) {
    pool.add(path.resolve(__dirname, 'jobs/findRandomNumber.js'))
}

pool.start()
```

#### Basic example (Job.js)
```js
const {parentPort, workerData} = require("worker_threads");

// Run anything. Once the process terminates, then
// the pool will take another item from the queue.
// Calling parentPort.close(); is like resolving a promise
// but it is not required as long as the program terminates normally.

const interval = setInterval(() => {
    if (Math.random() > 0.8) {
        parentPort.postMessage("Found good number")
        clearInterval(interval) // very important!
        parentPort.close();
    }
}, 1000)

```

## See the difference
![imgur](https://imgur.com/PIZeeMU.gif)
