export const getStatusTagColors = (status: string): string => {
    switch (status) {
      case 'inProgress':
        return 'text-cyan-500 bg-cyan-50 border border-cyan-500/10';
      case 'completed':
        return 'text-lime-500 bg-lime-50 border border-lime-500/10';
      default: // pending
        return 'text-violet-500 bg-violet-50 border border-violet-500/10';
    }
  };
  
  export const getPriorityTagColors = (priority: string): string => {
    switch (priority) {
      case 'low':
        return 'text-emerald-500 bg-emerald-50 border border-emerald-500/10';
      case 'medium':
        return 'text-amber-500 bg-amber-50 border border-amber-500/10';
      default: // high
        return 'text-rose-500 bg-rose-50 border border-rose-500/10';
    }
  };
  
  export const getStatusBadgeColors = (status: string): string => {
    switch (status) {
      case 'inProgress':
        return 'bg-cyan-50 border-cyan-100 text-cyan-700';
      case 'completed':
        return 'bg-lime-50 border-lime-100 text-lime-700';
      default: // pending
        return 'bg-violet-50 border-violet-100 text-violet-700';
    }
  };
  
  export const getTableStatusBadgeColors = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-500 border border-green-200';
      case 'pending':
        return 'bg-purple-100 text-purple-500 border border-purple-200';
      case 'inProgress':
        return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };
  
  export const getTablePriorityBadgeColors = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-500 border border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-500 border border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-500 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };