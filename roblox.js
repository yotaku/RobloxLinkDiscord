const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const db = require('../db.json');
const { Client, GatewayIntentBits } = require('discord.js');
const client = require('../index').client || global.client;

router.post('/from-roblox', async (req, res) => {
  const { guildId, username, message } = req.body;
  const config = db[guildId];
  if (!config) return res.status(404).send('Not linked');

  const channel = await client.channels.fetch(config.channelId);
  if (channel) {
    channel.send(`**${username}**: ${message}`);
  }

  res.sendStatus(200);
});

module.exports = router;
