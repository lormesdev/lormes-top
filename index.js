require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const app = express();
app.get('/', (req, res) => res.send('✅ Bot is alive!'));
app.listen(3000, () => console.log('🌐 Uptime server is running.'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('By Lormes', {
    type: 1, // STREAMING
    url: 'https://twitch.tv/discord'
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

// هذا هو السطر الأهم لتشغيل البوت
client.login(process.env.TOKEN);
