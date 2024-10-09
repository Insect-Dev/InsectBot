import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalActionRowComponentBuilder,
} from "discord.js"
import { endTest, getActiveTests, prisma } from "../db"

export const getData = async () => {
  return new SlashCommandBuilder()
    .setName("tests")
    .setDescription("Manage game tests")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all active tests"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Create a new test"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End an active test")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the test to end")
            .setAutocomplete(true)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("announce")
        .setDescription("Send an announcement for a test")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the test to announce")
            .setAutocomplete(true)
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to send the announcement to")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Message to send to the participants"),
        ),
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator | PermissionFlagsBits.ModerateMembers,
    )
}

export const autocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused()
  const choices = (await getActiveTests()).map((test) => test.name)
  const filtered = choices.filter((choice) =>
    choice.toLowerCase().startsWith(focusedValue.toLowerCase()),
  )

  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice })),
  )
}

async function list(interaction: ChatInputCommandInteraction) {
  const tests = await prisma.test.findMany()

  if (tests.length === 0) {
    await interaction.reply("No tests found.")
    return
  }

  await interaction.reply(
    `Here are the tests:\n- ${tests.map((test) => test.name).join("\n")}`,
  )
}

async function create(interaction: ChatInputCommandInteraction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId("itemCreate")
      .setTitle(`Create a Test`)

    const nameInput = new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Test name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRows: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        nameInput,
      ),
    ]

    modal.addComponents(...actionRows)

    await interaction.showModal(modal)
  } catch (error: any) {
    await interaction.reply({
      content: `Failed to create the test: \n\`\`\`\n${error.message}\n\`\`\``,
      ephemeral: true,
    })
  }
}

async function end(interaction: ChatInputCommandInteraction) {
  const testName = interaction.options.getString("name", true)

  try {
    const test = await prisma.test.findFirst({
      where: { name: testName, status: "running" },
    })

    if (!test) {
      await interaction.reply(
        `Test "${testName}" not found or is not currently running.`,
      )
      return
    }

    await endTest(test.id)
    await interaction.reply(`Test "${testName}" has been ended.`)
  } catch (error: any) {
    await interaction.reply({
      content: `Failed to end the test "${testName}": \n\`\`\`\n${error.message}\n\`\`\``,
      ephemeral: true,
    })
  }
}

async function announce(interaction: ChatInputCommandInteraction) {}

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand()

  switch (subcommand) {
    case "list":
      await list(interaction)
      break
    case "create":
      await create(interaction)
      break
    case "end":
      await end(interaction)
      break
    case "announce":
      await announce(interaction)
      break
    default:
      await interaction.reply({
        content: "Invalid subcommand. Use `/tests help` for more information.",
        ephemeral: true,
      })
      break
  }
}
