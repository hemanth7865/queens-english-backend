// @ts-nocheck
import { PlusOutlined} from '@ant-design/icons';
import {
  Button,
  message,
  Input,
  Drawer,
  Form,
  Col,
  Row,
  Select,
  DatePicker,
  Modal,
  Checkbox,
  TimePicker,
  // Popover,
  // Upload,
  // Descriptions,
} from 'antd';
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
import {
  // rule,
  addRule,
  updateRule,
  removeRule,
  teacherBatches,
} from '@/services/ant-design-pro/api';

import Icon from '@ant-design/icons';
import './index.css';
import Availability from './availability';
import moment from 'moment';
import WeekdaySchedule from './components/WeekdaySchedule'

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
    message.error('Delete failed, please try again');
    return false;
  }
};

const TeacherBatchList: React.FC = () => {
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
  //teacher side show - add
  const [visible, setVisible] = useState<boolean>(false);

  //multi drawer - edit
  // const [childrenDrawer, setchildrenDrawer] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  //form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    joiningDate: '',
    email: '',
    address: '',
    startDate: '',
    dateOfBirth: '',
    gender: '',
    mobile: '',
    whatsapp: '',
    nationality: '',
    category: '',
    education: '',
    experience: '',
    teacherType: '',
    languagesKnown: '',
    resume: '',
    videoProfile: '',
    certificate: '',
    photo: '',
    weekAvailabilty: '',
    weekendAvailabilty: '',
    status: '',
    error: {},
  });
  const [tempData, setTempData] = useState({});
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  //add drawer
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  //edit drawer

  // const showChildrenDrawer = () => {
  //   setchildrenDrawer(true);
  // };

  // const onChildrenDrawerClose = () => {
  //   setchildrenDrawer(false);
  // };
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    //date
    {
      title: <FormattedMessage id="pages.searchTable.titleDate" defaultMessage="Date" />,
      dataIndex: 'date',
    },
    //teacher name
    {
      title: <FormattedMessage id="pages.searchTable.titleName" defaultMessage="Name" />,
      dataIndex: 'name',
    },
    //mobile number
    {
      title: <FormattedMessage id="pages.searchTable.titlemobileno" defaultMessage="Mobile" />,
      dataIndex: 'mobile',
    },
    //experience
    {
      title: (
        <FormattedMessage id="pages.searchTable.titleExperience" defaultMessage="Experience" />
      ),
      dataIndex: 'experience',
    },
    //status
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.active" defaultMessage="active" />
          ),
          status: 'active',
        },
        1: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.leave" defaultMessage="leave" />,
          status: 'leave',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.onhold" defaultMessage="on hold" />
          ),
          status: 'on hold',
        },
      },
    },
    //classes taken
    {
      title: (
        <FormattedMessage id="pages.searchTable.titleClassesTaken" defaultMessage="Classes Taken" />
      ),
      dataIndex: 'classesTaken',
    },
    //ratings
    {
      title: <FormattedMessage id="pages.searchTable.titleRatings" defaultMessage="Ratings" />,
      dataIndex: 'ratings',
    },
    //view
    {
      title: <FormattedMessage id="pages.searchTable.titleView" defaultMessage="view" />,
      // dataIndex: 'view',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
              setTempData(entity);
            }}
          >
            view
          </a>
        );
      },
    },
  ];

  // const handleAddTeacher = (str) => {
  //   console.log(str);
  // };

  const handleFormChange = (e) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
    // console.log('input one');
  };

  //validations

  const handleFormSubmit = () => {
    console.log('form submitted');
    const dataForm = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      address: formData.address,

      startDate: formData.startDate,
      dob: formData.dateOfBirth,
      gender: formData.gender,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      nationality: formData.nationality,
      category: formData.category,
      teacherType: formData.teacherType,
      languages: formData.languagesKnown,
      photo: formData.photo,
      weekAvailabilty: formData.weekAvailabilty,
      weekendAvailabilty: formData.weekendAvailabilty,
      status: formData.status,
      lead: {
        resume: formData.resume,
        video: formData.videoProfile,
        certificates: formData.certificate,
        totalexperience: formData.experience,
        qualification: formData.education,
        joiningDate: formData.joiningDate,
      },
    };

    //   "nationality": 1,
    //   "statusId": 1,
    //   "nationalityId": 1,
    //   "category": 1,
    //   "lead_type": 1,
    //   "photo":"photo",
    //   "created_at": "2021-11-05 15:14:04",
    //   "updated_at": "2021-11-05 15:14:04",
    //   "lead": {
    //     "resume": "data.resume",
    //   "qualification": "dataqualification",
    //   "totalexperiance": "data.totalexperiance",
    //       "video": "data.vide",
    //   "certificates": "data.certificates",
    //    "created_at": "2021-11-05 15:14:04",
    //   "updated_at": "2021-11-05 15:14:04",
    //    "joiningdate": "2021-11-05 15:14:04"
    //   },
    console.log('formData', formData);
    console.log('dataForm', dataForm);
    const dataFormJson = JSON.stringify(dataForm);
    console.log('json', dataFormJson);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <PageContainer>
      {/* {console.log('teacherbatches', teacherBatches)} */}
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
        request={teacherBatches}
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={showDrawer}>
            <PlusOutlined />{' '}
            {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
            Add Teacher
          </Button>,
          <Drawer
            title="Add Teacher"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={520}
          >
            <Form onFinish={handleFormSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="first name" rules={[{ required: true, message: 'First name' }]}>
                    <Input
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="last Name" rules={[{ required: true, message: 'last Name' }]}>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* joining and start date */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="joiningDate"
                    rules={[{ required: true, message: 'Joining Date' }]}
                  >
                    {/* <DatePicker
                      title="joiningDate"
                      placeholder="Joining Date"
                      style={{ width: '100%' }}
                      onChange={(date, dateString) => handleDatePickerChange1(date, dateString, 1)}
                    /> */}
                    <Input
                      placeholder="Joining Date"
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="startDate" rules={[{ required: true, message: 'Start Date' }]}>
                    {/* <DatePicker
                      title="formData.startDate"
                      placeholder="Start Date"
                      style={{ width: '100%' }}
                      value={formData.startDate}
                      onChange={(date, dateString) => handleDatePickerChange2(date, dateString, 1)}
                    /> */}
                    <Input
                      placeholder="Start Date"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Date of Birth and gender */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="dateOfBirth"
                    rules={[{ required: true, message: 'Enter date of birthday' }]}
                  >
                    {/* <DatePicker
                      title="formData.startDate"
                      placeholder="Date of Birth"
                      style={{ width: '100%' }}
                      value={formData.startDate}
                      onChange={(date, dateString) => handleDatePickerChange3(date, dateString, 1)}
                    /> */}
                    <Input
                      placeholder="DateofBirth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    rules={[{ required: true, message: 'Please select an gender' }]}
                  >
                    <select
                      placeholder="Gender"
                      value={formData.gender}
                      name="gender"
                      onChange={handleFormChange}
                      style={{ width: '230px' }}
                      class="required"
                    >
                      <option value="gender">Gender</option>
                      {['Male', 'Woman', 'Not applicable'].map((i) => {
                        return (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                </Col>
              </Row>
              {/* Mobile and Whatsup */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="mobile"
                    rules={[{ required: true, message: 'Enter the mobile number' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="whatsApp"
                    rules={[{ required: true, message: 'Enter the whatsApp number' }]}
                  >
                    <Input
                      type="text"
                      placeholder="WhatsApp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Email and address */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" rules={[{ required: true, message: 'email' }]}>
                    <Input
                      type="text"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" rules={[{ required: true, message: 'address' }]}>
                    <Input
                      type="text"
                      placeholder="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Nationality and category */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="nationality"
                    rules={[{ required: true, message: 'Enter the Nationality' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    rules={[{ required: true, message: 'Enter the Category number' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Education/Qualification and total experience */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="qualification"
                    rules={[{ required: true, message: 'Enter the Education/Qualification' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Education/Qualification"
                      name="education"
                      value={formData.education}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="totalExperience"
                    rules={[{ required: true, message: 'Enter the Total Experience' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Total Experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Teacher Type and Language Known */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="teacherType"
                    rules={[{ required: true, message: 'Enter the Teacher Type' }]}
                  >
                    <select
                      placeholder="Teacher Type"
                      value={formData.teacherType}
                      name="teacherType"
                      onChange={handleFormChange}
                      style={{ width: '230px' }}
                    >
                      <option value="teacherType">Teacher Type</option>
                      {['native', 'not native'].map((i) => {
                        return (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="languageKnown"
                    rules={[{ required: true, message: 'Enter the Languages Known' }]}
                  >
                    <Input
                      type="text"
                      placeholder="Languages Known"
                      name="languagesKnown"
                      value={formData.languagesKnown}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* upload resume and upload video profile */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="uploadResume">
                    {/* <label>
                      <Input
                        type="file"
                        placeholder="Upload Resume"
                        name="resume"
                        value={formData.resume}
                        onChange={handleFormChange}
                        style={{ display: 'none' }}
                      />
                      Resume Upload
                    </label> */}
                    <input
                      type="file"
                      id="file"
                      class="inputfile"
                      value={formData.resume}
                      name="resume"
                      onChange={handleFormChange}
                    />
                    <label for="file">Upload Resume</label>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="videoProfile">
                    <input
                      type="file"
                      id="videoProfile"
                      class="inputfile"
                      value={formData.videoProfile}
                      name="videoProfile"
                      onChange={handleFormChange}
                    />
                    <label for="videoProfile">Upload Video Profile</label>
                  </Form.Item>
                </Col>
              </Row>
              {/* upload certificate and upload photo */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="uploadCertificate">
                    <input
                      type="file"
                      id="certificate"
                      class="inputfile"
                      value={formData.certificate}
                      name="certificate"
                      onChange={handleFormChange}
                    />
                    <label for="certificate">Upload Certificate</label>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="uploadPhoto">
                    <input
                      type="file"
                      id="photo"
                      class="inputfile"
                      value={formData.photo}
                      name="photo"
                      onChange={handleFormChange}
                    />
                    <label for="photo">Upload Photo</label>
                  </Form.Item>
                </Col>
              </Row>
              {/* Availability */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="availabiltyWeek">
                    <label>Week Availability</label>
                    <WeekdaySchedule weekday = {1}/>
                    <WeekdaySchedule weekday = {2}/>
                    <WeekdaySchedule weekday = {3}/>
                    <WeekdaySchedule weekday = {4}/>
                    <WeekdaySchedule weekday = {5}/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="availabiltyWeekend">
                  <label>Weekend Availability</label>
                  <WeekdaySchedule weekday = {6}/>
                  <WeekdaySchedule weekday = {7}/>
                  </Form.Item>
                </Col>
              </Row>
              {/* status */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    rules={[
                      {
                        required: true,
                        message: 'please enter Status',
                      },
                    ]}
                  >
                    <select
                      placeholder="Status"
                      value={formData.status}
                      name="status"
                      onChange={handleFormChange}
                      style={{ width: '230px' }}
                    >
                      <option value="status">Status</option>
                      {['active', 'onHold', 'leave'].map((i, j) => {
                        return (
                          <option key={i} value={j}>
                            {i}
                          </option>
                        );
                      })}
                    </select>
                  </Form.Item>
                </Col>
              </Row>
              <Input type="submit" value="Add Teacher" />
            </Form>
          </Drawer>,
        ]}
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
        {/* {currentRow?.name && (
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
        )} */}
        {/* <p>{formData.name}</p> */}
        {/* {console.log(currentRow)} */}
        {/* {console.log('tempData', tempData)} */}
        {/* <Descriptions title="User Info">
          <Descriptions.Item label="UserName">{tempData.name}</Descriptions.Item>
        </Descriptions> */}
        <Row>
          {/* PHOTO - {tempData.photo} */}
          <Col span={10}>PHOTO</Col>
          <Col span={14}>
            <p>Name : {tempData.name}</p>
            <p>Joining Date : {tempData.joiningDate}</p>
            <p>Start Date : {tempData.startDate}</p>
            <p>Gender : {tempData.gender}</p>
            <p>Mobile : {tempData.mobile}</p>
            <p>WhatsApp : {tempData.whatsApp}</p>
            <p>Email : {tempData.email}</p>
            <p>Address : {tempData.address}</p>
            <p>Nationality : {tempData.nationality}</p>
            <p>Category : {tempData.category}</p>
            <p>Gender : {tempData.gender}</p>
            <p>Education : {tempData.education}</p>
            <p>Experience : {tempData.experience}</p>
            <p>Teacher Type : {tempData.teacherType}</p>
            <p>Languages Known : {tempData.languageKnown}</p>
            <p>Resume</p>
            <p>Video Profile</p>
            <p>Certificates</p>
            <p>Availabilty During the Week</p>
            <p>Availabilty During the Weekend</p>
            <p>Status : {tempData.status}</p>
          </Col>
        </Row>

        {/* <Drawer
          title="Edit Teacher"
          width={420}
          closable={false}
          onClose={onChildrenDrawerClose}
          visible={childrenDrawer}
        >
          Edit Teacher here
        </Drawer> */}
        <Button type="primary" key="primary" onClick={showDrawer}>
          {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
          Edit Teacher
        </Button>
        <Drawer
          title="Add Teacher"
          placement="right"
          onClose={onClose}
          visible={visible}
          width={520}
        >
          <form onSubmit={handleFormSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="first name" rules={[{ required: true, message: 'First name' }]}>
                  Name:
                  <Input
                    type="text"
                    placeholder={('name: ', tempData.name)}
                    name="firstName"
                    // value={formData.firstName}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="first name" rules={[{ required: true, message: 'First name' }]}>
                  Name:
                  <Input
                    type="text"
                    placeholder={tempData.name}
                    name="lastName"
                    // value={formData.lastName}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* joining and start date */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="joiningDate" rules={[{ required: true, message: 'Joining Date' }]}>
                  JoiningDate
                  <DatePicker
                    title="joiningDate"
                    placeholder={tempData.joiningDate}
                    style={{ width: '100%' }}
                    // onChange={(date, dateString) => handleDatePickerChange1(date, dateString, 1)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="startDate" rules={[{ required: true, message: 'Start Date' }]}>
                  Start Date:
                  <DatePicker
                    title="formData.startDate"
                    placeholder={tempData.startDate}
                    style={{ width: '100%' }}
                    // value={formData.startDate}
                    // onChange={(date, dateString) => handleDatePickerChange2(date, dateString, 1)}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* Date of Birth and gender */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Enter date of birthday' }]}
                >
                  Date Of Birth:
                  <DatePicker
                    title="formData.startDate"
                    placeholder="Date of Birth"
                    style={{ width: '100%' }}
                    // value={formData.startDate}
                    // onChange={(date, dateString) => handleDatePickerChange3(date, dateString, 1)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  rules={[{ required: true, message: 'Please select an gender' }]}
                >
                  Gender:
                  <Select placeholder={tempData.gender}>
                    <Option value="male">Male</Option>
                    <Option value="woman">woman</Option>
                    <Option value="not applicable">not applicable</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {/* Mobile and Whatsup */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="mobile"
                  rules={[{ required: true, message: 'Enter the mobile number' }]}
                >
                  Mobile:
                  <Input
                    type="text"
                    placeholder={tempData.mobile}
                    name="mobile"
                    // value={formData.mobile}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="whatsApp"
                  rules={[{ required: true, message: 'Enter the whatsApp number' }]}
                >
                  WhatsApp:
                  <Input
                    type="text"
                    placeholder={tempData.whatsApp}
                    name="whatsapp"
                    // value={formData.whatsapp}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* Nationality and category */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nationality"
                  rules={[{ required: true, message: 'Enter the Nationality' }]}
                >
                  Nationality:
                  <Input
                    type="text"
                    placeholder={tempData.nationality}
                    name="nationality"
                    // value={formData.nationality}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  rules={[{ required: true, message: 'Enter the Category number' }]}
                >
                  Category:
                  <Input
                    type="text"
                    placeholder={tempData.category}
                    name="category"
                    // value={formData.category}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* Education/Qualification and total experience */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="qualification"
                  rules={[{ required: true, message: 'Enter the Education/Qualification' }]}
                >
                  Education/Qualification:
                  <Input
                    type="text"
                    placeholder={tempData.education}
                    name="education"
                    // value={formData.education}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalExperience"
                  rules={[{ required: true, message: 'Enter the Total Experience' }]}
                >
                  Experience:
                  <Input
                    type="text"
                    placeholder={tempData.experience}
                    name="experience"
                    // value={formData.experience}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* Teacher Type and Language Known */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="teacherType"
                  rules={[{ required: true, message: 'Enter the Teacher Type' }]}
                >
                  Teacher Type:
                  <Input
                    type="text"
                    placeholder={tempData.teacherType}
                    name="teacherType"
                    // value={formData.teacherType}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="languageKnown"
                  rules={[{ required: true, message: 'Enter the Languages Known' }]}
                >
                  Languages Known:
                  <Input
                    type="text"
                    placeholder={tempData.languagesKnown}
                    name="languagesKnown"
                    // value={formData.languagesKnown}
                    // onChange={handleFormChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* upload resume and upload video profile */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="uploadResume"
                  rules={[{ required: true, message: 'Enter the Upload Resume' }]}
                >
                  <label>
                    <Input
                      type="file"
                      placeholder="Upload Resume"
                      name="resume"
                      // value={formData.resume}
                      // onChange={handleFormChange}
                      // style={{ display: 'none' }}
                    />
                    Resume Upload
                  </label>

                  {/* <Form.Item name="uploadResume" valuePropName="fileList">
                    <Upload name="logo" action="/upload.do">
                      <Button name="resume" value={formData.resume} onChange={handleFormChange}>
                        Upload Resume
                      </Button>
                    </Upload>
                  </Form.Item> */}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="videoProfile"
                  rules={[{ required: true, message: 'Enter the Upload Video Profile' }]}
                >
                  <Input placeholder="Upload Video Profile" />
                </Form.Item>
              </Col>
            </Row>
            {/* upload certificate and upload photo */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="uploadCertificate"
                  rules={[{ required: true, message: 'Enter the Upload Certificate' }]}
                >
                  <Input placeholder="Upload Certificate" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="uploadPhoto"
                  rules={[{ required: true, message: 'Enter the Upload Photo' }]}
                >
                  <Input placeholder="Upload Photo" />
                </Form.Item>
              </Col>
            </Row>
            {/* Availability */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="availabiltyWeek"
                  rules={[{ required: true, message: 'Enter the Availabilty During the Week' }]}
                >
                  <Input placeholder="Availabilty During the Week" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="availabiltyWeekend"
                  rules={[{ required: true, message: 'Enter the Availabilty During the Week' }]}
                >
                  <Input placeholder="Availabilty During the Week" />
                </Form.Item>
              </Col>
            </Row>
            {/* status */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  rules={[
                    {
                      required: true,
                      message: 'please enter Status',
                    },
                  ]}
                >
                  Status:
                  <select
                    placeholder={tempData.status}
                    // value={formData.value}
                    // name="value"
                    // onChange={handleFormChange}
                  >
                    <option value="active">Active</option>
                    <option value="onHold">On Hold</option>
                    <option value="leave">Leave</option>
                  </select>
                </Form.Item>
              </Col>
            </Row>
            {/* <Button onClick={onClose} type="primary" block>
  Add Teacher
</Button> */}
            <Row gutter={16}>
              <Col span={12}>
                <Button type="primary">Save Changes</Button>
              </Col>
              <Col span={12}>
                <Button type="primary">Delete Teacher</Button>
              </Col>
            </Row>
          </form>
        </Drawer>
      </Drawer>
    </PageContainer>
  );
};

export default TeacherBatchList;
