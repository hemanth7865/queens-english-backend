import type { ProColumns } from "@ant-design/pro-table";
import { Button } from "antd";
import moment from "moment";

export const columns: () => ProColumns<any>[] = () => [
  {
    title: "Uploaded Date",
    render: (dom, entity) => {
      return moment(entity.uploadedAt).isValid() ? moment(entity.uploadedAt).format("DD/MM/YYYY HH:mm:ss") : "NA";
    },
    hideInSearch: false,
    valueType: 'date',
  },
  {
    title: "School Name",
    dataIndex: "schoolName",
    hideInSearch: false,
  },
  {
    title: "Upload Type",
    dataIndex: "uploadType",
    hideInSearch: false,
  },
  {
    title: "Uploaded By",
    dataIndex: "uploadedByName",
    hideInSearch: false,
  },
  {
    title: "CSV File",
    dataIndex: "fileName",
    hideInSearch: true,
    render: (dom, entity) => {
      const url = `https://eqbulkuploads.s3.ap-south-1.amazonaws.com/${entity.fileName}`;
      return <Button type="primary" key="primary">
        <a href={url} target="_blank">
          Download
        </a>
      </Button>
    },
  },
];
