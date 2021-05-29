const { log } = require("util");
const GenericApp = require("../GenericApp");

class CatMod extends GenericApp {
    commands() {
        return {
            0: {
                'command': '!catmod-observe',
                'usage': '{channel_id}',
                'description': 'Bind the CatModerator to a channel by id.',
                'admin': true
            },
            1: {
                'command': '!catmod-ignore',
                'usage': '{channel_id}',
                'description': 'Remove a channel binding from the CatModerator.',
                'admin': true
            }
        }
    }
    initialize() {
        if (!this.settings.hasOwnProperty('boundChannels'))
            this.settings.boundChannels = [];
        this.clientID = this.kernel.getClientID();
    }
    handle(message,event) {
        if (this.settings.boundChannels
                .includes(message.channel.id))
            switch (event) {
                case 'message':
                    this.handleNoCatsCheck(message);
                    this.handleCatReply(message.channel,0)                
                    break;
                case 'messageDelete':
                    this.sendCondolencesDM(message);
                    break;
                default:
                    break;
            }
    }

    notACatMessage(channelID,role=false) {
        let roleMsg = ""
        if (role) roleMsg = `The residing _${role}_ is tasked with nurturing proper cat worship.\n`
        return "\n"+
            "Meow!\n"+
            `Thanks for posting to the <#${channelID}>!\n`+
            "One of your messages was deleted because it doesn't fit the channel theme:\n"+
            "**Only 'cat'** and media of **cats** may be posted.\n"+
            roleMsg+
            `Please repost to the <#${channelID}>!\n`+
            "We want to see your kitties!"
    }
    async sendCondolencesDM(message) {
        message.author.send(
            this.notACatMessage(message.channel.id) +
            `\n\n*Deleted Message:*\n\`${message.content}\``);
        this.kernel.log(`Message deleted in the cat-cafe. Informed ${message.author.tag}.`)
    }
    async handleCatReply(channel,time_sleep_ms=20000,num_fetched_messages=10) {
        await new Promise(r => setTimeout(r, time_sleep_ms));
        channel.messages.fetch({limit:num_fetched_messages}).then(msgs => {
            // filters last 10 messages for meow-bot responses and images/links.
            // If the last message was not meow-bot, meow-bot comments 'cat'.
            if (!(msgs.filter(msg =>
                    msg.content.includes('http') ||
                    msg.attachments.size > 0 ||
                    msg.author.id === this.clientID
                    ).first().author.id === this.clientID)) {
                channel.send('cat');
            }
        });
    }
    async handleNoCatsCheck(message) {
        const words = message.content.split(' ');
        let notCats = false;
        for (let w in words) {
            let word = String(words[w].toLowerCase());
            if ( !( checkMadeOfWords(word,['cat','cats'])
                    ||  word === ""
                    ||  word.startsWith("http")
                ) ) {
                    notCats = true;
            }
        }
        if (notCats) {
            await sleep(500);
            message.delete();
            // delete notification now handled by client.on("messageDelete")
            //     to allow for cat-god moderation
            this.kernel.log(`That's not a kitty!`);
        }
    }
}



/**
 * Check whether a word is made of other words.
 * @param {string} word - Primary word to check against.
 * @param {string[]} words - Array of words to check in primary word.
 * @param {boolean} exclusive - Whether word should only contain any one of words.
 */
function checkMadeOfWords(word, words, exclusive=false) {
    if (exclusive) {
        let wordsCheckList = [];
        for (let w in words) {
            let work = word;
            let okay = true;
            // while viable w-length sections left
            while (work.length >= words[w].length && okay) {
                // check current w-length section
                if (work.startsWith(words[w])) {
                    // move to next w-length section
                    work = work.substring(words[w].length);
                }
                else {
                    // terminate current word
                    okay = false;
                }
            }
            // document result of check
            wordsCheckList.push(okay);
        }
        // true if word made of any one words
        return wordsCheckList.includes(true);
    } else {
        let work = word;
        let okay = true;
        let swords = words.sort().reverse();
        // same logic as above,
        //   but checks all words on every w-length section
        while (work.length > 0 && okay) {
            let passed = false;
            for (let w in swords) {
                if (work.startsWith(swords[w])) {
                    work = work.substring(swords[w].length);
                    passed = true;
                    break;
                }
            }
            if (!passed)
                okay = false;
        }
        return okay;
    }
}
/**
 * Pause thread. Example: `await sleep(2000)`
 * @param {number} ms - Length of time to sleep in milliseconds.
 */
function sleep(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = CatMod;