# discord-extendabot
The extendabot is a simple, single-guild Discord bot built on Node.js, providing an interface for custom "apps": small purpose-driven javascript files that do the heavy lifting of message handling.  

The extendabot's design makes it easy to add, edit, and remove features by simply editing the containerized application files, while the basic bot functions take care of app management and passing on messages and events.  

This bot can do anything!  

For the sake of simplicity, the Extendabot *does not check* for duplicate commands: this is left to the bot administrator. Bot administrators should ensure that the apps they include all use unique commands, ideally listed in each app's `commands()` method. Duplicate commands will result in multiple apps receiving the command simultaneously.  

## setup
The extendabot requires the following dependencies:  
- `discord.js`

Additionally, the following supplied apps have their own dependencies:
- `MusicStreamer.js`
    - `ffmpeg-static`
    - `@discordjs/opus`
    - `ytdl-core`

Clone the repo and install dependencies with the following commands:  
```
npm install discord.js ffmpeg fluent-ffmpeg @discordjs/opus ytdl-core --save
```

## starting an instance
First, ensure an `auth.json` file with your bot's token is present in the cloned base directory. A template file is available in `{base_dir}/lib/default/`.
Then, from within the cloned directory, run:
```
node index.js >> console.log 2>&1
```

## resources
- [Discord Developer Portal](https://discord.com/developers/applications)  
- [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)