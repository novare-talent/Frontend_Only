import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SelectedCandidatesProps {
  firstName: string
  lastName: string
  email: string
}

function SelectedCandidateCard({firstName, lastName, email}: SelectedCandidatesProps) {

  return (
    <div>
     {/* <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:h-fit-content  *:data-[slot=card]:w-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3"> */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-lg font-medium tabular-nums @[250px]/card:text-l text-black dark:text-white">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {firstName.charAt(0)}
              </div>
              {firstName} {lastName}
            </div>
          </CardTitle>
          <CardDescription className="text-m text-muted-foreground mt-1">{email}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export function SelectedCandidates() {
    const selectedList = [
        {key: 1, firstName: 'John', lastName: 'Cena', email: 'joncena@gmail.com'},
        {key: 2, firstName: 'Serena', lastName: 'Williams', email: 'serena@gmail.com'},
        {key: 3, firstName: 'Jack', lastName: 'Williams', email: 'serena@gmail.com'},
        {key: 4, firstName: 'Jack', lastName: 'Williams', email: 'serena@gmail.com'}
    ]
    const candidateDisplay = selectedList.map((item) => 
    <SelectedCandidateCard key={item.key} firstName={item.firstName} lastName={item.lastName} email={item.email}></SelectedCandidateCard>)

    return(
        <div>
            <ul className="space-y-1">{candidateDisplay}</ul>
        </div>
    )
}
