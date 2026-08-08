import { BookMarked, Code, GraduationCap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const bookmarks = {
  problems: ["Two Sum", "Valid Parentheses", "Merge K Sorted Lists"],
  theory: ["Operating Systems", "DBMS", "Dynamic Programming"],
  projects: ["Job Tracker Intelligence", "Learning Companion"],
}

export default function BookmarksPage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Bookmarks" description="A unified view across problems, theory topics, and projects." />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="size-4 text-primary" />
              <CardTitle>Problems</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {bookmarks.problems.map((item) => (
              <p key={item} className="text-sm text-muted-foreground">• {item}</p>
            ))}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              <CardTitle>Theory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {bookmarks.theory.map((item) => (
              <p key={item} className="text-sm text-muted-foreground">• {item}</p>
            ))}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookMarked className="size-4 text-primary" />
              <CardTitle>Projects</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {bookmarks.projects.map((item) => (
              <p key={item} className="text-sm text-muted-foreground">• {item}</p>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

