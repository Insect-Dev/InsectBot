import type { ButtonInteraction } from "discord.js"
import { generateList } from "../commands/tests"

export const handleButton = async (interaction: ButtonInteraction) => {
  const [action, filterText, currentPageStr] = interaction.customId.split("_")

  let newPage = parseInt(currentPageStr)

  if (action === "previousPage") {
    newPage -= 1
  } else if (action === "nextPage") {
    newPage += 1
  } else if (action === "reload") {
    newPage = 1
  }

  const { embed: newEmbed, pageButtons: newPageButtons } =
    (await generateList(filterText, newPage)) ?? {}

  await interaction.update({
    embeds: [newEmbed!],
    components: [newPageButtons!],
  })
}
