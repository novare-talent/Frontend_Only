import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";

interface SubmissionCardProps {
  candidate: string
  repoUrl: string
  submittedAt: string
}

function SubmissionCard({candidate, submittedAt}: SubmissionCardProps) {

  return (
    <div>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-lg font-medium tabular-nums @[250px]/card:text-l text-black dark:text-white">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {candidate.charAt(0)}
              </div>
              {candidate}
            </div>
          </CardTitle>
          <CardDescription className="text-m text-muted-foreground mt-1">{submittedAt}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function SubmittedAssignmentsList() {
    const mockSubmissions = [
  {
    id: '1',
    candidate: 'Serena Williams',
    submittedAt: '17:00 IST',
    repoUrl: 'github.com/sarachen/auth-api',
  },
  {
    id: '2',
    candidate: 'John Cena',
    submittedAt: '20:08 IST',
    repoUrl: 'github.com/mrodriguez/jwt-auth',
  },
  {
    id: '3',
    candidate: 'Jack Cena',
    submittedAt: '21:08 IST',
    repoUrl: 'github.com/mrodriguez/jwt-auth',
  },
];
    const submissionsListDisplay = mockSubmissions.map((item) => 
    <SubmissionCard key={item.id} candidate={item.candidate} repoUrl={item.repoUrl} submittedAt={item.submittedAt}></SubmissionCard>)

    return(
        <div>
            <ul className="space-y-1">{submissionsListDisplay}</ul>
        </div>
    )
}

export function SubmissionReceivedCard({ className = "" }: { className?: string }) {
    return(
        <div>
            <Card className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
        <CardHeader>
            <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
            Submissions Received
            </CardTitle>
            <CardDescription></CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 px-6"> <SubmittedAssignmentsList /> </div>
        <div className="flex flex-row px-6 gap-2">
          <Button
                variant="ghost"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300"
          >Resend Assignment</Button>
          <Button
                variant="default"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300 cursor-pointer"
        >Insights</Button>
        </div>
      </Card>
        </div>
    )
}