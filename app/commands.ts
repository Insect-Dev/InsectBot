import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"
import { addTest, endTest, prisma } from "./db"

export const commands: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping pong!"),
    execute: async (interaction) => {
      await interaction.reply({ content: "Pong!", ephemeral: true })
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("hello")
      .setDescription("Say hello to the bot!"),
    execute: async (interaction) => {
      await interaction.reply(
        Math.random() > 0.5
          ? "Hello, World!"
          : `Hello, <@${interaction.user.id}>!`,
      )
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("tests")
      .setDescription("Manage game tests")
      .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List all active tests"),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("start")
          .setDescription("Start a new test")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name of the test to start")
              .setRequired(true),
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
              // .setAutocomplete(true)
              .setRequired(true),
          ),
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator | PermissionFlagsBits.ModerateMembers,
      ),
    execute: async (interaction) => {
      const subcommand = interaction.options.getSubcommand()

      if (subcommand === "list") {
        const tests = await prisma.test.findMany()

        if (tests.length === 0) {
          await interaction.reply("No tests found.")
          return
        }

        await interaction.reply(
          `Here are the tests:\n\n${tests.map((test) => test.name).join("\n")}`,
        )
      } else if (subcommand === "start") {
        const testName = interaction.options.getString("name")

        try {
          await addTest(testName!)
          await interaction.reply(`Test "${testName}" has been started!`)
        } catch (error: any) {
          await interaction.reply({
            content: `Failed to start the test "${testName}": \n\`\`\`\n${error.message}\n\`\`\``,
            ephemeral: true,
          })
        }
      } else if (subcommand === "end") {
        const testName = interaction.options.getString("name")

        try {
          const test = await prisma.test.findFirst({
            where: { name: testName!, status: "running" },
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
    },
  },
]
