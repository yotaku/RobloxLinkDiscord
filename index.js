const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const robloxRoutes = require('./routes/roblox');

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const CLIENT_ID = 'YOUR_CLIENT_ID';

const app = express();
app.use(bodyParser.json());
app.use('/roblox', robloxRoutes);

const db = require('./db.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'setup') {
    const channel = interaction.options.getChannel('channel');
    db[interaction.guildId] = { channelId: channel.id };
    fs.writeJsonSync('./db.json', db);
    await interaction.reply(`このチャンネル（${channel.name}）がRobloxとリンクされました。`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const config = db[message.guildId];
  if (!config || message.channel.id !== config.channelId) return;

  // RobloxにPOST
  const res = await fetch('https://YOUR_RENDER_URL/roblox/from-discord', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: message.author.username,
      message: message.content
    })
  });
});

client.login(TOKEN);

// Slashコマンド登録
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: [{
      name: 'setup',
      description: 'Robloxとつなげるチャンネルを設定します',
      options: [{
        name: 'channel',
        type: 7, // CHANNEL
        description: 'リンクするチャンネル',
        required: true
      }]
    }]
  });
})();

app.listen(3000, () => console.log('Server running on port 3000'));
