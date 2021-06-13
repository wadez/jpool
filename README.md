## JPool
All the good package names were taken

## What is it
This package allows you to run jobs in parallel by specifying the number of threads. The only requirements are to add the jobs to the queue and start it.

[![npm package](https://nodei.co/npm/jpool.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jpool/)

## Basic example (Main.js)
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

## Basic example (Job.js)
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