import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import moment from "moment";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../layouts/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import axiosInstance from "../../api/axiosInstance";
import { IoMdCard } from "react-icons/io";
import CountUp from "react-countup";
import Loading from "../../components/Loading";
import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  charts: {
    taskDistribution: {
      All: number;
      Pending: number;
      InProgress: number;
      Completed: number;
    };
    taskPriorityLevels: {
      Low: number;
      Medium: number;
      High: number;
    };
  };
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface PieChartData {
  status: string;
  count: number;
}

interface BarChartData {
  priority: string;
  count: number;
}

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

// 1. Define a fetcher that returns DashboardData
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get("/tasks/dashboard-data");
  const raw = response.data;

  // Ensure safe defaults if shape is missing
  const defaultCharts = {
    taskDistribution: { All: 0, Pending: 0, InProgress: 0, Completed: 0 },
    taskPriorityLevels: { Low: 0, Medium: 0, High: 0 },
  };

  const charts = raw.charts ?? defaultCharts;
  const recentTasks: DashboardData["recentTasks"] = (raw.recentTasks ?? []).map(
    (task: any) => ({
      id: task._id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
    })
  );

  return { charts, recentTasks };
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 2. useQuery to manage dashboard data
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<DashboardData, Error>({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,            
    refetchOnWindowFocus: true,          
    retry: 1,                             
  });

  // 3. Prepare chart data only once when `data` changes
  const pieChartData: PieChartData[] = [];
  const barChartData: BarChartData[] = [];
  if (data) {
    const { taskDistribution, taskPriorityLevels } = data.charts;
    pieChartData.push(
      { status: "Pending", count: taskDistribution.Pending },
      { status: "In Progress", count: taskDistribution.InProgress },
      { status: "Completed", count: taskDistribution.Completed }
    );
    barChartData.push(
      { priority: "Low", count: taskPriorityLevels.Low },
      { priority: "Medium", count: taskPriorityLevels.Medium },
      { priority: "High", count: taskPriorityLevels.High }
    );
  }

  const onSeeMore = () => navigate("/admin/tasks");

  return (
    <DashboardLayout activeMenu="Dashboard">
      {isLoading ? (
        <Loading text="Loading dashboard..." />
      ) : isError ? (
        <div className="p-6 text-center text-red-500">
          {error?.message || "Failed to load dashboard data."}
        </div>
      ) : (
        <>
          <div className="card my-5 p-6">
            <h1 className="text-2xl font-semibold">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-500">{moment().format("dddd, Do MMMM YYYY")}</p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Total Tasks"
                value={
                  <CountUp
                    end={data!.charts.taskDistribution.All}
                    separator=","
                    duration={2}
                  />
                }
                color="bg-blue-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Pending Tasks"
                value={
                  <CountUp
                    end={data!.charts.taskDistribution.Pending}
                    separator=","
                    duration={2}
                  />
                }
                color="bg-violet-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="In Progress"
                value={
                  <CountUp
                    end={data!.charts.taskDistribution.InProgress}
                    separator=","
                    duration={2}
                  />
                }
                color="bg-cyan-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Completed Tasks"
                value={
                  <CountUp
                    end={data!.charts.taskDistribution.Completed}
                    separator=","
                    duration={2}
                  />
                }
                color="bg-lime-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-lg">Task Distribution</h5>
              </div>
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-lg">Priority Levels</h5>
              </div>
              <CustomBarChart data={barChartData} />
            </div>

            <div className="md:col-span-2">
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium text-lg">Recent Tasks</h5>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    onClick={onSeeMore}
                  >
                    See All <LuArrowRight className="ml-1" />
                  </button>
                </div>
                <TaskListTable tableData={data!.recentTasks} />
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
