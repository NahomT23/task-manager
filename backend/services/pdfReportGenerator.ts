import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";

pdfMake.vfs = pdfFonts.vfs;


export const generateTaskPdf = (tasks: any[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const tableBody = [
      ["Title", "Description", "Priority", "Status", "Created On", "Due Date", "Assigned To", "Overdue"]
    ];

    tasks.forEach((task) => {
      const assignedToArray = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo ? [task.assignedTo] : [];
      const assignedToStr = assignedToArray
        .map((user: any) => `${user.name} (${user.email})`)
        .join(", ") || "Unassigned";

      const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
      const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";
      const overdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== "completed" ? "Yes" : "No";

      tableBody.push([
        task.title || "No Title",
        task.description || "No Description",
        task.priority ?? "N/A",
        task.status ?? "N/A",
        createdOnStr,
        dueDateStr,
        assignedToStr,
        overdue,
      ]);
    });

    const docDefinition: any = {
      pageOrientation: "landscape",
      content: [
        { text: "Tasks Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "auto", "auto", "auto", "auto", "*", 60],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer: ArrayBuffer) => {
      resolve(Buffer.from(buffer));
    });
  });
};


export const generateUserPdf = (reportData: any[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const docDefinition: any = {
      pageOrientation: "landscape",
      content: [
        { text: "User Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "auto", "auto", "auto", "auto", "auto", 80, 50],
            body: [
              [
                "Name",
                "Email",
                "Total Tasks",
                "Pending Tasks",
                "In Progress Tasks",
                "Completed Tasks",
                "Member Since",
                "Tenure",
                "Completion Rate",
              ],
              ...reportData.map((user) => [
                user.name,
                user.email,
                user.taskCount,
                user.pendingTasks,
                user.inProgressTasks,
                user.completedTasks,
                user.memberSince,
                { text: user.tenure, noWrap: false },
                { text: user.taskCompletionRate, noWrap: false },
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        }
      },
      defaultStyle: {
        font: "Roboto"
      }
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer: ArrayBuffer) => {
      resolve(Buffer.from(buffer));
    });
  });
};
