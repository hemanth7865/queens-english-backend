import React, { useState } from 'react';
import { Spin, Table, TableColumnsType } from 'antd';

export type ViewSchoolProps = {
    tempData: any;
};

interface DataType {
    key: React.Key;
    batchNumber: string;
    batchId: string;
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
        }
    })
    let students = props.tempData?.classesData?.map((item: any) => {
        return {
            ...item.students,
        }
    })
    const data: DataType[] = [];
    let expandedData: ExpandedDataType[] = [];
    for (let i = 0; i < classes?.length; ++i) {
        let expandedData2: any[] = [];
        data.push({
            key: i.toString(),
            ...classes[i],
        });
        for (let j = 0; j < classes[i]?.students?.length; ++j) {
            expandedData2.push({
                key: j.toString(),
                ...classes[i]?.students[j],
            })
        }
        do {
            expandedData = [...expandedData, ...expandedData2]
        } while (!++i)
    }
    console.log('classes', data, 'students', expandedData)
    const columns: TableColumnsType<DataType> = [
        { title: 'Batch Code', dataIndex: 'batchNumber', key: 'batchNumber' },
        { title: 'Batch Id', dataIndex: 'batchId', key: 'batchId' },
    ];

    const expandedRowRender = (key: any) => {
        const expandedDolumns: TableColumnsType<ExpandedDataType> = [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
            { title: 'Status', dataIndex: 'status', key: 'status' }
        ];

        return <Table columns={expandedDolumns} dataSource={expandedData} pagination={false} rowKey={key} />;
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <>
            <Spin spinning={isLoading} >
                <Table
                    columns={columns}
                    expandable={{
                        expandedRowRender: (record) => {
                            console.log('record', record)
                            return expandedRowRender(record.key)
                        },
                    }}
                    dataSource={data}
                    size='middle'
                />
            </Spin>
        </>
    );
};

export default ViewDrawer;