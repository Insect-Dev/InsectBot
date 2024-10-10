import { Events } from "discord.js"
import { createClient, getClient } from "./app/bot"
import { commands } from "./app/commands"
import { addTest } from "./app/db"

createClient()

getClient().on(Events.InteractionCreate, async (interaction) => {
  // TODO: Split for each type
  if (interaction.isChatInputCommand()) {
    const command = commands.find(
      (command) => command.data.name === interaction.commandName,
    )

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        })
      }
    }
  }

  if (interaction.isAutocomplete()) {
    const command = commands.find(
      (command) => command.data.name === interaction.commandName,
    )

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    if (!command.autocomplete) {
      console.error(
        `Autocomplete function for command "${interaction.commandName}" is not defined.`,
      )
      return
    }

    try {
      await command.autocomplete(interaction)
    } catch (error) {
      console.error(error)
    }
  }
})
