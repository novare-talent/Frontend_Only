// import { SectionCards } from "@/components/Candidate-Dashboard/section-cards";
// import AppliedJobsGrid from "@/components/Candidate-Dashboard/AppliedJobsGrid";

// export default function Page() {
//   return (
//     <div className="flex flex-1 flex-col">
//       <div className="@container/main flex flex-1 flex-col gap-2">
//         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//           {/* <SectionCards /> */}
//           {/* <div className="px-4 lg:px-6">
//             <ChartAreaInteractive />
//           </div> */}
//           <AppliedJobsGrid />
//         </div>
//       </div>
//     </div>
//   );
// }
import JobsGrid from "@/components/Candidate-Dashboard/job-cards";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <JobsGrid />
        </div>
      </div>
    </div>
  );
}
