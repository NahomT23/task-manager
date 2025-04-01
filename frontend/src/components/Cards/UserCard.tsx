import { useNavigate } from "react-router-dom";

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    profileImageUrl: string;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
  }
  
  interface UserCardProps {
    userInfo: UserInfo;
  }
  
  const UserCard = ({ userInfo }: UserCardProps) => {

    const navigate = useNavigate()

    return (
      <div
      onClick={() => navigate(`/admin/users/${userInfo._id}`)} 
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={userInfo?.profileImageUrl}
              alt="profile"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white object-cover"
            />
            <div>
              <p className="text-sm md:text-base font-medium line-clamp-1">
                {userInfo?.name}
              </p>
              <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                {userInfo?.email}
              </p>
            </div>
          </div>
        </div>  
  
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatusCard
            label="Pending"
            count={userInfo?.pendingTasks || 0}
            status="pending"
          />
          <StatusCard
            label="In Progress"
            count={userInfo?.inProgressTasks || 0}
            status="inProgress"
          />
          <StatusCard
            label="Completed"
            count={userInfo?.completedTasks || 0}
            status="completed"
          />
        </div>
      </div>
    )
  }



  interface StatusCardProps {
    label: string;
    count: number;
    status: 'pending' | 'inProgress' | 'completed';
  }
  
  const StatusCard = ({ label, count, status }: StatusCardProps) => {
    const getStatusColor = () => {
      switch (status) {
        case 'inProgress':
          return "bg-cyan-50 border-cyan-100 text-cyan-700";
        case 'completed':
          return "bg-lime-50 border-lime-100 text-lime-700";
        default:
          return "bg-violet-50 border-violet-100 text-violet-700";
      }
    };
  
    return (
      <div className={`flex flex-col items-center p-2 rounded-lg border ${getStatusColor()} transition-colors duration-200`}>
        <span className="text-sm md:text-base font-semibold">
          {count}
        </span>
        <span className="text-xs text-center mt-1 line-clamp-1">
          {label}
        </span>
      </div>
    );
  };

export { UserCard , StatusCard }