const GenericApp = require("../GenericApp");

class Quantum extends GenericApp {
    commands() {
        return {
            "!quantum": "Check in on Schrödinger's cat!"
        }
    }
    handle(message,event) {
        if (event === 'message' & message.content.startsWith('!quantum'))
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