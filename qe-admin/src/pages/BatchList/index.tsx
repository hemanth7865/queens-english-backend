// @ts-nocheck
import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { addRule, updateRule, removeRule, batches } from '@/services/ant-design-pro/api';
import 'antd/dist/antd.css';
import 'antd-button-color/dist/css/style.css';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    console.log('error', error);
    message.error('Delete failed, please try again', error);
    return false;
  }
};

const handleDelete = (entity) => {
  console.log(entity);
  const confirmDelete = window.confirm(`Do you want to delete ${entity.batchId} ?`);
  if (confirmDelete) {
    try {
      removeRule(entity);
    } catch (error) {
      message.error('Delete failed, please try again');
    }
  }
};

const BatchList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  const [tempData, setTempData] = useState({});
  // const [deleteData, setDeleteData] = useState();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: <FormattedMessage id="pages.searchTable.titledates" defaultMessage="Date" />,
      dataIndex: 'dates',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.batchId" defaultMessage="Batch ID" />,
      dataIndex: 'batchId',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleCreatedBy" defaultMessage="Created By" />,
      dataIndex: 'createdBy',
    },
    //Teacher row
    {
      title: <FormattedMessage id="pages.searchTable.titleTeacher" defaultMessage="Teacher" />,
      dataIndex: 'teacher',
      valueType: 'textarea',
    },
    //Students row
    {
      title: <FormattedMessage id="pages.searchTable.titleStudents" defaultMessage="Student" />,
      dataIndex: 'students',
      valueType: 'textarea',
    },
    //Time slot
    {
      title: <FormattedMessage id="pages.searchTable.titleTimeSlot" defaultMessage="Time Slot" />,
      dataIndex: 'timeSlot',
      valueType: 'textarea',
    },
    //button
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <Button type="success">
              <FormattedMessage
                id="pages.searchTable.nameStatus.upcoming"
                defaultMessage="Upcoming"
                status="Success"
              />
            </Button>
          ),
        },
        1: {
          text: (
            <Button type="warning">
              <FormattedMessage
                id="pages.searchTable.nameStatus.ongoing"
                defaultMessage="Ongoing"
                status="Processing"
              />
            </Button>
          ),
        },
        2: {
          text: (
            <Button type="lightdark">
              <FormattedMessage
                id="pages.searchTable.nameStatus.completed"
                defaultMessage="Completed"
                status="Default"
              />
            </Button>
          ),
        },
        3: {
          text: (
            <Button type="danger">
              <FormattedMessage
                id="pages.searchTable.nameStatus.cancelled"
                defaultMessage="Cancelled"
                status="Error"
              />
            </Button>
          ),
        },
      },
    },
    //view
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.view.nameLabel" defaultMessage="view" />
      ),
      dataIndex: 'view',
      tip: 'The rule name is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
              setTempData(entity);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.updateForm.titleedit" defaultMessage="edit" />,
      dataIndex: 'edit',
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.titledelete" defaultMessage="delete" />
      ),
      dataIndex: 'delete',
      tip: 'The rule name is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              // console.log(entity);
              setCurrentRow(entity);
              handleDelete(entity);
              console.log('currentrow', currentRow);
            }}
          >
            delete
          </a>
        );
      },
    },
  ];

  const handleSwitch = (number) => {
    switch (number) {
      case 0:
        return <Button type="success">Upcoming</Button>;
      case 1:
        return <Button type="warning">Ongoing</Button>;
      case 2:
        return <Button type="lightdark">Completed</Button>;
      case 3:
        return <Button type="danger">Cancelled</Button>;
    }
  };

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={batches}
        columns={columns}
        //the checkbox
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
            console.log(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              console.log(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button type="primary">
            <FormattedMessage
              id="pages.searchTable.batchApproval"
              defaultMessage="Batch approval"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
          defaultMessage: 'New rule',
        })}
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.RuleListItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.ruleName"
                  defaultMessage="Rule name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {/* {console.log(tempData)} */}
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
        <h2>{tempData.batchId}</h2>
        <p>Date - {tempData.dates}</p>
        <p>Created By - {tempData.createdBy}</p>
        <p>Assigned Teacher - {tempData.teacher}</p>
        <p>student - {tempData.students}</p>
        <p>Time Slot - {tempData.timeSlot}</p>
        <p>
          {/* Status - {tempData.status == 0 ? <button>success</button> : <button>upcoming</button>} */}
          switch - {handleSwitch(tempData.status)}
        </p>
      </Drawer>
    </PageContainer>
  );
};

export default BatchList;
