// بوت برو لايف - جميع الأوامر مدمجة
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Partials, PermissionsBitField } = require('discord.js');
const express = require('express');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ====== Keep Bot Alive ======
const app = express();
app.get('/', (_, res) => res.send('✅ Bot is alive'));
app.listen(3000);

const ADMIN_ROLES = [
  '1391555836878393425',
  '1391555866972393593',
  '1391555865458245702',
  '1391555864485167185'
];

const MEETING_CHANNEL = '1391556054327890071';
const STARK_CHANNEL = '1391556049273749625';
const ANNOUNCE_CHANNEL = '1391556054327890071';
const AZKAR_CHANNEL = '1387128899984687234';

// ====== تكرار الأذكار ======
const azkarList = [
  'سبحان الله',
  'الحمد لله',
  'لا إله إلا الله',
  'الله أكبر',
  'سبحان الله وبحمده',
  'سبحان الله العظيم',
  'لا حول ولا قوة إلا بالله',
  'اللهم صل وسلم على نبينا محمد',
  'أستغفر الله العظيم',
  'حسبي الله لا إله إلا هو عليه توكلت',
  'رب اغفر لي وتب علي',
  'يا حي يا قيوم برحمتك أستغيث',
  'اللهم لك الحمد كما ينبغي لجلال وجهك',
  'اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة',
  'اللهم إني أسألك الجنة وأعوذ بك من النار'
];

setInterval(() => {
  const random = azkarList[Math.floor(Math.random() * azkarList.length)];
  const channel = client.channels.cache.get(AZKAR_CHANNEL);
  if (channel) channel.send(random);
}, 5 * 60 * 1000); // كل 5 دقايق

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const command = message.content.toLowerCase();

  // أمر اجتماع العصابات
  if (command.startsWith('-اجتماع')) {
    if (!message.member.roles.cache.some(r => ADMIN_ROLES.includes(r.id))) return;

    const filter = m => m.author.id === message.author.id;
    message.channel.send('📸 أرسل صورة الاجتماع');
    const collected1 = await message.channel.awaitMessages({ filter, max: 1, time: 60_000 });
    const image = collected1.first().attachments.first()?.url || collected1.first().content;

    message.channel.send('📍 أرسل موقع الاجتماع');
    const collected2 = await message.channel.awaitMessages({ filter, max: 1, time: 60_000 });
    const location = collected2.first().content;

    message.channel.send('⏰ أرسل الساعة');
    const collected3 = await message.channel.awaitMessages({ filter, max: 1, time: 60_000 });
    const time = collected3.first().content;

    const embed = new EmbedBuilder()
      .setTitle('📢 اجتماع عصابات')
      .setDescription(`**🕒 الساعة:** ${time}\n**📍 الموقع:** ${location}`)
      .setImage(image)
      .setColor('Red');

    client.channels.cache.get(MEETING_CHANNEL)?.send({ content: `@everyone`, embeds: [embed] });
  }

  // أمر تعميم
  if (command.startsWith('-تعميم')) {
    if (!message.member.roles.cache.some(r => ADMIN_ROLES.includes(r.id))) return;
    const content = message.content.slice(8).trim();
    if (!content) return message.reply('📝 اكتب التعميم بعد الأمر');
    client.channels.cache.get(ANNOUNCE_CHANNEL)?.send(`@everyone\n${content}`);
  }

  // أمر ستارك
  if (command === '-ستارك') {
    const imageUrl = 'https://media.discordapp.net/attachments/1391556040901918720/1394789729060524093/PL_GANG_720_x_280_.jpg?ex=687a10e9&is=6878bf69&hm=d12764ed9a8ff2c42559ca5c5a9495dc16aa6ca028d84f93a667706e358d034a&=&format=webp';
    const button = new ButtonBuilder()
      .setLabel('📍 موقع عائلة ستارك')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('stark_location');

    const row = new ActionRowBuilder().addComponents(button);
    client.channels.cache.get(STARK_CHANNEL)?.send({ files: [imageUrl], components: [row] });
  }

  // أمر خط
  if (command === '-خط') {
    message.channel.send({ files: ['https://cdn.discordapp.com/attachments/1391556040901918720/1395396363537197186/IMG_8321.png?ex=687a4ba1&is=6878fa21&hm=f8b46c17239f287ab2336930d7c54c4b501df2e5d5295f3b054d60d6722abf29&'] });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'stark_location') {
    interaction.reply({
      content: '📍 موقع ستارك:',
      files: ['https://media.discordapp.net/attachments/1391556040901918720/1395396463806120008/IMG_8322.webp?ex=687a4bba&is=6878fa3a&hm=32804daa0d1d07fe6c4059c641d15ec59a7bf8e39fe7228b00c7ecb007a2d3de&=&format=webp'],
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
