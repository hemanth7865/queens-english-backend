import {
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-table";
import { Typography } from 'antd';
import moment from "moment";

export const columns: () => ProColumns<any>[] = () => [
  {
    title: "First Name",
    dataIndex: "firstName",
    fixed: "left",
    hideInSearch: false,
  },
  {
    title: "Last Name",
    dataIndex: "lastName",
    fixed: "left",
    hideInSearch: false,
  },
  {
    title: "Assigned Installments",
    dataIndex: "installmentsCount",
    hideInSearch: true,
  },
  {
    title: "Email",
    dataIndex: "email",
    hideInSearch: false,
    copyable: true,
  },
  {
    title: "Phone",
    dataIndex: "phoneNumber",
    hideInSearch: false,
    copyable: true,
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
  // {
  //   title: "Operations",
  //   dataIndex: "edit",
  //   hideInSearch: true,
  //   fixed: "right",
  //   width: 240,
  //   render: (dom, entity) => {
  //     return (
  //       <div style={{ display: "flex", gap: 10 }}>
  //         <Typography.Link onClick={() => setShow(entity)}>
  //           <EyeOutlined title="Show" />
  //         </Typography.Link>
  //         <Typography.Link onClick={() => handleDelete(entity)}>
  //           <DeleteOutlined title="Delete" />
  //         </Typography.Link>
  //         <Typography.Link onClick={() => handleReassign(entity)}>
  //           <ReloadOutlined title="Reassign" />
  //         </Typography.Link>
  //       </div>
  //     );
  //   },
  // },
];
