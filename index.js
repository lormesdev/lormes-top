require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

const allowedRoleID = "1387128004337209399"; // الرتبة اللي تقدر تستخدم الأمر

client.on("messageCreate", async message => {
  if (!message.content.startsWith("-برودكاست") || message.author.bot) return;
  if (!message.member.roles.cache.has(allowedRoleID)) return message.reply("❌ ماعندك صلاحية استخدام هذا الأمر");

  const content = message.content.slice("-برودكاست".length).trim();
  if (!content) return message.reply("❌ اكتب رسالة البرودكاست بعد الأمر");

  const embed = new EmbedBuilder()
    .setTitle("📢 تأكيد البرودكاست")
    .setDescription(`**الرسالة:**\n${content}\n\nاضغط الزر لتحديد الرتبة اللي تبي ترسل لها.`)
    .setColor("Orange");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("choose_role")
      .setLabel("اختر الرتبة")
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await message.reply({ embeds: [embed], components: [row] });

  const filter = i => i.user.id === message.author.id;
  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

  collector.on("collect", async interaction => {
    if (interaction.customId === "choose_role") {
      const modal = new ModalBuilder()
        .setCustomId("broadcast_role_modal")
        .setTitle("📢 إدخال ID الرتبة")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("role_id")
              .setLabel("أدخل ID الرتبة")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "broadcast_role_modal") return;

    const roleId = interaction.fields.getTextInputValue("role_id");
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) return interaction.reply({ content: "❌ الرتبة غير موجودة", ephemeral: true });

    const members = role.members.filter(member => !member.user.bot);

    const confirmEmbed = new EmbedBuilder()
      .setTitle("✅ تأكيد الإرسال")
      .setDescription(`📤 سيتم إرسال البرودكاست إلى:\n**الرتبة:** ${role.name}\n👥 عدد الأعضاء: ${members.size}`)
      .setColor("Green");

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_broadcast_${roleId}`)
        .setLabel("تأكيد الإرسال")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], ephemeral: true });
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("confirm_broadcast_")) return;
    if (interaction.user.id !== message.author.id) return interaction.reply({ content: "❌ هذا الزر ليس لك.", ephemeral: true });

    const roleId = interaction.customId.split("confirm_broadcast_")[1];
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) return interaction.reply({ content: "❌ الرتبة غير موجودة.", ephemeral: true });

    const members = role.members.filter(member => !member.user.bot);
    const msgToSend = message.content.slice("-برودكاست".length).trim();

    for (const member of members.values()) {
      try {
        await member.send(`📢 **برودكاست جديد:**\n${msgToSend}`);
      } catch (e) {
        console.log(`❌ فشل إرسال الرسالة إلى ${member.user.tag}`);
      }
    }

    await interaction.reply({ content: `✅ تم إرسال البرودكاست إلى ${members.size} عضو.`, ephemeral: true });
  });
});

client.login(process.env.TOKEN);
