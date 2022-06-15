import { EditTwoTone, WhatsAppOutlined, LinkOutlined, MoneyCollectTwoTone, PlusSquareTwoTone, ReloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Popover, Typography, Spin, Select } from 'antd';
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
        actionRef.current.reload();
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
            render: (dom, entity) => {
                return <p>{entity.phoneNumber}</p>
            },
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleActualStartDate"
                    defaultMessage="Actual Start Date"
                />
            ),
            render: (dom, entity) => {
                return <p>{moment.utc(entity.actualStartDate).format('YYYY-MM-DD')}</p>
            },
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
            dataIndex: 'StartDate',
            render: (dom, entity) => {
                const startDate = entity.startDate
                return <p>{moment.utc(startDate).format('YYYY-MM-DD')}</p>
            },
            width: 160,
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStudentStatus"
                    defaultMessage="Student status"
                />
            ),
            render: (dom, entity) => {
                return <p>{entity.status}</p>
            },
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
            renderFormItem: (value) => {
                return (
                    <Select>
                        <Option value="No response">No response</Option>
                        <Option value="Call back later">Call back later</Option>
                        <Option value="This Week">This Week</Option>
                        <Option value="This Month">This Month</Option>
                        <Option value="Want to Discontinue">Want to Discontinue</Option>
                        <Option value="Dormant">Dormant</Option>
                        <Option value="Payment after issue resolution">Payment after issue resolution</Option>
                        <Option value="Demands Leaves">Demands Leaves</Option>
                        <Option value="Exams in school">Exams in school</Option>
                        <Option value="Paid">Paid</Option>
                        <Option value="Fully Paid">Fully Paid</Option>
                        <Option value="Subscription Lost">Subscription Lost</Option>
                        <Option value="DNP">DNP</Option>
                        <Option value="On Leave">On Leave</Option>
                        <Option value="other">other</Option>
                    </Select>
                );
            },
            search: {
                transform: (value) => {
                    return { callDisposition: value };
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
                    <a
                        onClick={() => {
                            setCurrentRow(entity);
                            setDisplayRazorpay(true);
                        }}>
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
            renderFormItem: (value) => {
                return (
                    <Select>
                        <Option value="Installment Pending">Installment Pending</Option>
                        <Option value="Installment Paid">Installment Paid</Option>
                    </Select>
                );
            },
            search: {
                transform: (value) => {
                    return { status: value };
                },
            },
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
            renderFormItem: (value) => {
                return (
                    <Select>
                        {collectionAgents.map(i => (<Option value={i.id} key={i.id}>{i.firstName}</Option>))}
                    </Select>
                );
            },
            search: {
                transform: (value) => {
                    return { collectionAgent: value };
                },
            },
        },

        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleWhatsapp"
                    defaultMessage="Whatsapp Link Sent"
                />
            ),
            dataIndex: 'whatsAppLinkSent',
            renderFormItem: (value) => {
                return (
                    <Select>
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                    </Select>
                );
            },
            search: {
                transform: (value) => {
                    return { whatsAppLinkSent: value };
                },
            },
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
                                            setNetbankingVisible(true);
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
                                            setAutodebitVisible(true);
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
                        x: 1900,
                    }}
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
