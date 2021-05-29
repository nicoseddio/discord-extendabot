// ------------------------------------------- //
// ----------------- Imports ----------------- //
// ------------------------------------------- //
const Discord = require('discord.js');
const fs = require('fs');







// ------------------------------------------- //
// ---------------- Variables ---------------- //
// ------------------------------------------- //
const version = "0.0.000.000"; //Major, Minor, Build, Revision
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')
const cache = {};
let msg_avail_commands = '';
let msg_avail_admin_commands = ''; //init after apps load







// ------------------------------------------- //
// ----------------- Startup ----------------- //
// ------------------------------------------- //
client.login(auth.token);
client.on('ready', () => {
    log(`Logged in as ${client.user.tag}!`,'\n');

    cache.apps = loadApps(  config.apps,
                            buildKernel(),
                            config.apps_dir,
                            config.appdata_dir );

    [msg_avail_commands, msg_avail_admin_commands] = 
        compileCommandsMessages(cache.apps);

    saveConfig(config,'config.json');

    dumpSession(config,cache);
});







// ------------------------------------------- //
// ---------------- Listeners ---------------- //
// ------------------------------------------- //
client.on('message', async function(message) {
    try {
        //ensure message originates from bound guild
        try { if (message.guild.id != config.guild.id) return; }
        catch (error) { log("Invalid guild."); return; }

        //ignore self
        if (message.author.id === client.user.id) return;

        //parse commands for system
        let args = message.content.split(' ');

        if (args.length > 0)
            switch (args[0]) {
                case '!help':
                case '!commands':
                    message.reply(msg_avail_commands);
                    if (config.sudoers.includes(message.author.id))
                        message.channel.send(`View admin commands with \`!sudo-commands\`.`)
                    break;
                case '!sudo-commands':
                    if (config.sudoers.includes(message.author.id))
                        message.reply(msg_avail_admin_commands);
                    break;
                default:
                    distribute(message,'message',cache.apps);
                    break;
            }
    } catch (error) {
        log(`ERROR encountered, skipping message:\n` +
            `From ${message.author.tag}: ${message.content}\n` +
            error);
    }
});
client.on('messageDelete', async function(message) {
    try {
        distribute(message,'messageDelete',cache.apps);
    } catch (error) {
        log(`ERROR encountered, skipping message delete:\n` +
            `From ${message.author.tag}: ${message.content}\n` +
            error);
    }
});
// client.on('guildCreate', async function(guild) {
//     //on first guild join
//     if (config.guild === "") {
//         //establish linked guild
//         config.guild = guild.id;
//         //establish primary bot owner
//         let ownerTag = undefined;
//         client.users.fetch(guild.ownerID)
//                     .then(user => config.sudoers.push(user.id))
//     }
//     //if different guild, leave.
//     else {
//         guild.leave().catch(err => {
//             console.log(`there was an error leaving the guild: \n ${err.message}`);
//             }
//         );
//     }
// })







// ------------------------------------------- //
// ---------------- Functions ---------------- //
// ------------------------------------------- //
function compileCommandsMessages(cache_apps) {
    let commandsList = 'active commands:',
        adminCommandsList = 'active administrative commands:';
    //for each app's defined commands
    for (a in cache_apps) {
        let cs = '', cs_adm = '',
            title = `\n\n*from ${a.replace('.js','')}:*`;
        //for each command description
        Object.keys(cache_apps[a].commands).forEach(c => {
            let def = cache_apps[a].commands[c];
            //add command
            let cstr = `\n• **\`${def.command}`
            //add command usage if present
            if (typeof(def.usage) === 'string')
                if(def.usage.length > 0)
                    cstr+=` ${def.usage}`
            //add command description
            cstr+=`\`**: ${def.description}`
            //add to approriate admin/user message
            if (def.admin) cs_adm += cstr;
            else cs += cstr;
        })
        //if applicable, add to appropriate list
        if (cs.length > 0) commandsList += title+cs;
        if (cs_adm.length > 0) adminCommandsList += title+cs_adm;
    }
    return [commandsList, adminCommandsList];
}
//pass message to all enabled apps
function distribute(message,event,apps) {
    for (app in apps) {
        apps[app].handle(message,event);
    }
}
function loadApps(apps_cfg,kernel,apps_dir,appdata_dir) {
    const aCache = {};
    // check appdata directory
    if(!fs.existsSync(appdata_dir)) fs.mkdirSync(appdata_dir)
    // load in directory
    fs.readdirSync(apps_dir)
      .filter(a => a.endsWith('.js'))
      .filter(a => !a.startsWith('._'))
      .forEach(app => {
            const appObj = require(apps_dir+app);
            //allocate settings in config
            apps_cfg[app] = apps_cfg[app] || {};
            apps_cfg[app].settings = apps_cfg[app].settings || {};
            //allocate directory in appdata
            let dir = appdata_dir+app+'/'
            if(!fs.existsSync(dir)) fs.mkdirSync(dir)
            //initialize app in cache
            aCache[app] = new appObj(kernel,apps_cfg[app].settings,dir);
    });
    log(`Loaded ${Object.keys(aCache).length} apps.`);
    return aCache;
}

function buildKernel() {
    class kernel {
        getClientID() {
            return client.user.id;
        }
        log(message) { //kernel call for apps
            log(message); //function call
        }
    }
    return new kernel();
}

function dumpSession(config,cache) {
    objectToJSON(config,'dump_configBackup.json')
    objectToJSON(cache, 'dump_cacheBackup.json')
}

// Utility Functions
function objectToJSON(object = {},filename = 'dump_file.json') {
    let data = JSON.stringify(replaceCircular(object), null, '    ');
    fs.writeFile(filename, data, err => {
        if (err) {
            console.error(err);
            console.log(`\n\nEmergency dump:\n${JSON.stringify(object)}`)
            return; }
    });
}
// from https://gist.github.com/saitonakamura/d51aa672c929e35cc81fa5a0e31f12a9
// example: JSON.stringify(replaceCircular(obj))
var replaceCircular = function(val, cache) {
    cache = cache || new WeakSet();
    if (val && typeof(val) == 'object') {
        if (cache.has(val)) return '[Circular]';
        cache.add(val);
        var obj = (Array.isArray(val) ? [] : {});
        for(var idx in val) {
            obj[idx] = replaceCircular(val[idx], cache);
        }
        cache.delete(val);
        return obj;
    }
    return val;
};
function createTimeStamp(date = new Date(),fileSystemSafe=false) {
    let ts = `[` +
        `${String(date.getFullYear()).substr(-2)}`      +
        `${String(date.getMonth()+1).padStart(2,'0')}`  +
        `${String(date.getDate()).padStart(2,'0')} `    +
        `${String(date.getHours()).padStart(2,'0')}:`   +
        `${String(date.getMinutes()).padStart(2,'0')}:` +
        `${String(date.getSeconds()).padStart(2,'0')}`  +
    `]`;
    if (fileSystemSafe) {
        ts =  ts.replaceAll(':','-')
                .replaceAll(' ','_')
                .replaceAll('[','')
                .replaceAll(']','')
    }
    return ts;
}



function saveConfig(config,filename) {
    log("Saving config file...")
    objectToJSON(config,filename)
    log(`Config saved to ${filename}.`)
}
function log(str='Marker message.',new_line='') {
    let logmessage = `${new_line}${createTimeStamp()} ${str}`;
    console.log(logmessage);
}