# discord-extendabot
The extendabot is a simple, single-guild Discord bot built on Node.js, providing an interface for custom "apps": small purpose-driven javascript files that do the heavy lifting of message handling.  

The extendabot's design makes it easy to add, edit, and remove features by simply editing the containerized application files, while the basic bot functions take care of app management and passing on messages and events.  

This bot can do anything!

## setup
The extendabot requires the following dependencies:  
- `discord.js`

Clone the repo and install dependencies with the following commands:  
```
npm install discord.js ffmpeg fluent-ffmpeg @discordjs/opus ytdl-core --save
```

## starting an instance
First, ensure an `auth.json` file with your bot's token is present in the cloned base directory. A template file is available in `{base_dir}/lib/default/`.
Then, from within the cloned directory, run:
```
node index.js
```

## resources
- [Discord Developer Portal](https://discord.com/developers/applications)  
- [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)