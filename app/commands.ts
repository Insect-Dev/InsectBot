import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/Command"
import * as tests from "./commands/tests"

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
    data: await tests.getData(),
    execute: tests.execute,
    autocomplete: tests.autocomplete,
  },
]
