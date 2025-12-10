import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:h-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      {/* Card 1: Welcome to SmartHire */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            Welcome
            To
            Smart Hire
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +25% vs. last month
            </Badge> */}
          </CardAction>
          <CardDescription className="text-xl text-primary mt-3">Information on how the website works!</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Some more instructions
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Job Upload */}
<Card className="@container/card">
  <CardHeader>
    <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
      Job Description
    </CardTitle>
    <CardDescription>Upload or write your job description below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Write Job Description</label>
      <textarea
        className="w-full min-h-60 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type the job description here..."
      />
    </div>
                <div className="p-3 text-muted-secondary font-thin text-center">OR</div>
    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Upload Document or PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
      />
    </div>
 </div>

  {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      Spike due to new marketing campaign <IconTrendingUp className="size-4" />
    </div>
    <div className="text-muted-foreground">
      Across all active job postings
    </div>
  </CardFooter> */}
</Card>


      {/* Card 3: Average Time to Fill */}
      <Card className="@container/card">
  <CardHeader>
    <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
      Candidates
    </CardTitle>
    <CardDescription>Upload or enter your candidate details below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Enter CSV of your job candidates here</label>
      <textarea
        className="w-full min-h-60 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type the job description here..."
      />
    </div>
                <div className="p-3 text-muted-secondary font-thin text-center">OR</div>
    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Upload Document, CSV, PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
      />
    </div>
    <div className="py-2">
        {/* <button className="p-6 bg-primary text-white rounded-md mx-auto block justify-center">Submit</button> */}
        <Button
                variant="default"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300"
        >Continue</Button>
        {/* On click it will send onSubmitUploads */}
    </div>  
 </div>
 </Card>
    </div>
  )
}