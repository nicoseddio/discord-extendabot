const GenericApp = require("../GenericApp");

class Quantum extends GenericApp {
    commands() {
        return {
            0: {
                'command': '!quantum',
                'description': `Observe Schrödinger's cat!`
            }
        }
    }
    handle(message,event) {
        if (event === 'message'
            & message.content.startsWith(this.commands[0].command))
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