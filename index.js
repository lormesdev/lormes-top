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

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'PLRP', type: ActivityType.Playing }],
    status: PresenceUpdateStatus.DoNotDisturb
  });

  sendPromotionMessage();
  setInterval(sendPromotionMessage, 5 * 60 * 1000);
});

let lastPromotionSent = '';
function sendPromotionMessage() {
  const channel = client.channels.cache.get(PROMOTION_CHANNEL_ID);
  if (!channel?.isTextBased()) return;
  const msg = '⦿ الزعامة موقف ، وليست منصباً . <a:pl0:1387387534732034080>';
  if (lastPromotionSent === msg) return;
  lastPromotionSent = msg;
  channel.send(msg);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const isFullAccess = message.member.roles.cache.has(FULL_ACCESS_ROLE);

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
    if (channel?.isTextBased()) await channel.send({ embeds: [embed] });
    else message.channel.send('**لم يتم العثور على روم الاجتماعات**');
  }

  if (message.content === '-ستارك') {
    const embed = new EmbedBuilder()
      .setTitle('**AL STARK FAMILY ALERTE <:PLGANG128x128:1394790202416828596>**')
      .setDescription('**قسم خاص لعائلة ستارك 💀**')
      .setImage('https://media.discordapp.net/attachments/1391556049273749625/1395398494570680484/PL_GANG_720_x_280_.jpg')
      .setColor('#8B0000');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('leaders').setLabel('مسؤولين العائلة').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rules').setLabel('شروط الانضمام للتحالف').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('locations').setLabel('مواقع العائلة').setStyle(ButtonStyle.Secondary)
    );

    const channel = client.channels.cache.get(STARK_MENU_CHANNEL_ID);
    if (channel?.isTextBased()) await channel.send({ embeds: [embed], components: [row] });
  }

  if (message.content === 'خط') {
    const embed = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1391556040901918720/1394789215224598658/PL_GANG.jpg?ex=687a106e&is=6878beee&hm=095a048b3870c92c90ebc84d80f6bf64885bdda9ef0725d858738fcfea52f2fd&=&format=webp')
      .setColor('#8B0000');
    await message.channel.send({ embeds: [embed] });
  }

  if (message.content.startsWith('-تعميم') && isFullAccess) {
    const text = message.content.slice(7).trim() || 'يرجى الانتباه إلى التعليمات التالية ...';
    const embed = new EmbedBuilder()
      .setTitle('**تعميم من العصابات**')
      .setDescription(`**${text}**`)
      .setColor('#8B0000');
    const channel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
    if (channel?.isTextBased()) {
      await channel.send({ content: '@everyone', embeds: [embed] });
    }
  }

  if (message.content.startsWith('-رسالة') && isFullAccess) {
    const msg = message.content.slice(7).trim();
    if (!msg) return message.reply('**يرجى كتابة الرسالة بعد الأمر.**');
    await message.delete();
    await message.channel.send(msg);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'locations') {
    const embed = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1391556040901918720/1395396463806120008/IMG_8322.webp')
      .setColor('#8B0000');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === 'rules') {
    const embed = new EmbedBuilder()
      .setTitle('**🤝﹣شـروط الـتـحـالـف مـع عـائـلـة سـتـارك <:PLGANG128x128:1394790202416828596>**')
      .setDescription(`━━━━━━━━━━━━━━━

1. دفع مبلغ 4000 $ أسبوعيًا من دخل العصابة كضريبة تحالف.
2. احترام التسلسل القيادي داخل عائلة ستارك وعدم التدخل في قراراتها.
3. المشاركة في الحروب والنزاعات عندما يتم طلب الدعم من قبل ستارك.
4. عدم التحالف أو التنسيق مع عصابات أخرى دون إذن مباشر من قيادة ستارك.
5. أي خيانة أو تخاذل في الدعم يتم إنهاء التحالف بشكل فوري.
6. يُشترط تحديث موقف التحالف كل أسبوع داخل اجتماعات رسمية.
7. التحالف لا يعني المساواة – القرار النهائي دومًا للقيادة العليا في ستارك.
8. مشاركة نسبة من الموارد والأسلحة إذا تم طلبها من قبل القيادة.
9. عدم التدخل في أمور تخص ستارك أو محاولة التأثير على قراراتها.

━━━━━━━━━━━━━━━

<a:pl0:1394784517109186781> هذه الشروط ملزمة، وأي إخلال بها يؤدي إلى إلغاء التحالف واعتبار العصابة خصمًا مباشرًا.`)
      .setColor('#8B0000');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === 'leaders') {
    const embed = new EmbedBuilder()
      .setTitle('**مسؤولين العائلة القيادات <:PLGANG128x128:1394790202416828596>**')
      .setDescription(`مسؤول العائلة <a:pl0:1394782277938057464>  <@1343673536186945557>

نائب مسؤول العائلة   <a:pl0:1394782277938057464>  <@1276957785174835222>

هاؤلاء هم المسؤولون الاساسييون للعائلة يعني اي مخالفة لامر منهم وانت داخل التحالف = اعلان الحرب على عصابتك`)
      .setColor('#8B0000');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(process.env.TOKEN);
