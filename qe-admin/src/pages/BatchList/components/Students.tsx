import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import ProTable from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";

type list = {
  label: string | number;
  value: string | number;
};

export type Props = {
  value: list[];
  defaultValue: list[];
  options: list[];
  onChange: (data: list[]) => void;

};

const Batch: React.FC<Props> = (props) => {
  const { onChange, value } = props;

  const remove = (id: string) => {
    if (confirm("Are you sure that you wanna remove this student from the batch?")) {
      onChange(value.filter((i: list) => i.value !== id))
    }
  }

  const listColumns: ProColumns<list>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.student"
          defaultMessage="Student"
        />
      ),
      dataIndex: "label",
    },
    {
      title: "Actions",
      tip: "Remove Student Action",
      hideInSearch: true,
      render: (dom: any, entity) => {
        const selected = value.filter((i: list) => i.value === dom.value)[0];
        return (
          <a
            style={selected ? { color: 'red' } : {}}
            onClick={() => {
              remove(dom.value)
            }}
          >
            <DeleteOutlined />
          </a>
        );
      },
    },
  ];


  return (
    <ProTable<list, API.PageParams>
      headerTitle={"Selected Students"}
      rowKey="key"
      search={false}
      columns={listColumns}
      dataSource={value}
      pagination={value.length > 5 ? { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30'] } : false}
    />
  )
}

export default Batch;

