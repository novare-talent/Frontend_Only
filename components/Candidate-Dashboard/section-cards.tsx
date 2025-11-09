import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

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
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      {/* Card 1: New Jobs Posted */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Jobs Posted</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            18
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +25% vs. last month
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Increased activity in Engineering <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Data from last 30 days</div>
        </CardFooter>
      </Card>

      {/* Card 2: Total Applications */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            242
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +50%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Spike due to new marketing campaign <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across all active job postings
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Average Time to Fill */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Time to be Hired</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            14 Days
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -10% vs. last quarter
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hiring process is more efficient <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Average for all roles filled this quarter
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}