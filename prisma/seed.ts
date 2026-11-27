/**
 * Seeds reference data only: the default role, theory subjects/topics that
 * match the existing /theory pages, and a starter quiz + flashcards for two
 * OS topics. Safe to run repeatedly (everything is upserted by a unique key).
 *
 *   pnpm db:seed
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const subjects = [
  {
    slug: "os",
    name: "Operating Systems",
    topics: [
      ["processes-and-threads", "Processes and Threads"],
      ["cpu-scheduling", "CPU Scheduling"],
      ["memory-management", "Memory Management"],
      ["deadlocks", "Deadlocks"],
    ],
  },
  {
    slug: "dbms",
    name: "DBMS",
    topics: [
      ["normalization", "Normalization"],
      ["transaction-management", "Transaction Management"],
      ["indexing", "Indexing"],
    ],
  },
  {
    slug: "cn",
    name: "Computer Networks",
    topics: [
      ["tcp-ip-stack", "TCP/IP Stack"],
      ["http-and-web", "HTTP and Web Fundamentals"],
      ["routing", "Routing and Switching"],
    ],
  },
  {
    slug: "oop",
    name: "Object-Oriented Programming",
    topics: [
      ["oop-basics", "OOP Basics"],
      ["inheritance", "Inheritance and Composition"],
      ["design-patterns", "Design Patterns"],
    ],
  },
] as const

const starterContent: Record<string, { quiz: object[]; flashcards: [string, string][] }> = {
  "processes-and-threads": {
    quiz: [
      {
        id: "q1",
        question: "Which of these do threads of the same process share?",
        options: ["Stack", "Program counter", "Heap memory", "CPU registers"],
        answerIndex: 2,
        explanation: "Threads share the process address space (code, data, heap) but each has its own stack, registers and program counter.",
      },
      {
        id: "q2",
        question: "What does a context switch save and restore?",
        options: ["Disk blocks", "CPU state of a process or thread", "Page tables on disk", "Network sockets"],
        answerIndex: 1,
      },
      {
        id: "q3",
        question: "Why is creating a thread usually cheaper than creating a process?",
        options: [
          "Threads skip the scheduler",
          "Threads reuse the parent's address space",
          "Threads never block",
          "Threads run in kernel mode",
        ],
        answerIndex: 1,
      },
    ],
    flashcards: [
      ["What is a process in an operating system?", "A process is an instance of a running program with its own lifecycle, memory, and execution context."],
      ["What is the difference between a thread and a process?", "A thread is a lightweight execution unit that shares process memory; a process owns its own memory space."],
      ["What is context switching?", "The OS stores and restores CPU state to move execution between processes or threads."],
    ],
  },
  "cpu-scheduling": {
    quiz: [
      {
        id: "q1",
        question: "Which OS concept is responsible for selecting the next process to execute?",
        options: ["Memory paging", "CPU scheduling", "Disk partitioning", "Socket multiplexing"],
        answerIndex: 1,
      },
      {
        id: "q2",
        question: "Which algorithm can cause starvation of long jobs?",
        options: ["Round Robin", "First Come First Served", "Shortest Job First", "FIFO"],
        answerIndex: 2,
      },
      {
        id: "q3",
        question: "In Round Robin, what happens when the time quantum is very large?",
        options: ["It behaves like FCFS", "It behaves like SJF", "Throughput drops to zero", "It becomes non-preemptive priority"],
        answerIndex: 0,
      },
    ],
    flashcards: [
      ["What is turnaround time?", "Completion time minus arrival time for a process."],
      ["What is the convoy effect?", "Short processes wait behind one long process under FCFS, lowering utilisation."],
    ],
  },
}

async function main() {
  for (const name of ["STUDENT", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as const) {
    await db.roleCatalog.upsert({ where: { name }, update: {}, create: { name } })
  }

  for (const subject of subjects) {
    const { id: subjectId } = await db.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name },
      create: { slug: subject.slug, name: subject.name },
    })

    for (const [slug, name] of subject.topics) {
      const topic = await db.theoryTopic.upsert({
        where: { slug },
        update: { name, subjectId },
        create: { slug, name, subjectId, contentMarkdown: `# ${name}\n\nNotes coming soon.` },
      })

      const starter = starterContent[slug]
      if (!starter) continue

      const existingQuiz = await db.quiz.findFirst({ where: { theoryTopicId: topic.id } })
      if (!existingQuiz) {
        await db.quiz.create({ data: { theoryTopicId: topic.id, title: `${name} quiz`, questionsJson: starter.quiz } })
      }
      if ((await db.flashcard.count({ where: { theoryTopicId: topic.id } })) === 0) {
        await db.flashcard.createMany({
          data: starter.flashcards.map(([question, answer]) => ({ theoryTopicId: topic.id, question, answer })),
        })
      }
    }
  }
}

main()
  .then(() => console.log("Seed complete"))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
