import { EditTwoTone, WhatsAppOutlined, LinkOutlined, MoneyCollectTwoTone, PlusSquareTwoTone, ReloadOutlined, EyeOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { Button, Drawer, Modal, Popover, Typography, Spin, Select, DatePicker, message } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllPayment, regeneratePaymentLink, refreshRazorpayStatus } from '@/services/ant-design-pro/api';
import FormUser from './Components/FormUser';
import RazorpayDetails from './Components/RazorpayDetails';
import moment from 'moment';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import collectionAgents from "./../../../data/collection_agent.json";
import callDispositionStatus from "./../../../data/call_disposition.json";
import { PaymentConstantValues } from '@/components/Constants/constants';
import "./payment.css"


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

    const { RangePicker } = DatePicker;

    const whatsappLinkSentFilter = {
        Yes: { text: 'Yes', whatsAppLinkSent: 'Yes' },
        No: { text: 'No', whatsAppLinkSent: 'No' },
    };

    const installmentStatusFilter = {
        'Installment Pending': { text: 'Installment Pending', status: 'Installment Pending' },
        'Installment Paid': { text: 'Installment Paid', status: 'Installment Paid' },
    }

    const closeModal = () => {
        setIsModalVisible(false);
        setIsWhatsappVisible(false);
        setVisible(false);
        setIsAmountDisplay(false);
        setAutodebitVisible(false);
        setNetbankingVisible(false);
    }

    const messageForPaidStatus = () => {
        message.error({
            content: "Can't update a paid case",
            duration: 2,
            style: {
                fontSize: 'large'
            }
        })
    };

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

    const refreshStatus = async (data: any, refreshLink: boolean) => {
        try {
            const msg = await refreshRazorpayStatus(
                data.transactionId,
                data.referenceId,
                refreshLink
            );
            handleAPIResponse(msg, "Reloaded status Successfully", "Failed To Reloaded status", false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Reloaded status Successfully", "Failed To Reloaded status", false);
        }
    }


    const handleRegenerateLink = async (data: any) => {
        if (data.status == PaymentConstantValues.STATUSPENDING) {
            if (confirm("Are you sure to regenerate new razorpay link ?")) {
                setIsLoading(true);
                await regenerateLink(data);
                setIsLoading(false);
            }
            actionRef.current?.reload();
        } else {
            messageForPaidStatus();
        }

    }

    const handleRefreshStatus = async (data: any) => {
        if (confirm("Are you sure to refresh the installment status ?")) {
            await refreshStatus(data, false);
        }
        actionRef.current?.reload();
    }

    const handleVisibleChange = (newVisible: boolean) => {
        setOtherPayment(newVisible);
    };

    const columns: ProColumns<API.RuleListItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStudentID"
                    defaultMessage="Lead Id"
                />
            ),
            dataIndex: 'leadId',
            fixed: 'left',
            width: 250,
            render: (value: any, entity: any) => {
                let highlight: any = "";
                if (entity.paymentMode === PaymentConstantValues.PAYMENTMODE) {
                    highlight =
                        <InfoCircleTwoTone title='Payment Mode - Netbanking' />
                        ;
                }
                return <>
                    {value} {" "} {highlight}
                </>;
            }
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStudentName"
                    defaultMessage="student Name"
                />
            ),
            render: (dom, entity) => {
                return <p>{entity.firstName} {entity.lastName}</p>
            },
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleRMN"
                    defaultMessage="student RMN"
                />
            ),
            dataIndex: 'phoneNumber',
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleWhatsappNo"
                    defaultMessage="Whatsapp No"
                />
            ),
            dataIndex: 'whatsapp',
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleActualStartDate"
                    defaultMessage="Actual Start Date"
                />
            ),
            dataIndex: 'actualStartDate',
            valueType: 'date',
            width: 140,
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStartDate"
                    defaultMessage="Start Date"
                />
            ),
            dataIndex: 'startDate',
            valueType: 'date',
            width: 160,
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleDueDate"
                    defaultMessage="Due Date"
                />
            ),
            dataIndex: 'dueDate',
            width: 160,
            valueType: 'date',
            renderFormItem: (value) => {
                return <RangePicker format="YYYY-MM-DD" />;
            },
            search: {
                transform: (value: any) => {
                    return { dueDate: value };
                },
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentRs"
                    defaultMessage="Installment Rs"
                />
            ),
            dataIndex: 'emiAmount',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleCallDisposition"
                    defaultMessage="Call Disposition"
                />
            ),
            dataIndex: 'callDisposition',
            valueType: 'select',
            request: async () => callDispositionStatus,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titletReferenceID"
                    defaultMessage="Reference Id"
                />
            ),
            dataIndex: 'referenceId',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleSubscriptionId"
                    defaultMessage="Subscription Id"
                />
            ),
            dataIndex: 'subscriptionId',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleSubscriptionType"
                    defaultMessage="Subscription Type"
                />
            ),
            dataIndex: 'subscriptionType',
            renderFormItem: (value) => {
                return (
                    <Select >
                        <Option value="Monthly">Monthly</Option>
                        <Option value="Quarterly">Quarterly</Option>
                        <Option value="Auto Debit">Auto Debit</Option>
                    </Select>
                );
            },
            search: {
                transform: (value) => {
                    return { subscriptionType: value };
                },
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleRazorpayLink"
                    defaultMessage="Razorpay Link"
                />
            ),
            render: (dom, entity) => {
                return (
                    <a href={entity.razorpayLink} target="_blank">
                        {entity.razorpayLink}
                    </a>
                )
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentStatus"
                    defaultMessage="Installment Status"
                />
            ),
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: installmentStatusFilter,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentCollected"
                    defaultMessage="Installment Collected"
                />
            ),
            dataIndex: 'paidAmount',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titlePaidDate"
                    defaultMessage="Paid Date"
                />
            ),
            dataIndex: 'paidDate',
            width: 160,
            valueType: 'date',
            render: (dom, entity) => {
                return <p>{entity.paidDate != "NaN-NaN-NaN" && entity.paidDate != null ? moment.utc(entity.paidDate).format('YYYY-MM-DD') : '-'}</p>
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleCollectionExpertName"
                    defaultMessage="Collection Expert Name"
                />
            ),
            dataIndex: 'collectionAgent',
            valueType: 'select',
            request: async () => collectionAgents.map((i) => { return { value: i.id, label: i.firstName } })
        },

        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleWhatsapp"
                    defaultMessage="Whatsapp Link Sent"
                />
            ),
            dataIndex: 'whatsAppLinkSent',
            valueType: 'select',
            valueEnum: whatsappLinkSentFilter,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleNotes"
                    defaultMessage="Notes"
                />
            ),
            dataIndex: 'notes',
            hideInSearch: true,
            width: 200
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleedit"
                    defaultMessage="Operations"
                />
            ),
            dataIndex: "edit",
            hideInSearch: true,
            fixed: 'right',
            width: 240,
            tip: 'Paid cases are not editable',
            render: (dom, entity) => {
                return (
                    <div>
                        <a
                            onClick={() => {
                                setTempData(entity);
                                setIsModalVisible(true);
                            }}
                            style={{ marginLeft: 10 }}>
                            <EditTwoTone title='Edit' />
                        </a>
                        <a
                            onClick={() => {
                                setTempData(entity);
                                setIsModalVisible(true);
                                setIsWhatsappVisible(true);
                            }}
                            style={{ marginLeft: 10, marginRight: 10 }}>
                            <WhatsAppOutlined title='whatsapp' />
                        </a>
                        <Typography.Link onClick={() => handleRegenerateLink(entity)}>
                            <LinkOutlined title='Regenerate Link' />
                        </Typography.Link>
                        <a
                            onClick={() => {
                                setTempData(entity);
                                setIsModalVisible(true);
                                setIsAmountDisplay(true);
                            }}
                            style={{ marginLeft: 10, marginRight: 10 }}>
                            <MoneyCollectTwoTone title='Change Amount' />
                        </a>
                        <Popover
                            content={
                                <div>
                                    <Button
                                        onClick={() => {
                                            setAutodebitVisible(true);
                                            setOtherPayment(false);
                                            setTempData(entity);
                                            setIsModalVisible(true);
                                        }}
                                        style={{ marginRight: 10 }}
                                    >
                                        Auto debit
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setNetbankingVisible(true);
                                            setOtherPayment(false);
                                            setTempData(entity);
                                            setIsModalVisible(true);
                                        }}>Netbanking</Button><br />
                                </div>
                            }
                            title="Choose the mode of payment"
                            trigger="click"
                            //visible={otherPayment}
                            onVisibleChange={handleVisibleChange}
                            overlayStyle={{
                                width: "25vw"
                            }}
                            key={entity.studentId}
                        >
                            <PlusSquareTwoTone title='Other Payment' />
                        </Popover>
                        <Typography.Link onClick={() => handleRefreshStatus(entity)} style={{ marginLeft: 10 }}>
                            <ReloadOutlined title='Refresh Installment status' />
                        </Typography.Link>
                        <a
                            onClick={() => {
                                setDisplayRazorpay(true);
                                setCurrentRow(entity);
                            }}
                            style={{ marginLeft: 10 }}>
                            <EyeOutlined title='View details' />
                        </a>
                    </div>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <Spin spinning={isLoading}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={intl.formatMessage({
                        id: 'pages.searchTable.titleUser',
                        defaultMessage: 'Payment Management',
                    })}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                        labelWidth: 120,
                    }}
                    request={getAllPayment}
                    columns={columns}
                    scroll={{
                        x: 2500,
                    }}
                />
            </Spin>
            <Drawer
                width={600}
                visible={displayRazorpay}
                title="Payment details"
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
                    setNetbankingVisible={setNetbankingVisible}
                    regenerateLink={regenerateLink}
                    refreshStatus={refreshStatus}
                />
            </Modal>
        </PageContainer>
    );
};

export default TableList;
