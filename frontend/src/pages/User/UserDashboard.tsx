import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import moment from "moment";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../layouts/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import axiosInstance from "../../api/axiosInstance";
import { IoMdCard } from "react-icons/io";
import Loading from "../../components/Loading";
import CountUp from "react-countup";
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

// Fetcher using TanStack Query
const fetchUserDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get("/tasks/user-dashboard-data");
  const raw = response.data;


  const defaultCharts = {
    taskDistribution: { All: 0, Pending: 0, InProgress: 0, Completed: 0 },
    taskPriorityLevels: { Low: 0, Medium: 0, High: 0 },
  };

  const charts = raw.charts ?? defaultCharts;
  const recentTasks = (raw.recentTasks ?? []).map((task: any) => ({
    id: task._id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
  }));

  return { charts, recentTasks };
};

const UserDashboard = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();


  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DashboardData, Error>({
    queryKey: ["userDashboardData"],
    queryFn: fetchUserDashboardData,
    staleTime: 5 * 60 * 1000,       
    refetchOnWindowFocus: true,     
  });

  // Prepare chart data
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

  const onSeeMore = () => navigate("/user/tasks");

  return (
    <DashboardLayout activeMenu="Dashboard">
      {isLoading ? (
        <Loading text="Loading dashboard..." />
      ) : isError ? (
        <div className="text-center py-10">
          <div className={`text-red-500 mb-4 ${isDarkMode ? 'dark:text-red-400' : ''}`}>   
            {error?.message || "Failed to load dashboard data."}
          </div>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Welcome Card */}
          <div className={`card my-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="col-span-3">
              <h1 className={`text-xl md:text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>  
                Welcome back, {user?.name}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {moment().format("dddd Do MMM YYYY")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Total Tasks"
                value={<CountUp end={data!.charts.taskDistribution.All} separator="," duration={2} />}
                color="bg-blue-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Pending Tasks"
                value={<CountUp end={data!.charts.taskDistribution.Pending} separator="," duration={2} />}
                color="bg-violet-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="In Progress Tasks"
                value={<CountUp end={data!.charts.taskDistribution.InProgress} separator="," duration={2} />}
                color="bg-cyan-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Completed Tasks"
                value={<CountUp end={data!.charts.taskDistribution.Completed} separator="," duration={2} />}
                color="bg-lime-600"
              />
            </div>
          </div>

          {/* Charts & Recent Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-lg">Task Distribution</h5>
              </div>
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-lg">Task Priority Levels</h5>
              </div>
              <CustomBarChart data={barChartData} />
            </div>

            <div className="md:col-span-2">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium">Recent Tasks</h5>
                  <button
                    className={`flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    onClick={onSeeMore}
                  >
                    See All <LuArrowRight className="ml-1 text-base" />
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

export default UserDashboard;
