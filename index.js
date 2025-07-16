require('dotenv').config();
const express = require('express');
const {
  Client, GatewayIntentBits,
  Partials, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder,
  ButtonStyle, TextInputBuilder, TextInputStyle
} = require('discord.js');

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
    type: 1,
    url: 'https://twitch.tv/discord'
  });
});

const FULL_ACCESS_ROLE = '1391555836878393425';
const ANNOUNCEMENT_CHANNEL_ID = '1391556047990292621';
const MEETING_CHANNEL_ID = '1391556054327890071';
const STARK_MENU_CHANNEL_ID = '1391556049273749625';
const TICKET_CATEGORIES = [
  '1391556033704362064',
  '1391556034698547200'
];

const gangTasks = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isFullAccess = message.member.roles.cache.has(FULL_ACCESS_ROLE);

  if (message.content === '-تقديم') {
    await message.channel.send(`**تقديم عصابة:**\nاسمك: ..........\nعمرك: ..........\nهل عندك هوية: ..........\nخبراتك: ..........\nالعصابة المختارة: ..........\nهل انت داخل السيرفر الأساسي؟ ..........`);
  }

  if (message.content === '-فتح-عصابة') {
    await message.channel.send(`**فتح عصابة:**\nاسمك: ..........\nاسم العصابة: ..........\nاللون: ..........\nالشروط: ..........\nعدد الأعضاء: ..........\nالالتزام: ..........\nهل تابع لعائلة ستارك؟ ..........\nملاحظات: ..........`);
  }

  if (message.content === '-رسالة') {
    const filter = m => m.author.id === message.author.id;
    await message.channel.send('**اكتب الرسالة التي تريد إرسالها:**');
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
    if (!collected.first()) return message.channel.send('**لم يتم كتابة أي رسالة.**');
    await message.channel.send(collected.first().content);
  }

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
      new ButtonBuilder()
        .setCustomId(`view_tasks_${role.id}`)
        .setLabel('اضغط للمزيد')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ content: `**مهام ${role.name} جاهزة للعرض:**`, components: [row] });
  }

  if (message.content === '-تعميم' && isFullAccess) {
    const filter = m => m.author.id === message.author.id;
    await message.channel.send('**اكتب التعميم:**');
    const msg = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first()?.content;
    if (!msg) return message.channel.send('**لم يتم إرسال تعميم. <a:pl0:1394782277938057464>**');

    const embed = new EmbedBuilder().setDescription(`**${msg}**`).setColor('#8B0000');
    const channel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
    if (channel?.isTextBased()) {
      await channel.send({ content: '@everyone', embeds: [embed] });
      await message.channel.send('**تم ارسال التعميم بنجاح <a:pl0:1394782288981528717>**');
    } else {
      await message.channel.send('**فشل إرسال التعميم <a:pl0:1394782277938057464>**');
    }
  }

  if (message.content === '-اجتماع' && isFullAccess) {
    const filter = m => m.author.id === message.author.id;
    await message.channel.send('**أرسل صورة الاجتماع:**');
    const img = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();
    if (!img?.attachments.first()) return message.channel.send('**لم يتم إرسال صورة. <a:pl0:1394782277938057464>**');

    await message.channel.send('**أرسل موقع الاجتماع:**');
    const location = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();

    await message.channel.send('**أرسل الساعة:**');
    const time = (await message.channel.awaitMessages({ filter, max: 1, time: 60000 })).first();

    const meetingEmbed = new EmbedBuilder()
      .setTitle('**اجتماع عصابات <a:pl0:1394782292584435894>**')
      .setImage(img.attachments.first().url)
      .setDescription(`**📍 الموقع: ${location.content}\n⏰ الساعة: ${time.content}**`)
      .setColor('#8B0000');

    const targetChannel = client.channels.cache.get(MEETING_CHANNEL_ID);
    if (targetChannel?.isTextBased()) {
      await targetChannel.send({ embeds: [meetingEmbed] });
    } else {
      message.channel.send('**لم يتم العثور على روم الاجتماعات <a:pl0:1394782277938057464>**');
    }
  }

  if (message.content === '-ستارك') {
    const embed = new EmbedBuilder()
      .setTitle('**AL STARK FAMILY ALERTE <:PLGANG128x128:1394790202416828596>**')
      .setDescription('<:T5:1394782295474307102> **قسم خاص لعائلة ستارك**')
      .setColor('#8B0000');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('soon1').setLabel('مسؤولين العائلة').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('soon2').setLabel('شروط الانضمام للتحالف').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('soon3').setLabel('مواقع العائلة').setStyle(ButtonStyle.Secondary)
    );

    const targetChannel = client.channels.cache.get(STARK_MENU_CHANNEL_ID);
    if (targetChannel?.isTextBased()) {
      await targetChannel.send({ embeds: [embed], components: [row] });
    }
  }

  if (message.content.includes('خط')) {
    await message.delete();
    const embed = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1391556040901918720/1394789215224598658/PL_GANG.jpg')
      .setColor('#8B0000');
    await message.channel.send({ embeds: [embed] });
  }
});

client.on('channelCreate', async (channel) => {
  if (!TICKET_CATEGORIES.includes(channel.parentId)) return;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('استلام التكت')
      .setStyle(ButtonStyle.Success)
  );

  if (channel.isTextBased()) {
    setTimeout(async () => {
      await channel.send({ content: '**اذا كنت مسؤول اضغط الزر لاستلام التكت**', components: [row] });
      const embed = new EmbedBuilder()
        .setDescription('**تم الاستلام، الرجاء عدم التدخل إلا بإذن.**')
        .setColor('#8B0000');
      await channel.send({ embeds: [embed] });
    }, 3000);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'claim_ticket') {
      await interaction.reply({ content: '**تم استلام التكت بنجاح <a:pl0:1394782288981528717>**', ephemeral: false });
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
        new ButtonBuilder()
          .setCustomId('dummy_footer')
          .setLabel('توقيع عائلة ستارك')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );

      await interaction.reply({ embeds: [embed], components: [footerRow], ephemeral: true });
    }

    if (interaction.customId.startsWith('soon')) {
      await interaction.reply({ content: '**قريباً <a:pl0:1394782281683697734>**', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
