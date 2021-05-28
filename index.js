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
    log(`Logged in as ${client.user.tag}!`,'\n');

    cache.apps = loadApps(config.apps,buildKernel());
    log(`Loaded ${Object.keys(cache.apps).length} apps.`);

    checkDirectory(config.local_files);
    saveConfig(config,'config.json')

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
    objectToJSON(config,'dump_configBackup.json')
    objectToJSON(cache, 'dump_cacheBackup.json')
}

function objectToJSON(object = {},filename = 'dump_file.json') {
    let data = JSON.stringify(replaceCircular(object), null, '    ');
    fs.writeFile(filename, data, function (err) {
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

function saveConfig(config,filename,make_backup=true) {
    log("Saving config file...")
    if (make_backup) {
        try {
            let contents = fs.readFileSync(filename)
            fs.writeFileSync(filename+'.backup',contents)
        } catch(e) {
            log(`ERROR backing up config file:\n${e}`)
        }
    }
    objectToJSON(config,filename)
    log(`Config saved to ${filename}.`)
}
function log(str='Marker message.',new_line='',log_to_file=true) {
    let logmessage = `${new_line}${createTimeStamp()} ${str}`;
    console.log(logmessage);
    if(log_to_file) logToFile(logmessage);
}
function logToFile(str='Marker message.', file='./console.log') {
    fs.appendFile(file, `\n`+str, err => {
        if (err) { console.error(err); return; }
    })
}

function checkDirectory(dir) {
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    } catch(error) {
        log(`ERROR reading or creating local files:\n`+
            `Directory: ${dir}\n${error}`);
    }
}