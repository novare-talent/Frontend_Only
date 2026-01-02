"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
// import { FileUpload } from "../ui/file-upload"
import { SelectedCandidates } from "./selected-candidates";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:h-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      
      {/* Card 2: Assignment Upload */}
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
      Assignment
    </CardTitle>
    <CardDescription>Upload or generate your assignment below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-md font-medium text-primary">Upload Document or PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
      />
      {/* <div className="">
        <FileUpload></FileUpload>
      </div> */}
    </div>

                <div className="p-3 text-muted-foreground font-thin text-center">OR</div>

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Enter prompt </label>
      <textarea
        className="w-full min-h-40 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type the job description here..."
      />
    </div> 
    <div>
        {/* <button className="p-6 bg-primary text-white rounded-md mx-auto block justify-center">Submit</button> */}
        <Button
                variant="default"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300 cursor-pointer"
        >Submit</Button>
    </div>   
 </div>
</Card>


      {/* Card 2: Assignment Preview */}
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
            Assignment Preview
          </CardTitle>
          <CardDescription className="text-xl text-primary mt-3"></CardDescription>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Selected Candidates */}
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
            Selected Candidates
            </CardTitle>
            <CardDescription></CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 px-6"> <SelectedCandidates /> </div>
        <div className="flex flex-row px-6 gap-2">
          <Button
                variant="ghost"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300 cursor-pointer"
          >Reselect</Button>
          <Button
                variant="default"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300 cursor-pointer"
        >Send Assignment</Button>
        </div>
      </Card>
    </div>
  )
}