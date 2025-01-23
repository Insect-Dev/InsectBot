import { prisma } from "../app/db"

const massTests = Array.from({ length: 25 }).map((_, i) => ({
  name: `Mass Test ${i}`,
  status: "none",
}))

console.log(massTests)

console.log(
  await prisma.test.createMany({
    data: massTests,
  }),
)
