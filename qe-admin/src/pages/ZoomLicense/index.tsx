import { EditTwoTone, WhatsAppOutlined, LinkOutlined, MoneyCollectTwoTone, PlusSquareTwoTone, ReloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Popover, Typography, Spin, Select } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllZoomUsers, regeneratePaymentLink, refreshRazorpayStatus } from '@/services/ant-design-pro/api';
import FormUser from './Components/FormUser';
import RazorpayDetails from './Components/RazorpayDetails';
import moment from 'moment';
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
    const [currentRow, setCurrentRow] = useState<API.RuleListItem>();

    const [visible, setVisible] = useState<boolean>(false);
    const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
    const [tempData, setTempData] = useState();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isWhatsappVisible, setIsWhatsappVisible] = useState(false);
    const [isAmountDisplay, setIsAmountDisplay] = useState(false);
    const [displayRazorpay, setDisplayRazorpay] = useState(false);
    const [otherPayment, setOtherPayment] = useState(false);
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

    const columns = columnsMethod(handleRefreshStatus);

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
                width={600}
                visible={displayRazorpay}
                title="Razorpay details"
                onClose={() => {
                    setCurrentRow('');
                    setDisplayRazorpay(false);
                }}
                closable={true}
            >
                <RazorpayDetails data={currentRow} />
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
