export interface TheoryTopicContent {
  title: string
  subject: string
  estimate: string
  summary: string
  sections: Array<{ heading: string; body: string }>
}

/**
 * Static theory topic content. This is the source material the AI quiz and
 * flashcard generators are grounded in, until topics move to the database
 * (TheoryTopic.contentMarkdown in docs/schema.prisma).
 */
export const theoryTopics: Record<string, TheoryTopicContent> = {
  "processes-and-threads": {
    title: "Processes and Threads",
    subject: "Operating Systems",
    estimate: "8 min read",
    summary: "A process is an execution unit, while threads are lightweight execution paths within that process.",
    sections: [
      { heading: "Process model", body: "A process contains its own memory space, execution context, and lifecycle. This makes it a stronger isolation boundary than a thread." },
      { heading: "Thread model", body: "Threads share memory with the parent process, making them faster to create and easier to coordinate for parallel work inside a program." },
      { heading: "Context switching", body: "The operating system switches CPU execution between processes and threads through a context switch that preserves CPU state." },
    ],
  },
  "cpu-scheduling": {
    title: "CPU Scheduling",
    subject: "Operating Systems",
    estimate: "11 min read",
    summary: "Scheduling policies decide which ready process or thread gets CPU time next.",
    sections: [
      { heading: "Scheduling criteria", body: "Schedulers try to balance CPU utilization, throughput, turnaround time, waiting time, and response time." },
      { heading: "Algorithms", body: "FCFS, Round Robin, SJF, Priority Scheduling, and Multilevel Queues are standard interview-aligned patterns." },
    ],
  },
  "memory-management": {
    title: "Memory Management",
    subject: "Operating Systems",
    estimate: "14 min read",
    summary: "Memory management keeps a program's address space valid and efficiently mapped to physical storage.",
    sections: [
      { heading: "Virtual memory", body: "Virtual memory gives each process the illusion of a larger address space than physical RAM." },
      { heading: "Paging", body: "Paging divides memory into fixed-size pages and stores pages in RAM or swap space." },
    ],
  },
  "normalization": {
    title: "Normalization",
    subject: "DBMS",
    estimate: "12 min read",
    summary: "Normalization removes redundant data and organizes domains into stable relational structures.",
    sections: [
      { heading: "1NF", body: "A table is in 1NF when each column holds atomic values and no repeating groups exist." },
      { heading: "2NF", body: "2NF removes partial dependency — every non-key attribute should depend on the whole key." },
      { heading: "3NF", body: "3NF removes transitive dependencies and keeps the schema closer to a stable, reusable model." },
    ],
  },
  "transaction-management": {
    title: "Transaction Management",
    subject: "DBMS",
    estimate: "10 min read",
    summary: "Transactions ensure a set of database operations is atomic, isolated, consistent, and durable.",
    sections: [
      { heading: "ACID", body: "ACID guarantees preserve correctness across failures and concurrent access." },
      { heading: "Isolation levels", body: "Read Uncommitted, Read Committed, Repeatable Read, and Serializable trade off performance and consistency." },
    ],
  },
  "indexing": {
    title: "Indexing",
    subject: "DBMS",
    estimate: "7 min read",
    summary: "Indexes speed up lookups, but can increase write cost and storage overhead.",
    sections: [
      { heading: "B-tree", body: "B-tree indexes support range, equality, and ordered lookup patterns." },
      { heading: "Hash index", body: "Hash indexes are fast for equality checks but not for ordered scans." },
    ],
  },
  "tcp-ip-stack": {
    title: "TCP/IP Stack",
    subject: "Computer Networks",
    estimate: "15 min read",
    summary: "The TCP/IP stack organizes network communication across application, transport, internet, and link layers.",
    sections: [
      { heading: "Application layer", body: "Protocols such as HTTP, DNS, and SMTP sit closest to the user-facing application." },
      { heading: "Transport layer", body: "TCP gives reliable ordered delivery; UDP prioritizes low-latency delivery." },
    ],
  },
  "http-and-web": {
    title: "HTTP and Web Fundamentals",
    subject: "Computer Networks",
    estimate: "11 min read",
    summary: "HTTP defines request and response semantics that sit at the heart of the modern web.",
    sections: [
      { heading: "Requests", body: "GET, POST, PUT, DELETE, and PATCH drive REST-style API interaction." },
      { heading: "Status codes", body: "2xx, 4xx, and 5xx communicate whether a resource was understood, processed, or failed." },
    ],
  },
  "routing": {
    title: "Routing and Switching",
    subject: "Computer Networks",
    estimate: "13 min read",
    summary: "Routing determines paths for packets, while switching forwards traffic within a subnet.",
    sections: [
      { heading: "Routing", body: "Routers make forwarding decisions using destination and routing table information." },
      { heading: "Switching", body: "Switches learn MAC addresses and forward frames locally within a LAN." },
    ],
  },
  "oop-basics": {
    title: "OOP Basics",
    subject: "Object-Oriented Programming",
    estimate: "9 min read",
    summary: "Object-Oriented Programming models the real world through entities with state and behavior.",
    sections: [
      { heading: "Encapsulation", body: "Encapsulation hides internal details and exposes a stable interface." },
      { heading: "Abstraction", body: "Abstraction reduces complexity by focusing on the essential properties of a concept." },
    ],
  },
  inheritance: {
    title: "Inheritance and Composition",
    subject: "Object-Oriented Programming",
    estimate: "13 min read",
    summary: "Inheritance models shared behavior, while composition builds capabilities by combining objects.",
    sections: [
      { heading: "Inheritance", body: "A subclass inherits or overrides the properties of a parent class." },
      { heading: "Composition", body: "Composition aggregates collaborators to express flexible relationships." },
    ],
  },
  "design-patterns": {
    title: "Design Patterns",
    subject: "Object-Oriented Programming",
    estimate: "14 min read",
    summary: "Design patterns capture proven ways to solve recurring software design problems.",
    sections: [
      { heading: "Factory", body: "Construct objects through a common creation interface." },
      { heading: "Observer", body: "Notify dependent objects whenever a subject changes state." },
    ],
  },
}

export function getTheoryTopic(topicSlug: string): TheoryTopicContent | undefined {
  return Object.prototype.hasOwnProperty.call(theoryTopics, topicSlug) ? theoryTopics[topicSlug] : undefined
}

/** Plain-text rendering of a topic, used as grounding material for AI prompts. */
export function topicToPlainText(topic: TheoryTopicContent): string {
  return [
    `Subject: ${topic.subject}`,
    `Topic: ${topic.title}`,
    `Summary: ${topic.summary}`,
    ...topic.sections.map((section) => `## ${section.heading}\n${section.body}`),
  ].join("\n\n")
}
