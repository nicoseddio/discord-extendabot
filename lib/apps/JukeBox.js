const GenericApp = require("../GenericApp");
const ytdl = require("ytdl-core");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

class JukeBox extends GenericApp {
    initialize() {
        this.cache = {};
        this.settings.track_library_dir = 
            this.settings.track_library_dir ||
            this.appdata_directory+'library/';
        if (!fs.existsSync(this.settings.track_library_dir))
            fs.mkdirSync(this.settings.track_library_dir)
    }
    
    commands() {
        return {
            0: {
                'command': '!juke-insert',
                'usage': '{video_link}',
                'description': 'Download a track to the library.',
                'admin': 'true'
            },
            1: {
                'command': '!juke-remove',
                'usage': '{track_id} [..track_ids]',
                'description': 'Remove track(s) from the library.',
                'admin': 'true'
            },
            2: {
                'command': '!juke-purchase',
                'usage': '{track_id}',
                'description': 'Obtain a copy of the track.'
            },
            3: {
                'command': '!juke-list',
                'description': 'Receive a list of tracks in the library.'
            },
            4: {
                'command': '!juke-stream',
                'usage': '{video_link}',
                'description': 'Play a track from YouTube.'
            },
            5: {
                'command': '!juke-info',
                'usage': '{video_link}',
                'description': 'Display track info.'
            }
        }
    }

    
    async handle(message, event) {
        if (event != 'message') return;

        let args = message.content.split(' ');
        if (args.length > 0)
            switch (args[0]) {
                case this.commands[0].command:
                    if (args.length > 1) {
                        message.reply('saving to the library!');
                        this.downloadTrack(args[1],'001');
                    }
                    break;
                case this.commands[5].command:
                    if (args.length > 1) {
                        // message.reply(this.getInfoFromURL(args[1]));
                        console.log(await this.getInfoFromURL(args[1]));
                    }
                    break;
                default:
                    break;
            }
    }

    downloadTrack(url,filename) {
        let stream = ytdl(url, {
            quality: 'highestaudio',
        });
        ffmpeg(stream)
        .audioBitrate(320)
        .save(`${this.settings.track_library_dir}/${filename}.mp3`)
        .on('end', () => {
        });
    }

    async getInfoFromURL(url) {
        let info = await ytdl.getInfo(ytdl.getVideoID(url));
        return info;
    }
}

module.exports = JukeBox;