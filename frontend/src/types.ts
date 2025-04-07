export type User = {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'idle';
    profileImageUrl?: string;
    organization?: string;
  };



export type Todo = {
  text: string;
  completed: boolean;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'inProgress' | 'completed';
  dueDate?: string; 
  assignedTo: string[];
  createdBy: string; 
  attachments: string[];
  pseudo_attachments: string[];
  todoChecklist: Todo[];
  progress: number;
  organization: string;
  createdAt: string; 
  updatedAt: string; 
};
