import {
  EditTwoTone,
  WhatsAppOutlined,
  LinkOutlined,
  MoneyCollectTwoTone,
  PlusSquareTwoTone,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { Typography } from 'antd';
import moment from "moment";

export const columns: (handleShow: (data: any) => any) => ProColumns<any>[] = (handleShow) => [
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
    title: "Creation Date",
    render: (dom, entity) => {
      return moment(entity.created_at).format("MM/DD/YYYY HH:mm:ss");
    },
    hideInSearch: true,
  },
  {
    title: "Operations",
    dataIndex: "edit",
    hideInSearch: true,
    fixed: "right",
    width: 240,
    render: (dom, entity) => {
      return (
        <div>
          <Typography.Link onClick={() => handleShow(entity)}>
            <LinkOutlined title="Regenerate Link" />
          </Typography.Link>
        </div>
      );
    },
  },
];
