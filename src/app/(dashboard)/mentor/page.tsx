import { PageHeader } from "@/components/shared/page-header"
import { MentorChat } from "@/components/mentor/mentor-chat"

export default function MentorPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Mentor"
        description="Ask questions, unblock your preparation, and plan your next step."
      />
      <MentorChat />
    </div>
  )
}
