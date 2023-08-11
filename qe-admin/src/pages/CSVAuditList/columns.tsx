import type { ProColumns } from "@ant-design/pro-table";
import { Button } from "antd";
import moment from "moment";
import { FormattedMessage } from "umi";

export const columns: () => ProColumns<any>[] = () => [
  {
    title: "Uploaded Date",
    render: (dom, entity) => {
      return moment(entity.uploadedAt).isValid() ? moment(entity.uploadedAt).format("DD/MM/YYYY HH:mm:ss") : "NA";
    },
    dataIndex: "uploadedAt",
    hideInSearch: false,
    valueType: 'date',
  },
  {
    title: "School Name",
    dataIndex: "schoolName",
    hideInSearch: false,
  },
  {
    title: (
      <FormattedMessage
        id="pages.searchTable.uploadType"
        defaultMessage="Upload Type"
      />
    ),
    dataIndex: "uploadType",
    hideInForm: true,
    valueEnum: {
      'Student Upload': {
        text: (
          <FormattedMessage
            id="pages.searchTable.uploadType.student"
            defaultMessage="Student Upload"
          />
        ),
        status: "Student Upload",
      },
      'Teacher Upload': {
        text: (
          <FormattedMessage
            id="pages.searchTable.uploadType.teacher"
            defaultMessage="Teacher Upload"
          />
        ),
        status: "Teacher Upload",
      },
      'Batch Upload': {
        text: (
          <FormattedMessage
            id="pages.searchTable.uploadType.batch"
            defaultMessage="Batch Upload"
          />
        ),
        status: "Batch Upload",
      },
    },
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
