import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import moment from "moment";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../layouts/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import axiosInstance from "../../api/axiosInstance";
import { IoMdCard } from "react-icons/io";
import Loading from "../../components/Loading";
import CountUp from 'react-countup';
import { useThemeStore } from "../../store/themeStore";

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
  recentTasks: any[];
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

const UserDashboard = () => {
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const prepareChartData = (chartsData: DashboardData["charts"]) => {
    const { taskDistribution, taskPriorityLevels } = chartsData;
    
    const taskDistributionData: PieChartData[] = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];
    
    setPieChartData(taskDistributionData);
    
    const priorityLevelData: BarChartData[] = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ];
    
    setBarChartData(priorityLevelData);
  };

  const getDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get("/tasks/user-dashboard-data");
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      const defaultCharts = {
        taskDistribution: { All: 0, Pending: 0, InProgress: 0, Completed: 0 },
        taskPriorityLevels: { Low: 0, Medium: 0, High: 0 },
      };
      
      const chartsData = response.data.charts || defaultCharts;
      const recentTasks = response.data.recentTasks || [];
      
      setDashboardData({
        charts: chartsData,
        recentTasks: recentTasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          createdAt: task.createdAt,
        }))
      });
      
      prepareChartData(chartsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSeeMore = () => {
    navigate("/user/tasks");
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  if (error) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="text-center py-10">
          <div className={`text-red-500 mb-4 ${isDarkMode && 'dark:text-red-400'}`}>
            {error}
          </div>
          <button
            onClick={getDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      {isLoading ? (
        <Loading text="Loading dashboard..." />
      ) : (
        <>
          <div className={`card my-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div>
              <div className="col-span-3">
                <h1 className={`text-xl md:text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back {user?.name}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {moment().format("dddd Do MMM YYYY")}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="Total Tasks"
                value={
                  <CountUp 
                    end={dashboardData?.charts.taskDistribution.All || 0} 
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
                    end={dashboardData?.charts.taskDistribution.Pending || 0} 
                    separator="," 
                    duration={2}
                  />
                }
                color="bg-violet-600"
              />
              <InfoCard
                icon={<IoMdCard className="text-white text-xl" />}
                label="In Progress Tasks"
                value={
                  <CountUp 
                    end={dashboardData?.charts.taskDistribution.InProgress || 0} 
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
                    end={dashboardData?.charts.taskDistribution.Completed || 0} 
                    separator="," 
                    duration={2}
                  />
                }
                color="bg-lime-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
            <div>
              <div className={`card p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h5 className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Task Distribution
                  </h5>
                </div>
                <CustomPieChart 
                  data={pieChartData} 
                  colors={COLORS} 

                />
              </div>
            </div>
            
            <div>
              <div className={`card p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h5 className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Task Priority Levels
                  </h5>
                </div>
                <CustomBarChart 
                  data={barChartData} 

                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className={`card p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h5 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Tasks
                  </h5>
                  <button 
                    className={`flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    onClick={onSeeMore}
                  >
                    See All <LuArrowRight className="ml-1 text-base" />
                  </button>
                </div>
                <TaskListTable 
                  tableData={dashboardData?.recentTasks || []} 

                />
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;