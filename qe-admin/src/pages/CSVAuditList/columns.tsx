import type { ProColumns } from "@ant-design/pro-table";
import { Button } from "antd";
import { UPLOAD_TYPES } from "../../../config/constants";
import moment from "moment";
import { FormattedMessage } from "umi";
import { getStorageFileURL } from "@/services/ant-design-pro/helpers";

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
            defaultMessage={UPLOAD_TYPES.STUDENT}
          />
        ),
        status: UPLOAD_TYPES.STUDENT,
      },
      'Teacher Upload': {
        text: (
          <FormattedMessage
            id="pages.searchTable.uploadType.teacher"
            defaultMessage={UPLOAD_TYPES.TEACHER}
          />
        ),
        status: UPLOAD_TYPES.TEACHER,
      },
      'Batch Upload': {
        text: (
          <FormattedMessage
            id="pages.searchTable.uploadType.batch"
            defaultMessage={UPLOAD_TYPES.BATCH}
          />
        ),
        status: UPLOAD_TYPES.BATCH,
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
      const url = entity?.fileName?.startsWith("assets") ? getStorageFileURL(entity?.fileName) : `https://eqbulkuploads.s3.ap-south-1.amazonaws.com/${entity?.fileName}`;
      return <Button type="primary" key="primary">
        <a href={url} target="_blank">
          Download
        </a>
      </Button>
    },
  },
];
