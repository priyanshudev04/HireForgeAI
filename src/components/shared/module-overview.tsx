import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export function ModuleOverview({ title, description, action, items }: { title: string; description: string; action: string; items: string[] }) {
  return <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8"><PageHeader title={title} description={description} actions={<Button render={<Link href="/coming-soon" />}>{action}<ArrowRight className="size-4" /></Button>} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <Card key={item} glass hover><CardHeader><div className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="size-4" /></div><CardTitle>{item}</CardTitle><CardDescription>Continue your preparation with focused guidance and progress tracking.</CardDescription></CardHeader><CardContent><div className="flex items-center gap-2 text-xs text-success"><CheckCircle2 className="size-4" />Ready for your next step</div></CardContent></Card>)}</section></div>
}
