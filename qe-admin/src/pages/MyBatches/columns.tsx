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
    title: "Batch",
    dataIndex: ["batch", "batchNumber"],
    fixed: "left",
    hideInSearch: true,
  },
  {
    title: "Batch",
    dataIndex: "batch.batchNumber",
    hideInSearch: false,
    hideInTable: true,
  },
  {
    title: "First Name",
    dataIndex: ["zoom_user", "first_name"],
    fixed: "left",
    hideInSearch: true,
  },
  {
    title: "First Name",
    dataIndex: "zoom_user.first_name",
    hideInSearch: false,
    hideInTable: true,
  },
  {
    title: "Last Name",
    dataIndex: ["zoom_user", "last_name"],
    fixed: "left",
    hideInSearch: true,
  },
  {
    title: "Last Name",
    dataIndex: "zoom_user.last_name",
    hideInSearch: false,
    hideInTable: true,
  },
  {
    title: "Host URL",
    dataIndex: "start_url",
    hideInSearch: true,
    render: (dom, entity) => {
      return <a href={entity.start_url}>Host URL</a>
    }
  },
  {
    title: "Join URL",
    dataIndex: "join_url",
    hideInSearch: true,
    render: (dom, entity) => {
      return <a href={entity.join_url}>Join URL</a>
    }
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
