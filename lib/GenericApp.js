class GenericApp {
    constructor(kernel,settings,appdata_directory) {
        this.kernel = kernel;
        this.settings = settings;
        this.appdata_directory = appdata_directory;
        this.commands = this.commands();
        this.initialize();
    }
    /**
     * App-specific constructor statements.
     */
    initialize() {}
    /**
     * Set the commands this app listens for.
     * @returns {Object} Collection of indexed command descriptions.
     * 
     * Example: {
     *      '0': {
     *          'command': '!some-command',
     *          'usage': '{req_arg} [opt_arg]',
     *          'description': 'Usage and desc displayed by bot.',
     *          'admin': false
     *      }
     * }
     * 
     * Indices are for programmers' convenience,
     *      regardless of actual command.
     * Command description property names are required as shown.
     * Usage gets appended to command during list compilation.
     * 'admin' property determines whether it appears
     *      only for bot administrators.
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
}

module.exports = GenericApp;

//  SAMPLE APP
//  class Sample extends GenericApp {
//      commands() {
//          return {
//              '0': {
//                  'command': '!test',
//                  'usage': '!test {req_arg} [opt_arg]',
//                  'description': 'Self test to ensure args are captured'
//              }
//          }
//      }
//      handle(m,e) {
//          if (e==='message')
//              m.reply('Hello World!')
//          return true;
//      }
//  }