import React from "react";
import { saveAs } from "file-saver";
import { Button } from "antd";
import { studentsBatches } from "@/services/ant-design-pro/api";

interface Props {
  title?: string;
  total: number;
  [key: string]: any;
}

const ExportStudentList = React.memo(({ title = "Export to CSV"
  , total, ...params }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const exportToCsv = async () => {
    setIsLoading(true);
    try {
      const res = await studentsBatches({
        ...params,
        current: 1,
        pageSize: total,
      });
      const students: API.StudentItem[] = res.data || [];
      const csvData = [
        [
          "Name",
          "App Login ID",
          "App Password",
          "Email",
          "Phone",
          "School",
          "Batch Code",
          "Status",
          "Offline User",
        ],
      ];
      students.forEach((student) => {
        csvData.push([
          `${student.firstName} ${student.lastName}`,
          student.studentID ?? student.leadId ?? "",
          student.password || "",
          student.email,
          student.phoneNumber,
          student.schoolName || "",
          student.batchCode,
          student.status,
          student.offlineUser ? "Yes" : "No",
        ]);
      });

      const blob = new Blob([csvData.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "student-list.csv");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      key="primary"
      onClick={exportToCsv}
      loading={isLoading}
      disabled={isLoading}
      style={{ marginRight: "5px" }}
    >
      {title}
    </Button>
  );
});

export default ExportStudentList;
