# discord-extendabot
A full redesign of what was the meow-bot for "The Jasmine Dragon" Discord server, the Extendabot is a simple Discord bot providing an interface for custom "apps": this bot can do anything!

## setup
meow-bot requires the following dependencies:  
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
[Discord Developer Portal](https://discord.com/developers/applications)