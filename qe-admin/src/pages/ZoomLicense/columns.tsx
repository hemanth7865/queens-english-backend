import {
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  LockOutlined
} from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-table";
import { Typography } from 'antd';
import moment from "moment";

export const columns: (
  handleShow: (data: any) => any,
  handleDelete: (data: any) => any,
  handleReassign: (data: any) => any,
  handleRegenerateToken: (data: any) => any
) => ProColumns<any>[] = (setShow, handleDelete, handleReassign, handleRegenerateToken) => [
  {
    title: "First Name",
    dataIndex: "first_name",
    fixed: "left",
    hideInSearch: false,
  },
  {
    title: "Last Name",
    dataIndex: "last_name",
    fixed: "left",
    hideInSearch: false,
  },
  {
    title: "Zoom Links",
    render: (dom, entity) => {
      return (entity.meetings.length);
    },
    hideInSearch: true,
  },
  {
    title: "Email",
    dataIndex: ["user", "email"],
    hideInSearch: true,
    copyable: true,
  },
  {
    title: "Email",
    dataIndex: "user.email",
    hideInSearch: false,
    hideInTable: true,
  },
  {
    title: "Phone",
    dataIndex: ["user", "phoneNumber"],
    hideInSearch: true,
    copyable: true,
  },
  {
    title: "Phone",
    dataIndex: "user.phoneNumber",
    hideInSearch: false,
    hideInTable: true,
  },
  {
    title: "Updated Date",
    render: (dom, entity) => {
      return moment(entity.updated_at).format("MM/DD/YYYY HH:mm:ss");
    },
    hideInSearch: true,
    valueType: 'date',
  },
  {
    title: "Created Date",
    render: (dom, entity) => {
      return moment(entity.created_at).format("MM/DD/YYYY HH:mm:ss");
    },
    hideInSearch: true,
    valueType: 'date',
  },
  {
    title: "Operations",
    dataIndex: "edit",
    hideInSearch: true,
    fixed: "right",
    width: 240,
    render: (dom, entity) => {
      return (
        <div style={{ display: "flex", gap: 10 }}>
          <Typography.Link onClick={() => setShow(entity)}>
            <EyeOutlined title="Show" />
          </Typography.Link>
          <Typography.Link onClick={() => handleDelete(entity)}>
            <DeleteOutlined title="Delete" />
          </Typography.Link>
          <Typography.Link onClick={() => handleReassign(entity)}>
            <ReloadOutlined title="Reassign" />
          </Typography.Link>
          <Typography.Link onClick={() => handleRegenerateToken(entity)}>
            <LockOutlined title="Regenerate ZAK Token" />
          </Typography.Link>
        </div>
      );
    },
  },
];
