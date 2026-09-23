const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`Bot online como ${client.user.tag}!`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: [
          {
            name: "ticket",
            description: "Envia o painel de atendimento da NEXERIUM"
          }
        ]
      }
    );

    console.log("Comando /ticket registrado!");
  } catch (error) {
    console.error("Erro ao registrar comando:", error);
  }
});

client.on("interactionCreate", async (interaction) => {

  // Comando /ticket
  if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {

    const botao = new ButtonBuilder()
      .setCustomId("abrir_ticket")
      .setLabel("Abrir Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary);

    const linha = new ActionRowBuilder()
      .addComponents(botao);

    await interaction.reply({
      content:
        "🎫 **NEXERIUM SYSTEM — ATENDIMENTO**\n\n" +
        "Precisa de ajuda? Clique no botão abaixo para abrir um ticket com nossa equipe.",
      components: [linha]
    });

    return;
  }

  // Botão Abrir Ticket
  if (interaction.isButton() && interaction.customId === "abrir_ticket") {

    const guild = interaction.guild;

    const canalExistente = guild.channels.cache.find(
      canal => canal.name === `ticket-${interaction.user.id}`
    );

    if (canalExistente) {
      await interaction.reply({
        content: `❌ Você já possui um ticket aberto: ${canalExistente}`,
        ephemeral: true
      });

      return;
    }

    const ticket = await guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ]
    });

    const fechar = new ButtonBuilder()
      .setCustomId("fechar_ticket")
      .setLabel("Fechar Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger);

    const linha = new ActionRowBuilder()
      .addComponents(fechar);

    await ticket.send({
      content:
        `🎫 **Ticket criado!**\n\n` +
        `Olá ${interaction.user}, nossa equipe irá atender você em breve.\n\n` +
        `Quando terminar o atendimento, clique em **🔒 Fechar Ticket**.`,
      components: [linha]
    });

    await interaction.reply({
      content: `✅ Seu ticket foi criado: ${ticket}`,
      ephemeral: true
    });

    return;
  }

  // Botão Fechar Ticket
  if (interaction.isButton() && interaction.customId === "fechar_ticket") {

    await interaction.reply("🔒 Este ticket será fechado em 5 segundos.");

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 5000);

    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
