import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { addTest, endTest, getActiveTests, prisma } from "../db"

export const getData = async () => {
  return new SlashCommandBuilder()
    .setName("tests")
    .setDescription("Manage game tests")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all active tests"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new test")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the test to create")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("start")
            .setDescription(
              "The start date of the test to create (in any format acceptable by the JS Date object)",
            )
            .setAutocomplete(true),
        ),
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
          option.setName("message").setDescription("Message to be attached"),
        ),
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator | PermissionFlagsBits.ModerateMembers,
    )
}

export const autocomplete = async (interaction: AutocompleteInteraction) => {
  const { value: focusedValue, name } = interaction.options.getFocused(true)

  if (name === "name") {
    const choices = (await getActiveTests()).map((test) => test.name)
    const filtered = choices.filter((choice) =>
      choice.toLowerCase().startsWith(focusedValue.toLowerCase()),
    )

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice })),
    )
  } else if (name === "start") {
    const locale = (date: number) => new Date(date).toLocaleString()

    const currentDate = Date.now()

    const futureDates = Array.from(
      { length: 7 },
      (_, index) => currentDate + (index + 1) * 24 * 60 * 60 * 1000,
    ).map((date, index) => ({
      name: `+${index + 1} days (${locale(date)})`,
      value: locale(date),
    }))

    await interaction.respond([
      {
        name: `Now (${locale(currentDate)})`,
        value: "now",
      },
      ...futureDates,
    ])
  }
}

async function list(interaction: ChatInputCommandInteraction) {
  const tests = await prisma.test.findMany({
    take: 25,
  })

  const embed = new EmbedBuilder()
    .setColor("#88d4dd")
    .setTitle("List of Tests")
    .addFields(
      tests.map((test) => ({ name: test.id, value: test.name, inline: true })),
    )
    .setTimestamp()
    .setFooter({
      text: `Page 1/${Math.ceil(tests.length / 25)}`,
    })

  interaction.reply({ embeds: [embed] })
}

async function create(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("name", true)
  const startDate = interaction.options.getString("start")

  try {
    if (!startDate || startDate === "now") {
      await addTest(name)

      await interaction.reply(`Test "${name}" has been created and activated.`)
    } else {
      const startDateValue = new Date(startDate)

      if (isNaN(startDateValue.getTime())) {
        await interaction.reply({
          content: "Invalid start date format.",
          ephemeral: true,
        })
        return
      }
      await addTest(name, new Date(startDate))

      await interaction.reply(
        `Test "${name}" has been created and scheduled for ${new Date(startDate).toLocaleString()}.`,
      )
    }
  } catch (error: any) {
    await interaction.reply({
      content: `Failed to create the test: \n${"```"}\n${error.message}\n${"```"}`,
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
      content: `Failed to end the test "${testName}": \n${"```"}\n${error.message}\n${"```"}`,
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
