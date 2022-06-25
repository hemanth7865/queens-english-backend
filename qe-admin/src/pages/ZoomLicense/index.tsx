import { Button, Drawer, Spin, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllZoomUsers, getZoomUser, deleteZoomUser, addZoomUser } from '@/services/ant-design-pro/api';
import Show from './Components/Show';
import Add from './Components/Add';
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

    const [isLoading, setIsLoading] = useState(false);


    const intl = useIntl();

    const handleDelete = async (data: any) => {
        if (confirm("Are you sure delete zoom user license ?")) {
            try {
                const msg = await deleteZoomUser(data.id);
                if (!(msg?.deleted > 0)) {
                    throw new Error("Failed To Deleted");
                }
                handleAPIResponse(msg, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            }
        }
        actionRef.current?.reload();
    }

    const handleAddLicense = async (id: string) => {
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

    const columns = columnsMethod(handleShow, handleDelete);

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
                        </Button>
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

            {/* <Modal
                title={isWhatsappVisible ? "WA Message" : "Edit"}
                visible={isModalVisible}
                footer={null}
                centered
                onCancel={closeModal}
                width={700}
            >
                <FormUser
                    data={tempData}
                    visible={visibleEdit}
                    setVisible={setVisibleEdit}
                    isAmountDisplay={isAmountDisplay}
                    netbankingVisible={netbankingVisible}
                    autodebitVisible={autodebitVisible}
                    isWhatsappVisible={isWhatsappVisible}
                    isModalVisible={setIsModalVisible}
                    actionRef={actionRef}
                    setIsAmountDisplay={setIsAmountDisplay}
                    regenerateLink={regenerateLink}
                />
            </Modal> */}
        </PageContainer>
    );
};

export default TableList;
