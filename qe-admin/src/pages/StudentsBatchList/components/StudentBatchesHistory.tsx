import React from 'react';
import { Table } from 'antd';



export type Props = {
  data: any
};

const StudentBatchesHistory: React.FC<Props> = ({ data }) => {

  const columns = [
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: 'Change Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render(dom: string) {
        return dom.split("T")[0];
      }
    },
  ];

  return (
    <>
      <h4 style={{ textAlign: 'center' }}>Student Batches History</h4>
      <Table dataSource={data.batchesHistory} columns={columns} />
    </>
  );
};

export default StudentBatchesHistory;
