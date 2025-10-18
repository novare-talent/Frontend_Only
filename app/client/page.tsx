import ClientJobs from "@/components/Client-Dashboard/ClientJobsList";
import { JobForm } from "@/components/Client-Dashboard/Job-Form";

const AdminDashboard = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-4">
          {/* <section className="mx-auto max-w-6xl px-6" itemID="create-job">
            <header className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-primary">
                Create a Job
              </h1>
            </header>

            <JobForm />
          </section> */}
          <ClientJobs />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
