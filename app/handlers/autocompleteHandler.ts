import { AutocompleteInteraction } from "discord.js"
import { commands } from "../commands"

export const handleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
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
