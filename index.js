// داخل ملف index.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');

client.on('messageCreate', async message => {
  if (!message.content.startsWith('-برودكاست')) return;

  // تحقق من الرتبة المسموح لها
  if (!message.member.roles.cache.has('1387128004337209399')) {
    return message.reply('❌ ليس لديك صلاحية استخدام هذا الأمر.');
  }

  // فتح المودال لكتابة الرسالة وآيدي الرتبة
  const modal = new ModalBuilder()
    .setCustomId('broadcast-modal')
    .setTitle('📢 برودكاست إلى رتبة');

  const msgInput = new TextInputBuilder()
    .setCustomId('broadcast-message')
    .setLabel('اكتب الرسالة التي تريد إرسالها')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const roleInput = new TextInputBuilder()
    .setCustomId('broadcast-role')
    .setLabel('آيدي الرتبة')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row1 = new ActionRowBuilder().addComponents(msgInput);
  const row2 = new ActionRowBuilder().addComponents(roleInput);

  modal.addComponents(row1, row2);
  await message.channel.send('📨 افتح المودال لإرسال البرودكاست:');
  await message.channel.send({ content: 'اضغط هنا لفتح المودال', components: [] });
  await message.channel.send({ content: '⇩', components: [] });
  await message.channel.send({ content: '↘️' });
  await message.channel.send({ content: '🧠 تلميح: تأكد من أن الرتبة تستقبل رسائل خاصة' });
  await message.author.send({ content: '📩 افتح المودال' }).catch(() => null);
  await message.channel.send({ content: '↘️↘️↘️↘️↘️' });
  await message.channel.send({ content: '❗ جارٍ تنفيذ الأمر...' });
  await message.channel.send({ content: '💡 سيتم فتح نافذة تلقائية...' });

  await message.channel.send({ content: 'يرجى تنفيذ الأمر من جديد لأن فتح المودال يتم عند استخدام الأمر من خلال التفاعل (button/command)' });
});

// استقبال البيانات من المودال
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'broadcast-modal') return;

  const messageContent = interaction.fields.getTextInputValue('broadcast-message');
  const roleId = interaction.fields.getTextInputValue('broadcast-role');
  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) return interaction.reply({ content: '❌ لم أجد هذه الرتبة.', ephemeral: true });

  const membersWithRole = role.members.filter(m => !m.user.bot);
  const count = membersWithRole.size;

  if (count === 0) return interaction.reply({ content: '⚠️ لا يوجد أعضاء في هذه الرتبة.', ephemeral: true });

  const preview = new EmbedBuilder()
    .setTitle('تأكيد إرسال البرودكاست')
    .setDescription(`**الرسالة:**\n${messageContent}`)
    .addFields(
      { name: 'الرتبة', value: `<@&${roleId}>`, inline: true },
      { name: 'عدد الأعضاء', value: `${count}`, inline: true }
    )
    .setColor(0xffa500);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`confirm-broadcast-${roleId}`)
      .setLabel('✅ تأكيد الإرسال')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [preview], components: [row], ephemeral: true });
});

// إرسال البرودكاست عند الضغط على زر التأكيد
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('confirm-broadcast-')) return;

  const roleId = interaction.customId.split('-')[2];
  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) return interaction.reply({ content: '❌ الرتبة لم تعد موجودة.', ephemeral: true });

  const members = role.members.filter(m => !m.user.bot);
  const messageContent = interaction.message.embeds[0]?.description?.replace('**الرسالة:**\n', '') || 'رسالة بدون محتوى';

  await interaction.update({ content: '📤 جاري إرسال البرودكاست...', embeds: [], components: [] });

  let sent = 0;
  for (const member of members.values()) {
    try {
      await member.send(`📢 رسالة من الإدارة:\n${messageContent}`);
      sent++;
    } catch (err) {
      console.log(`❌ فشل إرسال الرسالة لـ ${member.user.tag}`);
    }
  }

  await interaction.followUp({ content: `✅ تم إرسال البرودكاست إلى ${sent} عضو من أصل ${members.size}.`, ephemeral: true });
});
