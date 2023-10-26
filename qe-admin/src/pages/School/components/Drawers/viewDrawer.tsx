import React from 'react';
import { Table, TableColumnsType } from 'antd';
import ExportStudentList from '@/pages/StudentsBatchList/components/ExportStudentList';

export type ViewSchoolProps = {
    tempData: any;
};

interface DataType {
    key: React.Key;
    batchNumber: string;
    batchId: string;
    students: any[];
}

interface ExpandedDataType {
    key: React.Key;
    name: string;
    id: string;
    email: string;
    mobile: string;
    status: string;
}

const ViewDrawer: React.FC<ViewSchoolProps> = (props) => {

    const classes = props.tempData?.classesData?.map((item: any) => {
        return {
            ...item,
            studentsLength: item.students.length
        }
    })
    const data: DataType[] = [];
    for (let i = 0; i < classes?.length; ++i) {
        data.push({
            key: i.toString(),
            ...classes[i],
        });
    }

    const columns: TableColumnsType<DataType> = [
        { title: 'Batch Code', dataIndex: 'batchNumber', key: 'batchNumber' },
        { title: 'Batch Id', dataIndex: 'batchId', key: 'batchId' },
        { title: 'Students', dataIndex: 'studentsLength', key: 'studentsLength' },
    ];

    const expandedRowRender = (record: any) => {
        const expandedColumns: TableColumnsType<ExpandedDataType> = [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
            { title: 'Status', dataIndex: 'status', key: 'status' }
        ];

        return <Table columns={expandedColumns} dataSource={record.students} pagination={false} size='middle' />;
    };



    return (
      <>
        <ExportStudentList
          title="Export all students to CSV"
          batchCode={props.tempData?.classesData?.map(
            (item: any) => item.batchNumber
          )}
          total={1000}
        />

        <Table
          columns={columns}
          expandable={{
            expandedRowRender: (record) => {
              return expandedRowRender(record);
            },
            rowExpandable: (record) => record.students.length !== 0,
          }}
          dataSource={data}
          size="middle"
        />
      </>
    );
};

export default ViewDrawer;