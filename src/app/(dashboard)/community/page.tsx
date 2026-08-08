import { MessageSquare, Trophy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const discussions = [
  { title: "How are you approaching DP problems?", replies: 24, tag: "DSA" },
  { title: "Resume feedback swap", replies: 13, tag: "Resume" },
  { title: "Weekend study room is open", replies: 9, tag: "Study Room" },
]

export default function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Community" description="Learn together with peers and stay close to your preparation network." actions={<Button>Start discussion</Button>} />

      <section className="grid gap-6 md:grid-cols-3">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <CardTitle>Latest discussions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>{discussions.length} active threads</CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle>Study rooms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>2 rooms live</CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-primary" />
              <CardTitle>Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>Top rank: #12</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        {discussions.map((post) => (
          <Card key={post.title} glass hover>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">{post.title}</CardTitle>
                <CardDescription className="mt-2">{post.replies} replies</CardDescription>
              </div>
              <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{post.tag}</span>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}

