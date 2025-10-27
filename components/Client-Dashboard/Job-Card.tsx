import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, Wallet, Timer, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type JobCardProps = {
  jobId?: string
  title: string
  href?: string
  meta: {
    rate: string
    level: string
  }
  description: string
  tags?: string[]
  verified?: boolean
  location?: string
  proposals?: string
  className?: string
}

export function JobCard({
  jobId,
  title,
  href,
  meta,
  description,
  tags = [],
  verified = true,
  location = "United States",
  proposals = "Less than 5",
  className,
}: JobCardProps) {
  const router = useRouter()

  const handleEdit = () => {
    if (jobId) {
      router.push(`/client/edit/${jobId}`)
    }
  }

  return (
    <Card
      className={cn(
        // structure + theme
        "group relative rounded-2xl border bg-card/80 shadow-sm transition-colors",
        // subtle hover with brand ring
        "hover:border-brand/60 hover:ring-1 hover:ring-primary/70",
        className,
      )}
    >
      {/* Edit Button - Top Right Corner */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="absolute right-4 top-4 z-10 size-8 rounded-full p-0"
      >
        <Edit className="size-4" />
        <span className="sr-only">Edit job</span>
      </Button>

      <CardHeader className="gap-3">
        <CardTitle className="text-balance text-xl font-semibold leading-tight">
          {href ? (
            <a href={href} className="text-primary underline-offset-4 hover:underline">
              {title}
            </a>
          ) : (
            <span className="text-foreground">{title}</span>
          )}
        </CardTitle>

        <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-4 text-accent-foreground" aria-hidden />
            {meta.rate}
          </span>
          <span className="text-muted-foreground">•</span>
          <span>{meta.level}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-pretty leading-relaxed">
          {description}{" "}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full bg-muted text-muted-foreground">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {verified && (
            <>
              <CheckCircle2 className="size-4 text-accent-foreground" aria-hidden />
              <span className="text-foreground">Payment verified</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1">
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4 text-accent-foreground" aria-hidden />
            <span className="text-foreground">{location}</span>
          </span>
          <span className="text-green-600">Applied Candidates: {proposals}</span>
        </div>
      </CardFooter>
    </Card>
  )
}