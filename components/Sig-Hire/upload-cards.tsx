import { Button } from "@/components/ui/button";
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
      <Card
  className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  hover:shadow-[0_30px_70px_-25px_rgba(124,58,237,0.35)]

  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
"
>
  {/* Glow layer */}
  <div className="pointer-events-none absolute inset-0">
    <div
      className="absolute -top-24 -left-24 h-80 w-80 rounded-full
      bg-purple-300/30 blur-3xl
      dark:bg-purple-600/20"
    />
    <div
      className="absolute bottom-0 right-0 h-72 w-72 rounded-full
      bg-indigo-200/30 blur-3xl
      dark:bg-indigo-500/10"
    />
  </div>

  <CardHeader className="relative z-10 space-y-5">
    <div
      className="h-1 w-12 rounded-full
      bg-gradient-to-r from-purple-500 to-indigo-500"
    />

    <CardTitle
      className="text-4xl font-extrabold tracking-tight
      text-neutral-900 dark:text-white"
    >
      Welcome To
      <div
        className="text-5xl text-primary py-2"
      >
      SigHire
      </div>
    </CardTitle>

    <CardDescription
      className="max-w-md text-lg leading-relaxed
      text-neutral-600 dark:text-neutral-300"
    >
      Enter your job description and candidate information, then click{" "}
      <span className="font-medium text-primary">
        Continue
      </span>{" "}
      to let our ranking engine find the best matches.
    </CardDescription>
  </CardHeader>
</Card>


      {/* Card 2: Job Upload */}
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
</Card>


      {/* Card 3: Average Time to Fill */}
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