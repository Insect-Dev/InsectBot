import {
  PrismaClient,
  type Participant,
  type TestParticipant,
} from "@prisma/client"
import { TestStatus } from "../types/TestStatus"

export const prisma = new PrismaClient()

export const addParticipant = async (participant: Participant) => {
  await prisma.participant.create({
    data: {
      id: participant.id,
      totalScore: participant.totalScore,
    },
  })
}

// Link participant to test and set initial score
export const addTestParticipant = async (testParticipant: TestParticipant) => {
  await prisma.testParticipant.create({
    data: {
      testId: testParticipant.testId,
      participantId: testParticipant.participantId,
      score: testParticipant.score,
    },
  })
}

export const addTest = async (name: string, startDate?: Date) => {
  await prisma.test.create({
    data: {
      name,
      startDate: startDate ?? new Date(),
      status: startDate ? TestStatus.SCHEDULED : TestStatus.RUNNING,
    },
  })
}

export const startTest = async (testId: string) => {
  await prisma.test.update({
    where: { id: testId },
    data: { status: TestStatus.RUNNING },
  })
}

export const endTest = async (testId: string) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
  })

  if (!test) {
    throw new Error(`Test with ID ${testId} not found.`)
  }

  if (test.status !== "running") {
    throw new Error(`Test with ID ${testId} is not currently running.`)
  }

  const testParticipants = await prisma.testParticipant.findMany({
    where: { testId },
  })

  for (const tp of testParticipants) {
    await prisma.participant.update({
      where: { id: tp.participantId },
      data: {
        totalScore: {
          increment: tp.score,
        },
      },
    })
  }

  await prisma.test.update({
    where: { id: testId },
    data: {
      status: "finished",
    },
  })
}

export const getActiveTests = async () => {
  return prisma.test.findMany({
    where: {
      status: {
        in: [TestStatus.SCHEDULED, TestStatus.RUNNING],
      },
    },
  })
}

export const getTestsByParticipant = async (participantId: string) => {
  return await prisma.testParticipant.findMany({
    where: { participantId },
    include: {
      test: true,
    },
  })
}
