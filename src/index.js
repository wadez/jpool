const { Worker } = require("worker_threads");

module.exports = (function () {
    const queue = [];
    let pool = new Set();
    let workers = new Set();
    let done = false;
    let jobsCreated = 0;
    let workersCreated = 0;
    let jobsPassed = 0;
    let jobsFailed = 0;
    let totalExecutions = 0;
    let threadsRunning = 0;
    const fatalErrors = [];
    const fatalPromises = [];
    const errors = [];

    require('events').EventEmitter.prototype._maxListeners = 100;

    let initialState = {
        onCreate(threadingData) {},
        onStart() {},
        onExit(exitCode) {},
        onMessage(data) {},
        onError(err, resolve){},
        onMessageError(err){},
        onShutdown(){},
        onHalt(){},
        threads: 256,
        logging: true,
        messageLogging: false,
        errorLogging: true,
        timeout: 1000,
        jobLimit: Number.MAX_SAFE_INTEGER,
        jobTimeout: 0,
        fatalTimeouts: false,
    }

    let state = Object.assign({}, initialState)


    const promises = [];
    function dequeWithPool() {
        (function () {

            while (typeof nextThread() !== "undefined" && queue.length && totalExecutions < state.jobLimit) {
                const id = pop();
                const job = queue.pop();

                if (job) {
                    workersCreated++;

                    const {data = {}} = job;
                    const threadingData = {
                        workerId: id,
                        jobId: workersCreated
                    }
                    const workerData = {
                        ...data,
                        ...threadingData
                    }

                    state.onCreate.call(workerData)
                    promises.push(new Promise((resolve, reject) => {

                        const worker = new Worker(job, {
                            workerData
                        })

                        workers.add(worker)

                        const pass = () => {
                            jobsPassed++;
                            totalExecutions++;
                            workers.delete(worker);
                            push(id);
                            resolve();
                        }

                        const halt = (reason) => {
                            jobsFailed++;
                            totalExecutions++;
                            fatalErrors.push(reason);
                            fatalPromises.push(new Promise(resolve2 => {
                                Promise.allSettled([...workers].map(w => w.terminate()))
                                .then(() => {
                                    resolve2({workerData, reason})
                                })
                                // workers.forEach(w => {
                                //     w.terminate();
                                // })

                            }))
                            reject({workerData, reason})
                        }

                        function fail(reason) {
                            jobsFailed++;
                            totalExecutions++;
                            worker.terminate()
                            push(id);
                            errors.push(reason);
                            // reject(reason)
                        }

                        worker.on("online", () => {
                            state.onStart.call(workerData, {pass, fail, halt});
                        })

                        worker.on("exit", exitCode => {
                            let adjust = (reason) => {
                                jobsPassed --;
                                halt(reason)
                            }
                            state.onExit.call(workerData, {exitCode, pass, halt: adjust, fail})
                            pass()
                        })

                        worker.on("message", value => {
                            if (state.messageLogging) {
                                console.log(value)
                            }
                            state.onMessage.call(workerData, {value, pass, fail, halt})
                        })

                        worker.on("messageError", value => {
                            if (state.messageLogging) {
                                console.error(value)
                            }
                            state.onMessageError.call(workerData, {value, pass, fail, halt})
                        })

                        worker.on("error", error => {
                            let pass = (...args) => {
                                jobsFailed --;
                                pass(...args)
                            }
                            state.onError.call(workerData, {error, pass, fail, halt})
                            fail(error)
                        })

                        if (state.jobTimeout) {
                            setTimeout(() => {
                                if (state.fatalTimeouts) {
                                    halt("job timed out")
                                } else {
                                    fail("job timed out")
                                }
                            }, state.jobTimeout)
                        }

                    }))

                } else {
                    promises.push(new Promise(resolve => {
                        push(id);
                        resolve();
                    }));
                }
            }
            return Promise.race(promises);
        })().catch(({workerData, reason}) => {
            fatalPromises.push(new Promise(resolve2 => {
                resolve2({workerData, reason})
            }))
        })
    }


    function mainLoop() {
        setTimeout(() => {
            if (fatalErrors.length) {
                Promise.any(fatalPromises).then(({workerData, reason}) => {
                    if (state.errorLogging) {
                        console.error(reason);
                    }
                    state.onHalt.call(workerData, reason)
                    // stop();
                })
                stop();
            }
            if (!done) {
                if (totalExecutions >= state.jobLimit) {
                    stop();
                }
                dequeWithPool();
                status()
                mainLoop()
            }
        }, state.timeout)
    }

    function getThreadsInPool() {
        return pool.size;
    }

    function nextThread() {
        return pool.values().next().value;
    }

    function push (value) {
        pool.add(value);
    }

    function pop() {
        const id = nextThread();
        pool.delete(id);
        return id;
    }

    function stop() {
        done = true;
        if (state.logging) {
            console.log("gracefully shutting down thread pool");
        }
        const stopInterval = setInterval(() => {
            if (getThreadsInPool() === state.threads) {
                clearInterval(stopInterval)
                state.onShutdown()
                if (state.logging) {
                    console.log("thread pool terminated")
                }
            }
        }, 200)
    }

    let lastStatus = "";
    function status(p) {
        threadsRunning = state.threads - getThreadsInPool();
        var status = `${jobsPassed} out of ${jobsCreated} complete; ${jobsFailed} jobs failed. Currently using ${threadsRunning} workers.`
        if (state.logging && status !== lastStatus) {
            console.log(status)
            lastStatus = status;
        }
    }

    function setNumberOfThreads(amount) {

        const newPool = new Set();
        for (var i = 0; i<amount; i++) {
            newPool.add(i);
        }
        pool = newPool;
    }

    function setState(newState) {
        state = {...initialState, ...newState}
        setNumberOfThreads(state.threads)
    }

    function changeState(newState) {
        state = {...state, ...newState}
        setNumberOfThreads(state.threads)
    }

    function addJob(workerPath) {
        queue.push(workerPath);
        jobsCreated++;
    }

    function startPool() {
        mainLoop();
    }

    function getErrors() {
        return [].concat(errors);
    }

    function getFatalErrors() {
        return [].concat(errors);
    }

    function getQueue() {
        return [].concat(queue);
    }

    function Pool(obj) {
        setState(obj);
    }

    Pool.prototype.add = addJob
    Pool.prototype.start = startPool
    Pool.prototype.stop = stop
    Pool.prototype.setState = setState
    Pool.prototype.changeState = changeState
    Pool.prototype.getErrors = getErrors
    Pool.prototype.getFatalErrors = getFatalErrors
    Pool.prototype.getQueue = getQueue
    return Pool;
})();

