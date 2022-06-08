import { PlusOutlined, ClockCircleOutlined, EyeOutlined, EditTwoTone, WhatsAppOutlined } from '@ant-design/icons';
import { NotificationInstance as RCNotificationInstance } from 'rc-notification/lib/Notification';
import { Button, message, Input, Drawer, Tooltip, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { FormValueType } from './components/UpdateForm';
import { studentBatches, userBatchesView } from '@/services/ant-design-pro/api';
import FormUser from './Components/FormUser';
import Whatsapp from './Components/Whatsapp';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const TableList: React.FC = () => {
    /**
     * @en-US Pop-up window of new window
     * @zh-CN 新建窗口的弹窗
     *  */
    const [createModalVisible, handleModalVisible] = useState<boolean>(false);
    /**
     * @en-US The pop-up window of the distribution update window
     * @zh-CN 分布更新窗口的弹窗
     * */
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
    const [currentRowEdit, setCurrentRowEdit] = useState();

    const [visible, setVisible] = useState<boolean>(false);
    const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
    const [tempData, setTempData] = useState();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isWhatsappVisible, setIsWhatsappVisible] = useState(false);

    /**
     * @en-US International configuration
     * @zh-CN 国际化配置
     * */
    const intl = useIntl();

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const handleOneDisplay = async (id) => {
        try {
            let msg = await userBatchesView(id);
            if (msg.status === "ok") {
                console.log("API call successfull", msg);
            }
            setTempDataEdit(msg.data);
            console.log('view one', msg);
        } catch (error) {
            console.log("error", error);
        }
    }


    const columns: ProColumns<API.RuleListItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleStudentID"
                    defaultMessage="student ID"
                />
            ),
            dataIndex: 'studentID',
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
            dataIndex: 'DueDate',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentRs"
                    defaultMessage="Installment Rs"
                />
            ),
            dataIndex: 'InstallmentRs',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleCallDisposition"
                    defaultMessage="Call Disposition"
                />
            ),
            dataIndex: 'CallDisposition',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleRazorpayLink"
                    defaultMessage="Razorpay Link"
                />
            ),
            dataIndex: 'RazorpayLink',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentStatus"
                    defaultMessage="Installment Status"
                />
            ),
            dataIndex: 'InstallmentStatus',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleInstallmentCollected"
                    defaultMessage="Installment Collected"
                />
            ),
            dataIndex: 'InstallmentCollected',
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titlePaidDate"
                    defaultMessage="Paid Date"
                />
            ),
            dataIndex: 'PaidDate',
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
            dataIndex: 'Notes',
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.titleedit"
                    defaultMessage="Edit"
                />
            ),
            dataIndex: "edit",
            hideInSearch: true,
            fixed: 'right',
            width: 80,
            render: (dom, entity) => {
                return (
                    <div>
                        <a
                            onClick={() => {
                                setTempData(entity);
                                setIsModalVisible(true);
                            }}
                            style={{ marginLeft: 10 }}>
                            <EditTwoTone />
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
                    defaultMessage: 'User Management',
                })}
                actionRef={actionRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                request={studentBatches}
                columns={columns}
                scroll={{
                    x: 1500,
                }}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                        onClick={showDrawer}
                    >
                        Add User
                    </Button>,
                    <Drawer
                        title="Add User"
                        placement="right"
                        onClose={onClose}
                        visible={visible}
                        width={500}
                    >
                        {/* <AddUser setVisible={setVisible} /> */}
                    </Drawer>
                ]}
            />

            {/* Drawer for Edit student */}
            <Modal
                title={isWhatsappVisible ? "WA Message" : "Edit"}
                visible={isModalVisible}
                footer={null}
                centered
                onCancel={() => { setIsModalVisible(false) }}
                width={700}
            >
                {isWhatsappVisible ?
                    <Whatsapp data={tempData} visible={visibleEdit} setVisible={setVisibleEdit} /> :
                    <FormUser data={tempData} visible={visibleEdit} setVisible={setVisibleEdit} />
                }
            </Modal>
        </PageContainer>
    );
};

export default TableList;
