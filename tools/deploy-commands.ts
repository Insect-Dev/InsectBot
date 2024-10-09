import { REST, Routes } from "discord.js"
import { commands } from "../app/commands"
import { env } from "bun"

if (!env.TOKEN) throw new Error("No env.TOKEN!")

const rest = new REST().setToken(env.TOKEN)

;(async () => {
  if (!env.CLIENT_ID) throw new Error("No env.CLIENT_ID!")
  if (!env.GUILD_ID) throw new Error("No env.GUILD_ID!")

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
      { body: commands.map((command) => command.data.toJSON()) },
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    )
  } catch (error) {
    console.error(error)
  }
})()
