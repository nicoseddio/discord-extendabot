class GenericApp {
    constructor(kernel,settings) {
        this.kernel = kernel;
        this.settings = settings;
        this.commands = this.commands();
        this.initialize();
    }
    /**
     * App-specific constructor statements.
     */
    initialize() {}
    /**
     * Set the commands this app listens for.
     * @returns {Object} Collection of command strings with string descriptions.
     */
    commands() {
        return {};
    }
    /**
     * Receive a message in this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @param {String} eventString - Associated Discord.js message event type.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message,event) {
        return false;
    }
    /**
     * Receive a message for an unusual event.
     * @param {Discord.Message} message - Discord.js message to process.
     * @param {String} mEvent - Discord.js event to act upon.
     */
    handleSpecial(message,mEvent) {
        return false;
    }
}

module.exports = GenericApp;

// SAMPLE APP
// class Sample extends GenericApp {
//     mEvents() {
//         return ['message']
//     }
//     commands() {
//         return ['sample']
//     }
//     handle() {
//         return true;
//     }
//     handleMEvent() {
//         return true;
//     }
// }