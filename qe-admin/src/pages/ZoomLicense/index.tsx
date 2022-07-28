import { Button, Drawer, Spin, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllZoomUsers, getZoomUser, deleteZoomUser, addZoomUser, reassignZoomUserLicense, updateZoomUserZAKToken } from '@/services/ant-design-pro/api';
import Show from './Components/Show';
import Add from './Components/Add';
import Reassign from './Components/Reassign';
import Generate from './Components/Generate';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { columns as columnsMethod } from "./columns";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const TableList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [show, setShow] = useState<any>();
    const [addLicense, setAddLicense] = useState<boolean>(false);
    const [reassign, setReassign] = useState<boolean>(false);
    const [generate, setGenerate] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);


    const intl = useIntl();

    const handleDelete = async (data: any) => {
        setIsLoading(true);
        if (confirm("Are you sure delete zoom user license ?")) {
            try {
                const msg = await deleteZoomUser(data.id);
                if (!(msg?.data.deleted > 0)) {
                    throw new Error("Failed To Deleted");
                }
                handleAPIResponse(msg, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            }
        }
        setIsLoading(false);
        actionRef.current?.reload();
    }

    const handleAddLicense = async (id: string) => {
        setIsLoading(true);
        try {
            const msg: any = await addZoomUser(id);
            if (!(msg?.created > 0)) {
                throw new Error("Failed To Add");
            }
            handleAPIResponse(msg, "Created Zoom User License Successfully", "Failed To Add User License", false);
            setAddLicense(false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Created Zoom User License Successfully", "Failed To Add User License", false);
        }
        setIsLoading(false);
        actionRef.current?.reload();
    }

    const handleRegenerateToken = async (data: any) => {
        setIsLoading(true);
        const notificationParams: [string, string, boolean] = ["Update User ZAK Token Successfully", "Failed To Update User ZAK Token", false]
        try {
            const msg: any = await updateZoomUserZAKToken(data.user_id);
            if (!(msg?.updated > 0)) {
                throw new Error("Failed To Update ZAK Token");
            }
            handleAPIResponse(msg, ...notificationParams);
            setAddLicense(false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, ...notificationParams);
        }
        setIsLoading(false);
        actionRef.current?.reload();
    }

    const handleReassignLicense = async (from: string, to: string) => {
        setIsLoading(true);
        try {
            const msg: any = await reassignZoomUserLicense(from, to);
            handleAPIResponse(msg, "Reassigned Zoom User License Successfully", "Failed To Reassign User License", false);
            setReassign(false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Reassigned Zoom User License Successfully", "Failed To Reassign User License", false);
        }
        setIsLoading(false);
        actionRef.current?.reload();
    }

    const handleShow = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await getZoomUser(data.id);
            setShow(response.data);
        } catch (e) {
            handleAPIResponse({ status: 400 }, "", "Failed To Show Zoom License Info", false);
        }
        setIsLoading(false);
    }

    const columns = columnsMethod(handleShow, handleDelete, setReassign, handleRegenerateToken);

    return (
        <PageContainer>
            <Spin spinning={isLoading}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={intl.formatMessage({
                        id: 'pages.searchTable.titleUser',
                        defaultMessage: 'Zoom Licenses Management',
                    })}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                        labelWidth: 120,
                    }}
                    request={getAllZoomUsers}
                    columns={columns}
                    toolBarRender={() => [
                        <Button type="primary" key="primary" onClick={() => setAddLicense(true)}>
                            Add License
                        </Button>,
                        <Button type="primary" key="primary1" onClick={() => setGenerate(true)}>
                            Advanced Generates
                        </Button>,
                    ]
                    }
                />
            </Spin>
            <Drawer
                width={800}
                visible={show}
                title={`Zoom License ${show?.first_name} Details`}
                onClose={() => {
                    setShow(undefined);
                }}
                closable={true}
            >
                <Show data={show} />
            </Drawer>

            <Modal
                width={500}
                visible={addLicense}
                title={`Add New Zoom License`}
                onCancel={() => {
                    setAddLicense(false);
                }}
                footer={null}
                centered
            >
                <Add handleAddLicense={handleAddLicense} isLoading={isLoading} />
            </Modal>

            <Modal
                width={500}
                visible={reassign}
                title={`Reassign Zoom License`}
                onCancel={() => {
                    setReassign(false);
                }}
                footer={null}
                centered
            >
                <Reassign handleReassignLicense={handleReassignLicense} isLoading={isLoading} data={reassign} />
            </Modal>


            <Modal
                width={700}
                visible={generate}
                title={`Generate APIs`}
                onCancel={() => {
                    setGenerate(false);
                }}
                footer={null}
                centered
            >
                <Generate />
            </Modal>

        </PageContainer>
    );
};

export default TableList;
