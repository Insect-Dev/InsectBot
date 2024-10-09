import { prisma } from "../app/db"

console.log("Choose a db to clear:")
console.log("1. test")
console.log("2. testParticipant")
console.log("3. participant")
const db = prompt("> ")

if (prompt("Write 'Yes, clear.' to confirm:") !== "Yes, clear.") {
  console.log("Exiting...")
  process.exit(1)
}

switch (db) {
  case "1":
    console.log("Clearing tests...")
    await prisma.test.deleteMany()
    console.log('Cleared all rows in the "test" database')
    break
  case "2":
    console.log("Clearing testParticipants...")
    await prisma.testParticipant.deleteMany()
    console.log('Cleared all rows in the "testParticipant" database')
    break
  case "3":
    console.log("Clearing participants...")
    await prisma.participant.deleteMany()
    console.log('Cleared all rows in the "participant" database')
    break
  default:
    console.log("Invalid db. Exiting...")
    process.exit(1)
}

process.exit(0)
