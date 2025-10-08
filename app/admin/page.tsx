import JobsList from "@/components/Admin-Dashboard/JobList";
import CreateJob from "@/components/Admin-Dashboard/create-job";

const AdminDashboard = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <CreateJob />
          <JobsList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
