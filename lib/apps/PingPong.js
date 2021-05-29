const GenericApp = require("../GenericApp");

class PingPong extends GenericApp {
    commands() {
        return {
            0: {
                'command': '!ping',
                'description': `Let's play!`
            }
        }
    }
    
    handle(message,event) {
        if (event==='message'
                & message.content.startsWith(
                this.commands[0].command)) {
            const timeTaken = Date.now() - message.createdTimestamp;
            message.channel.send(`pong! message received in ${timeTaken}ms!`)
        }
    }
}

module.exports = PingPong;