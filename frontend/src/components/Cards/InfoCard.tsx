import { ReactNode } from "react";

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode; 
  color: string;
}

const InfoCard = ({ icon, label, value, color }: InfoCardProps) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">
          {value} 
        </p>
      </div>
    </div>
  );
};

export default InfoCard;