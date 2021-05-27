// Imports
const Discord = require('discord.js');
const fs = require('fs');

// Inits
const version = "0.0.000.000"; //Major, Minor, Build, Revision
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')
const cache = {};

// Startup
client.login(auth.token);
client.on('ready', () => {
    console.log(`\nLogged in as ${client.user.tag}!`);

    cache.apps = loadApps(config.apps,buildKernel());
    console.log(`Loaded ${Object.keys(cache.apps).length} apps.`)

    selftest();
});

// Listeners
client.on('message', async function(message) {
    if (message.author.id === client.user.id) return; //ignore self
    //kernel.distribute(message, 'message');
});
client.on('messageDelete', async function(message) {
    //kernel.distribute(message, 'messageDelete');
});
client.on('guildCreate', async function(guild) {
    //on first guild join
    if (config.guild === "") {
        //establish linked guild
        config.guild = guild.id;

        //establish primary bot owner
        let ownerTag = undefined;
        client.users.fetch(guild.ownerID)
                    .then(user => config.sudoers.push(user.id))
    }
    //if different guild, leave.
    else {
        guild.leave().catch(err => {
            console.log(`there was an error leaving the guild: \n ${err.message}`);
            }
        );
    }
})

// Functions
function selftest() {
    dumpSession(config,cache);
    return;
}



function loadApps(appsConfig,kernel,dir='./lib/apps/') {
    let cfg = appsConfig;
    const aCache = {};
    // load in directory
    fs.readdirSync(dir)
      .filter(a => a.endsWith('.js'))
      .filter(a => !a.startsWith('._'))
      .forEach(app => {
            const appObj = require(dir+app);
            cfg[app] = cfg[app] || {};
            cfg[app].settings = cfg[app].settings || {};
            aCache[app] = new appObj(kernel,cfg[app].settings);
      }
    );
    return aCache;
}

function buildKernel() {
    class kernel {
    }
    return new kernel();
}

function dumpSession(config,cache) {
    objectToJSON(config,'dump_configBackup')
    objectToJSON(cache, 'dump_cacheBackup')
}

function objectToJSON(object = this.cache,filename = 'dump_file') {
    let data = JSON.stringify(replaceCircular(object), null, '    ');
    fs.writeFile(filename+'.json', data, function (err) {
        if (err) {
            console.log(`filesave error: ${err.message}`);
            return;
        }
        return true;
    });
}
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