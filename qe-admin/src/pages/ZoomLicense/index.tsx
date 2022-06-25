import { Button, Drawer, Modal, Popover, Typography, Spin, Select } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllZoomUsers, getZoomUser, deleteZoomUser, regeneratePaymentLink, refreshRazorpayStatus } from '@/services/ant-design-pro/api';
import FormUser from './Components/FormUser';
import Show from './Components/Show';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { columns as columnsMethod } from "./columns";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const { Option } = Select

const TableList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [show, setShow] = useState<any>();

    const [visible, setVisible] = useState<boolean>(false);
    const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
    const [tempData, setTempData] = useState();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isWhatsappVisible, setIsWhatsappVisible] = useState(false);
    const [isAmountDisplay, setIsAmountDisplay] = useState(false);
    const [netbankingVisible, setNetbankingVisible] = useState(false);
    const [autodebitVisible, setAutodebitVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const intl = useIntl();

    const closeModal = () => {
        setIsModalVisible(false);
        setIsWhatsappVisible(false);
        setVisible(false);
        setIsAmountDisplay(false);
        setAutodebitVisible(false);
        setNetbankingVisible(false);
    }

    const regenerateLink = async (data: any) => {
        try {
            const msg = await regeneratePaymentLink({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ installmentId: data.transactionId }),
            });
            handleAPIResponse(msg, "Razorpay link generated  Successfully", "Failed To regenerate Razorpay link generated", false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Razorpay link generated  Successfully", "Failed To regenerate Razorpay link generated", false);
        }
    }

    const handleRegenerateLink = async (data: any) => {
        if (confirm("Are you sure to regenerate new razorpay link ?")) {
            setIsLoading(true);
            await regenerateLink(data);
            setIsLoading(false);
        }
        actionRef.current?.reload();
    }

    const handleRefreshStatus = async (data: any) => {
        if (confirm("Are you sure to refresh the installment status ?")) {
            try {
                const msg = await refreshRazorpayStatus(
                    data.transactionId,
                    data.referenceId,
                );
                handleAPIResponse(msg, "Reloaded status Successfully", "Failed To Reloaded status", false);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Reloaded status Successfully", "Failed To Reloaded status", false);
            }
        }
        actionRef.current?.reload();
    }

    const handleDelete = async (data: any) => {
        if (confirm("Are you sure delete zoom user license ?")) {
            try {
                const msg = await deleteZoomUser(data.id);
                handleAPIResponse(msg, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Deleted Zoom User License Successfully", "Failed To Delete User License", false);
            }
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
            </Modal>
        </PageContainer>
    );
};

export default TableList;
