export const taskCompletedTemplate = (task: any, userName: string | string[], frontendUrl: string) => {
  const userNamesList = Array.isArray(userName) ? userName : [userName];
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #2c3e50;">Task Completed</h2>
      <p>Task "${task.title}" has been completed by ${userNamesList.map((name: string) => `<li>${name}</li>`).join('')}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.description}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Completed Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.priority}</td></tr>
      </table>
      <p style="color: #3498db;">View Task: <a href="${frontendUrl}/task/${task._id}">Task Details</a></p>
    </div>
  `;
};


  export const taskAssignedTemplate = (task: any, userName: string, frontendUrl: string) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50;">New Task Assignment</h2>
        <p>Hello ${userName},</p>
        <p>You've been assigned a new task:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.title}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.description}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.dueDate}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.priority}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${task.dueDate}</td></tr>

        </table>
        <p style="color: #3498db;">View Task: <a href="${frontendUrl}/task/${task._id}">Task Details</a></p>
      </div>
    `;
  };
  
  