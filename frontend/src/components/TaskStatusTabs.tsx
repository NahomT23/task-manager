
import React from "react"

interface Tab {
  Label: string
  count: number
}

interface TaskStatusTabsProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TaskStatusTabs: React.FC<TaskStatusTabsProps> = ({
  tabs,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="my-2">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.Label}
            onClick={() => setActiveTab(tab.Label)}
            className={`relative px-2 md:px-4 py-2 text-sm font-medium cursor-pointer
              ${activeTab === tab.Label ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center">
              <span className="text-xs capitalize">
                {tab.Label}
              </span>
              <span className={`text-xs ml-1 px-2 py-0.5 rounded-full 
                ${activeTab === tab.Label ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
            </div>

            {activeTab === tab.Label && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TaskStatusTabs

