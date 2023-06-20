import { EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Typography } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getSra, listSchool } from '@/services/ant-design-pro/api';
import SchoolForm from './components/Drawers/schoolForm';
import SRAForm from './components/Drawers/sraForm';
import ViewDrawer from './components/Drawers/viewDrawer';
const { Text } = Typography;

export type SchoolListProps = {
    data: {}
};

const SchoolList: React.FC<SchoolListProps> = () => {
    const intl = useIntl();
    const actionRef = useRef<ActionType>();

    const [view, setView] = useState<any>();
    const [create, setCreate] = useState<any>();
    const [edit, setEdit] = useState<any>();
    const [createSRA, setCreateSRA] = useState<any>();
    const [sra, setSra] = useState<any>([]);

    async function getSras() {
        const sras = await getSra();
        setSra(sras.data)
    }

    const options = sra.map((item: any) => {
        return {
            text: (
                <FormattedMessage
                    id="pages.searchTable.school.sras.active"
                    defaultMessage={item.name}
                    key={item.id}
                />
            ),
        }
    });
    useEffect(() => {
        getSras();
    }, [])

    const columns: ProColumns<API.SchoolItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.schoolName"
                    defaultMessage="School Name"
                />
            ),
            dataIndex: "schoolName",
            copyable: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.schoolCode"
                    defaultMessage="School Code"
                />
            ),
            dataIndex: "schoolCode",
            copyable: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.schoolCode"
                    defaultMessage="Location Code"
                />
            ),
            dataIndex: "locationCode",
            copyable: true,
            render: (_, entity: any) => entity?.locationCode ? <Text copyable>{entity?.locationCode}</Text> : 'NA',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.id"
                    defaultMessage="School ID"
                />
            ),
            dataIndex: "schoolId",
            copyable: true,
            render: (_, entity: any) => entity?.schoolId ? <Text copyable>{entity?.schoolId}</Text> : 'NA',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.createdAt"
                    defaultMessage="Created At"
                />
            ),
            dataIndex: "createdAt",
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.numberOfBatches"
                    defaultMessage="No. Of Batches"
                />
            ),
            dataIndex: "numberOfBatches",
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.poc"
                    defaultMessage="POC"
                />
            ),
            dataIndex: "poc",
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.sraName"
                    defaultMessage="SRA"
                />
            ),
            dataIndex: "sraName",
            valueEnum: options,
            valueType: 'select',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.schoolStatus"
                    defaultMessage="Status"
                />
            ),
            dataIndex: "schoolStatus",
            hideInForm: true,
            valueEnum: {
                0: {
                    text: (
                        <FormattedMessage
                            id="pages.searchTable.school.status.active"
                            defaultMessage="Active"
                        />
                    ),
                },
                1: {
                    text: (
                        <FormattedMessage
                            id="pages.searchTable.school.status.inactive"
                            defaultMessage="Inactive"
                        />
                    ),
                },
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.view"
                    defaultMessage="View"
                />
            ),
            dataIndex: "view",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                        onClick={() => { setView(entity); }}
                    >
                        <EyeOutlined />
                    </a>
                );
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.edit"
                    defaultMessage="Edit"
                />
            ),
            dataIndex: "edit",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                        onClick={() => {
                            setEdit({ ...entity, operation: 'edit' });
                        }}
                    >
                        <EditOutlined />
                    </a>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<API.RuleListItem, API.PageParams>
                headerTitle={intl.formatMessage({
                    id: 'pages.searchTable.titleSchool',
                    defaultMessage: 'School Management',
                })}
                actionRef={actionRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                request={listSchool}
                columns={columns}
                toolBarRender={() => [
                    // <Button
                    //     type="primary"
                    //     key="primary"
                    //     onClick={() => {
                    //         setCreate({ operation: 'create' });
                    //     }}
                    // >
                    //     <PlusOutlined /> Add School
                    // </Button>,
                    <Button
                        type="primary"
                        key="primary"
                        onClick={() => { setCreateSRA(true); }}
                    >
                        <PlusOutlined /> Add SRA
                    </Button>,
                ]}
            />
            <Drawer visible={!!view} onClose={() => { setView(null); }} width="800px">
                <h1>View School</h1>
                <ViewDrawer tempData={view} />
            </Drawer>
            <Drawer visible={!!edit} onClose={() => {
                setEdit(null);
            }} width='820px'>
                <h1 align='center'>Edit School: {edit?.schoolName}</h1>
                <SchoolForm tempData={edit} />
            </Drawer>
            <Drawer visible={createSRA} onClose={() => { setCreateSRA(false); }} width="450px">
                <h1>Create SRA</h1>
                <SRAForm />
            </Drawer>
            <Drawer visible={!!create} onClose={() => {
                setCreate(null);
            }} width='750px'>
                <h1 align='center'>Create School</h1>
                <SchoolForm tempData={create} />
            </Drawer>

        </PageContainer>
    );
};

export default SchoolList;
