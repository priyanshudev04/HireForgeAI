import Link from "next/link"
import { Bookmark, BookOpen, Brain, ClipboardCheck, FileText, GraduationCap, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { getTheoryTopic } from "@/lib/theory/catalog"

export default async function TheoryTopicPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params
  const topic = getTheoryTopic(topicSlug)

  return (
    <div className="mx-auto w-full max-w-300 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={topic?.title ?? "Theory Topic"}
        description={topic ? `${topic.subject} • ${topic.estimate}` : "Topic content is unavailable."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/theory/${subjectSlug}`} />}>Back to topics</Button>
            <Button render={<Link href={`/theory/${subjectSlug}/${topicSlug}/flashcards`} />}>Generate Flashcards</Button>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topics in this subject</p>
          </div>
          <nav className="space-y-2">
            <Link href={`/theory/${subjectSlug}/${topicSlug}`} className="block rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">{topic?.title}</Link>
            <Link href={`/theory/${subjectSlug}/${topicSlug}/flashcards`} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Flashcards</Link>
            <Link href={`/theory/${subjectSlug}/${topicSlug}/quiz`} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Quiz</Link>
          </nav>
        </aside>

        <article className="space-y-6">
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <CardTitle>{topic?.title ?? "Topic"}</CardTitle>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Bookmark topic">
                  <Bookmark className="size-4" />
                </Button>
              </div>
              <CardDescription>{topic?.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {topic?.sections.map((section) => (
                <section key={section.heading} className="space-y-2">
                  <h2 className="font-heading text-xl font-bold text-foreground">{section.heading}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
                </section>
              ))}

              <div className="flex flex-wrap gap-2 pt-4">
                <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}/flashcards`} />}>Generate Flashcards</Button>
                <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}/quiz`} />}>Take Quiz</Button>
                <Button variant="outline" render={<Link href="/mentor" />}>Ask AI to explain</Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </section>
    </div>
  )
}
