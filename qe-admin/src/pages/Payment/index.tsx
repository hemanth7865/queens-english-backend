import { EditTwoTone, WhatsAppOutlined, LinkOutlined, MoneyCollectTwoTone, PlusSquareTwoTone } from '@ant-design/icons';
import { Button, Drawer, Modal, Popover } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllPayment } from '@/services/ant-design-pro/api';
import FormUser from './Components/FormUser';
import Whatsapp from './Components/Whatsapp';
import RazorpayDetails from './Components/RazorpayDetails';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

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


    const intl = useIntl();

    const closeModal = () => {
        setIsModalVisible(false);
        setIsWhatsappVisible(false);
        setVisible(false);
        setIsAmountDisplay(false);
        setAutodebitVisible(false);
        setNetbankingVisible(false);
    }

    const handleVisibleChange = (newVisible: boolean) => {
        setOtherPayment(newVisible);
    };

    const columns: ProColumns<API.RuleListItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStudentID"
                    defaultMessage="studentId"
                />
            ),
            dataIndex: 'studentId',
            fixed: 'left',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleRMN"
                    defaultMessage="student RMN"
                />
            ),
            dataIndex: 'phoneNumber',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleActualStartDate"
                    defaultMessage="Actual Start Date"
                />
            ),
            dataIndex: 'ActualStartDate',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStartDate"
                    defaultMessage="Start Date"
                />
            ),
            dataIndex: 'StartDate',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleEndDate"
                    defaultMessage="End Date"
                />
            ),
            dataIndex: 'EndDate',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStatus"
                    defaultMessage="Student status"
                />
            ),
            dataIndex: 'status',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleDueDate"
                    defaultMessage="Due Date"
                />
            ),
            dataIndex: 'dueDate',
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
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleCollectionExpertName"
                    defaultMessage="Collection Expert Name"
                />
            ),
            dataIndex: 'CollectionExpertName',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleNotes"
                    defaultMessage="Notes"
                />
            ),
            dataIndex: 'feedBackCall',
            hideInSearch: true,
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
            width: 150,
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
                            style={{ marginLeft: 10 }}>
                            <WhatsAppOutlined title='whatsapp' />
                        </a>
                        <a
                            style={{ marginLeft: 10 }}>
                            <LinkOutlined title='Regenerate Link' />
                        </a>
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
                    </div>
                );
            },
        },
    ];

    return (
        <PageContainer>
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
                    x: 1500,
                }}
            />

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



            {/* Drawer for Edit student */}
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
                />
            </Modal>
        </PageContainer>
    );
};

export default TableList;
