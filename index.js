require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, PresenceUpdateStatus } = require('discord.js');
const express = require('express');

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

const FULL_ACCESS_ROLE = '1394974811490619442';
const ANNOUNCEMENT_CHANNEL_ID = '1391556047990292621';
const MEETING_CHANNEL_ID = '1391556054327890071';
const STARK_MENU_CHANNEL_ID = '1391556049273749625';
const PROMOTION_CHANNEL_ID = '1395008017044602890';
const TICKET_CATEGORIES = ['1391556033704362064', '1391556034698547200'];
const gangTasks = new Map();

const SINGLE_PROMOTION_QUOTE = '⦿ الزعامة موقف، وليست منصباً.';

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'PLRP', type: ActivityType.Playing }],
    status: PresenceUpdateStatus.DoNotDisturb
  });

  sendPromotion();
  setInterval(sendPromotion, 5 * 60 * 1000);
});

function sendPromotion() {
  const channel = client.channels.cache.get(PROMOTION_CHANNEL_ID);
  if (!channel?.isTextBased()) return;
  channel.send(`**${SINGLE_PROMOTION_QUOTE}**`);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const isFullAccess = message.member.roles.cache.has(FULL_ACCESS_ROLE);

  if (message.content.startsWith('-اضافة مهام')) {
    const role = message.mentions.roles.first();
    const task = message.content.split(/ +/).slice(2).join(' ');
    if (!role || !task) return message.reply('**استخدم الأمر بالشكل التالي: `-اضافة مهام @الرتبة المهام`**');
    gangTasks.set(role.id, task);
    message.reply('**تم إضافة المهام بنجاح <a:pl0:1394782288981528717>**');
  }

  if (message.content.startsWith('-مهام')) {
    const role = message.mentions.roles.first();
    if (!role || !gangTasks.has(role.id)) return message.reply('**لم يتم العثور على مهام لهذه الرتبة <a:pl0:1394782277938057464>**');
    const task = gangTasks.get(role.id);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`view_tasks_${role.id}`).setLabel('اضغط للمزيد').setStyle(ButtonStyle.Primary)
    );
    await message.channel.send({ content: `**مهام ${role.name} جاهزة للعرض:**`, components: [row] });
  }

  if (message.content === '-اجتماع' && isFullAccess) {
    const filter = m => m.author.id === message.author.id;
    await message.channel.send('**أرسل صورة الاجتماع:**');
    const img = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();
    if (!img?.attachments.first()) return message.channel.send('**لم يتم إرسال صورة.**');

    await message.channel.send('**أرسل موقع الاجتماع:**');
    const location = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();
    await message.channel.send('**أرسل الساعة:**');
    const time = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();

    const embed = new EmbedBuilder()
      .setTitle('**اجتماع عصابات <a:pl0:1394782292584435894>**')
      .setImage(img.attachments.first().url)
      .setDescription(`**📍 الموقع: ${location.content}\n⏰ الساعة: ${time.content}**`)
      .setColor('#8B0000');

    const channel = client.channels.cache.get(MEETING_CHANNEL_ID);
    if (channel?.isTextBased()) await channel.send({ content: '@everyone', embeds: [embed] });
    else message.channel.send('**لم يتم العثور على روم الاجتماعات**');
  }

  if (message.content.startsWith('-تعميم') && isFullAccess) {
    const text = message.content.split(' ').slice(1).join(' ');
    const embed = new EmbedBuilder()
      .setTitle('تعميم جديد')
      .setDescription(text || '🔴 تعميم هام لجميع العصابات')
      .setColor('#8B0000');
    const channel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
    if (channel?.isTextBased()) channel.send({ content: '@everyone', embeds: [embed] });
  }

  if (message.content.startsWith('-رسالة') && isFullAccess) {
    const msg = message.content.slice(7);
    if (!msg) return message.reply('**اكتب رسالة بعد الأمر.**');
    message.delete();
    message.channel.send(msg);
  }

  if (message.content === '-خط') {
    const embed = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1391556040901918720/1394789215224598658/PL_GANG.jpg')
      .setColor('#8B0000');
    message.channel.send({ embeds: [embed] });
  }

  if (message.content === '-ستارك') {
    const embed = new EmbedBuilder()
      .setTitle('**AL STARK FAMILY ALERTE <:PLGANG128x128:1394790202416828596>**')
      .setDescription('<:T5:1394782295474307102> **قسم خاص لعائلة ستارك**')
      .setImage('https://media.discordapp.net/attachments/1391556049273749625/1395398494570680484/PL_GANG_720_x_280_.jpg')
      .setColor('#8B0000');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('soon1').setLabel('مسؤولين العائلة').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('soon2').setLabel('شروط الانضمام للتحالف').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('family_sites').setLabel('مواقع العائلة').setStyle(ButtonStyle.Secondary)
    );

    const channel = client.channels.cache.get(STARK_MENU_CHANNEL_ID);
    if (channel?.isTextBased()) await channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('channelCreate', async (channel) => {
  if (!TICKET_CATEGORIES.includes(channel.parentId)) return;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام التكت').setStyle(ButtonStyle.Success)
  );
  if (channel.isTextBased()) {
    setTimeout(async () => {
      const embedBtn = new EmbedBuilder()
        .setTitle('استلام التكت')
        .setDescription('**اذا كنت مسؤول اضغط الزر لاستلام التكت**')
        .setColor('#8B0000');
      await channel.send({ embeds: [embedBtn], components: [row] });
    }, 3000);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'claim_ticket') {
    const embed = new EmbedBuilder()
      .setDescription(`**<:PLGANG128x128:1394790202416828596>  تم استلام التكت بنجاح من قبل ${interaction.user} نرجو عدم التدخل على بادن  <a:pl0:1394782277938057464> **`)
      .setColor('#8B0000');
    await interaction.message.edit({ embeds: [embed], components: [] });
    await interaction.reply({ content: '✅', ephemeral: true });
  }

  if (interaction.customId.startsWith('view_tasks_')) {
    const roleId = interaction.customId.split('view_tasks_')[1];
    const task = gangTasks.get(roleId);
    const embed = new EmbedBuilder()
      .setTitle('**مهام العصابة**')
      .setDescription(task)
      .setColor('#8B0000')
      .setFooter({ text: 'توقيع عائلة ستارك' });
    const footerRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dummy_footer').setLabel('توقيع عائلة ستارك').setStyle(ButtonStyle.Danger).setDisabled(true)
    );
    await interaction.reply({ embeds: [embed], components: [footerRow], ephemeral: true });
  }

  if (interaction.customId === 'family_sites') {
    const embed = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1391556040901918720/1395396463806120008/IMG_8322.webp')
      .setColor('#8B0000');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId.startsWith('soon')) {
    await interaction.reply({ content: '**قريباً <a:pl0:1394782281683697734>**', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
