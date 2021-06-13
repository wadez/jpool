
module.exports = (function () {
    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const delay = randomRange(1000, 3000);

    function getSeconds() {
        var seconds = delay / 1000;
        return Math.floor(seconds * 100) / 100;
    }

    return {
        delay,
        getMessage(id) {
            return `Worker ${id} took ${getSeconds()}s`
        }
    }
})();