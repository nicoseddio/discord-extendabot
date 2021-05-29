const GenericApp = require("../GenericApp");
const ytdl = require("ytdl-core");

class MusicStreamer extends GenericApp {
    initialize() {
        this.queue = new Map();
    }
    commands() {
        return {
            0: {
                'command': '!play',
                'usage': '{video_link}',
                'description': 'Queue a track to play,'+
                    ' joining voice chat if not present'
            },
            1: {
                'command': '!skip',
                'description': 'Skip the currently playing track.'
            },
            2: {
                'command': '!stop',
                'description': 'Clear the queue and leave the voice channel.'
            }
        }
    }
    handle(message, event) {
        if (event != 'message') return;
        const serverQueue = this.queue.get(message.guild.id);

        if (message.content.startsWith(`!play`)) {
            this.execute(message, serverQueue);
            return;
        } else if (message.content.startsWith(`!skip`)) {
            this.skip(message, serverQueue);
            return;
        } else if (message.content.startsWith(`!stop`)) {
            this.stop(message, serverQueue);
            return;
        }
    }

    async execute(message, serverQueue) {
        const args = message.content.split(" ");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
                "I need the permissions to join and speak in your voice channel!"
            );
        }

        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            this.queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                this.play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                console.log(err);
                this.queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
                serverQueue.songs.push(song);
                return message.channel.send(`${song.title} has been added to the queue!`);
        }
    }

    skip(message, serverQueue) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            );
        if (!serverQueue)
            return message.channel.send("There is no song that I could skip!");
        serverQueue.connection.dispatcher.end();
    }

    stop(message, serverQueue) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            );

        if (!serverQueue)
            return message.channel.send("There is no song that I could stop!");

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }

    play(guild, song) {
        const serverQueue = this.queue.get(guild.id);
        if (!song) {
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                this.play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }

}

module.exports = MusicStreamer;