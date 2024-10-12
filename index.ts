import { Events, type Interaction } from "discord.js"
import { createClient, getClient } from "./app/bot"
import { handleAutocomplete } from "./app/handlers/autocompleteHandler"
import { handleChatInputCommand } from "./app/handlers/chatInputCommandHandler"
import { handleButton } from "./app/handlers/buttonHandler"

createClient()

getClient().on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction)
  } else if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction)
  } else if (interaction.isButton()) {
    await handleButton(interaction)
  }
})
