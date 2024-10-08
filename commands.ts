import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "./types/Command"

// { [key: string]: Command }

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
              .setName("test_name")
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
              .setName("test_name")
              .setDescription("The name of the test to end")
              .setRequired(true),
          ),
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator | PermissionFlagsBits.ModerateMembers,
      ),
    execute: async (interaction) => {
      const subcommand = interaction.options.getSubcommand()

      if (subcommand === "list") {
        await interaction.reply("Here are the active tests: ...")
      } else if (subcommand === "start") {
        const testName = interaction.options.getString("test_name")
        await interaction.reply(`Test "${testName}" has been started!`)
      } else if (subcommand === "end") {
        const testName = interaction.options.getString("test_name")
        await interaction.reply(`Test "${testName}" has been ended.`)
      }
    },
  },
]
