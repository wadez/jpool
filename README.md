
<h1 align="center">JPool</h1>
<p align="center">A simple job queue which provides control over a NodeJS worker_thread pool.</p>
<hr>

<p align="center">
    <img alt="npm package" src="https://nodei.co/npm/jpool.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jpool/" />
</p>


## What is it
Jobs taking seconds to complete over time is expensive in the long run. This library makes it possible to execute thousands of in under a minute! This is the final result.

<p align="center">
    <img alt="npm package" src="https://res.cloudinary.com/practicaldev/image/fetch/s--vS93gyhh--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://im2.ezgif.com/tmp/ezgif-2-df6b11eac2e5.gif" />
</p>



## Installation
```
npm install jpool
```

## Features
The amount of threads is variable, and all states are deterministic. A job will either pass, fail, or halt. This allows the pool to gracefully shut down or quit abruptly without zombies or runaway processes.

## Usage
Clients need at least 2 files. The file that houses the main event loop, and the job file. Jobs are added to the queue by referencing the file name.


#### Basic example (Main.js)
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
        parentPort.close(); // optional
    }
}, 1000)

```

## See the difference
Each terminal window is processing the same set of jobs. From left to right, the programs use 1, 8, and 256 workers. Threads increase memory usage, but the benefits are worth it!
![imgur](https://imgur.com/PIZeeMU.gif)

## Contributions
Please use reasonable coding standards and write a test for everything you change. There should be a test for single-threaded, average-threaded (8 threads), and stress-threaded (256+ threads). 

## License
MIT
