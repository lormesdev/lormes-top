const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ComponentType,
  Events
} = require("discord.js");

client.on("messageCreate", async message => {
  if (message.content === "-برودكاست") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ لا تملك صلاحية استخدام هذا الأمر.");
    }

    const modal = new ModalBuilder()
      .setCustomId("broadcastModal")
      .setTitle("رسالة البرودكاست");

    const msgInput = new TextInputBuilder()
      .setCustomId("bcmsg")
      .setLabel("محتوى الرسالة التي تريد إرسالها")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const msgRow = new ActionRowBuilder().addComponents(msgInput);
    modal.addComponents(msgRow);

    await message.channel.send(`${message.author}, تحقق من الخاص لديك لإدخال الرسالة.`);
    await message.author.send({ content: "يرجى إدخال رسالة البرودكاست:", components: [], embeds: [], }).then(() => {
      message.author.showModal(modal);
    }).catch(() => {
      message.reply("❌ لا يمكنني إرسال رسالة خاصة لك. فعل الخاص لديك.");
    });
  }
});

// استلام رسالة المودال
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "broadcastModal") {
    const bcMessage = interaction.fields.getTextInputValue("bcmsg");

    const modal = new ModalBuilder()
      .setCustomId("roleModal")
      .setTitle("أدخل ID الرتبة");

    const roleInput = new TextInputBuilder()
      .setCustomId("roleid")
      .setLabel("أدخل ID الرتبة التي تريد إرسال البرودكاست لها")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const roleRow = new ActionRowBuilder().addComponents(roleInput);
    modal.addComponents(roleRow);

    await interaction.reply({ content: "الآن أدخل ID الرتبة", ephemeral: true });
    await interaction.user.send({ content: "أدخل ID الرتبة:", components: [], embeds: [], }).then(() => {
      interaction.user.showModal(modal);
      interaction.user.bcTempMsg = bcMessage;
    });
  }

  if (interaction.customId === "roleModal") {
    const roleId = interaction.fields.getTextInputValue("roleid");
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) return interaction.reply({ content: "❌ لم يتم العثور على الرتبة.", ephemeral: true });

    const members = role.members.map(m => m.user);
    const embed = new EmbedBuilder()
      .setTitle("📢 تأكيد إرسال البرودكاست")
      .setDescription(`سيتم إرسال الرسالة التالية إلى **${role.name}**.\n\n**عدد الأعضاء:** ${members.length}\n\n**الرسالة:**\n${interaction.user.bcTempMsg}`)
      .setColor("Gold");

    const confirmBtn = new ButtonBuilder()
      .setCustomId("confirmSend")
      .setLabel("تأكيد الإرسال")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirmBtn);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    // تخزين الرسالة والمستلمين مؤقتًا
    interaction.user._bcData = {
      message: interaction.user.bcTempMsg,
      members
    };
  }
});

// عند الضغط على زر تأكيد الإرسال
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "confirmSend") {
    const bcData = interaction.user._bcData;
    if (!bcData) return interaction.reply({ content: "❌ لا يوجد بيانات لإرسالها.", ephemeral: true });

    let success = 0;
    let failed = 0;

    for (const user of bcData.members) {
      try {
        await user.send(`📢 **برودكاست إداري:**\n${bcData.message}`);
        success++;
      } catch {
        failed++;
      }
    }

    await interaction.update({
      content: `✅ تم إرسال البرودكاست بنجاح!\n\n📤 تم الإرسال: **${success}**\n❌ فشل الإرسال: **${failed}**`,
      embeds: [],
      components: []
    });

    delete interaction.user._bcData;
    delete interaction.user.bcTempMsg;
  }
});
