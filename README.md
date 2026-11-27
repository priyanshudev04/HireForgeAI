This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Database and login setup

Student data (mentor chats, quiz attempts, flashcard reviews) is stored in
Supabase Postgres through Prisma, and sign-in is handled by Clerk.

1. Copy `.env.example` to both `.env.local` and `.env`, then fill in:
   - `DATABASE_URL` and `DIRECT_URL` from Supabase → Connect → ORMs → Prisma.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the Clerk dashboard.
2. `pnpm install` (also generates the Prisma client).
3. `pnpm db:migrate` creates the tables (the first migration adds the
   `uuid_generate_v7()` function every table's id depends on).
4. `pnpm db:seed` adds the default roles and the starter theory subjects,
   quizzes and flashcards.

The schema lives in `prisma/schema.prisma`. A student's `User` row is created
the first time they make a signed-in request (`src/server/auth.ts`).

### Development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
