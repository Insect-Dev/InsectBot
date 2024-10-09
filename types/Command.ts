import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SharedSlashCommand,
} from "discord.js"

export type Command = {
  data: SharedSlashCommand
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
