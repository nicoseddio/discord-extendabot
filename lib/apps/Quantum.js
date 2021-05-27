const GenericApp = require("../GenericApp");

class Quantum extends GenericApp {
    handle(message) {
        message.reply(this.getQuantumMessage());
        return true;
    }
    getQuantumMessage() {
        const randomnum = Math.random();
        const threshhold = 0.5;
        if (randomnum < threshhold)
            return `Your cat is dead! |0>, q(${randomnum})`;
        else
            return `Your cat is alive! |1>, q(${randomnum})`;
    }
}

module.exports = Quantum;