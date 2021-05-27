const fetch = require("node-fetch"); // for getting cat pics
const GenericApp = require("../GenericApp");

class CatDelivery extends GenericApp {
    handle(message) {
        if (message.content.startsWith("CAT"))
            this.handleCatPostRequest(message.channel);
        return true;
    }
    async handleCatPostRequest(channel) {
        // log('Posting a cat!');
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        channel.send(file);
    }
}

module.exports = CatDelivery;