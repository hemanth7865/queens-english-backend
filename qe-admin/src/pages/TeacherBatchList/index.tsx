// @ts-nocheck
import { PlusOutlined, DeleteOutlined, EyeOutlined, ClockCircleOutlined} from '@ant-design/icons';
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
  Tooltip
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
  addTeacherSchedule,
  teacherBatchesView,
  teacherRemove
} from '@/services/ant-design-pro/api';


import Icon from '@ant-design/icons';
import './index.css';
import Availability from './availability';
import moment from 'moment';
import WeekdaySchedule from './components/WeekdaySchedule'
import {parse, format} from 'date-fns'

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

  //multi drawer - edit
  // const [childrenDrawer, setchildrenDrawer] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
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
    leadAvailability: leadAvailabilities,
    status: '',
  });

 
  const [tempDataView, setTempDataView] = useState({});
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

  const showDrawerEdit = () => {
    setVisibleEdit(true);
  };
  const onCloseEdit = () => {
    setVisibleEdit(false);
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


const handleOneView = async (id) => {
  try {
    let msg = await teacherBatchesView(id, {headers: {
      'Content-Type': 'application/json',
    }});
    if (msg.status === 'ok') {
      console.log('API call sucessfull', msg)
    }
    setTempDataView(msg.data)
    console.log(msg)
  } catch (error) {
    console.log('error', error)
  }
};

// console.log('viewone', viewOne)
  console.log('tempdateview', tempDataView)
  const columns: ProColumns<API.RuleListItem>[] = [
    //date
    {
      title: <FormattedMessage id="pages.searchTable.titleDate" defaultMessage="Date" />,
      dataIndex: 'date',
      valueType: 'date',
     
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.exception',
                defaultMessage: 'Please enter the reason for the exception!',
              })}
            />
          );
        }
        return defaultRender(item);
      },
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
      dataIndex: 'totalexp',
    },
    //status
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.active" defaultMessage="Active" />
          ),
          status: 'active',
        },
        
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.onhold" defaultMessage="On Hold" />
          ),
          status: 'on hold',
        },
        3: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.leave" defaultMessage="In Active" />,
          status: 'in active',
        },
        4: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.leave" defaultMessage="Leave" />,
          status: 'on leave',
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
    //time slots
    {
      title: <FormattedMessage id="pages.searchTable.titleSlots" defaultMessage="Time Slots" />,
      dataIndex: 'slots',
      render: (dom, entity) => {
        return (
          <Tooltip title={dom}>
            <ClockCircleOutlined/>
          </Tooltip>
        );
      },
      renderFormItem: (value) => {
          
          return (
            
            <TimePicker.RangePicker  format = 'HH:mm' />
           
          )
        },
      search: {
        transform: (value: any) =>{
          console.log('val', value, parse(value[0], 'yyyy-MM-dd HH:mm:ss', new Date()).getHours())
          const start_slot = format(parse(value[0], 'yyyy-MM-dd HH:mm:ss', new Date()), 'H:mm')
          const end_slot = format(parse(value[1], 'yyyy-MM-dd HH:mm:ss', new Date()), 'H:mm')
            console.log('start_slot', start_slot)
            return { start_slot: start_slot, end_slot: end_slot }
          }
      },
    },
    //weekday
    {
      title: <FormattedMessage id="pages.searchTable.titleWeekday" defaultMessage="Weekday" />,
      dataIndex: 'weekday',
      hideInTable: true,

      
    },
    
    {
      title: <FormattedMessage id="pages.searchTable.titleView" defaultMessage="view" />,
      dataIndex: 'view',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log(entity)
              handleOneView(entity.leadId)
              setCurrentRow(entity);
              setShowDetail(true);
              // console.log(tempDataView)
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    }
    
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

  

  const handleFormSubmit = async () => {
    console.log('form submitted');
    const dataForm = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      dob: formData.dateOfBirth,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      whatsapp: formData.whatsapp,
      status: formData.status,
      gender: formData.gender,
      nationalityId: formData.nationality,
      category: formData.category,
      languages: formData.languagesKnownn,
      startDate: formData.startDate,
      lead_type: 1,
      photo: formData.photo,
      startDate: formData.startDate,
      lead:[{
        resume: formData.resume,
        qualification: formData.education,
        totalexp: formData.experience,
        video: formData.videoProfile,
        certificates: formData.certificate,
        joiningdate: formData.joiningDate,
        ratings: 1,
        classestaken: 10,
        lead_type: formData.teacherType,
      }],
      statusId: formData.status,
      leadAvailability: leadAvailabilities
    };
    // async (values: API.LoginParams) => {
      try {
        // 登录
        console.log('data', dataForm)
        const msg = await addTeacherSchedule(
          { headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(dataForm) }
          );
        if (msg.status === 'ok') {
          // const defaultLoginSuccessMessage = intl.formatMessage({
          //   id: 'pages.login.success',
          //   defaultMessage: '登录成功！',
          // });
          // message.success(defaultLoginSuccessMessage);
          // await fetchUserInfo();
          // /** 此方法会跳转到 redirect 参数所在的位置 */
          // if (!history) return;
          // const { query } = history.location;
          // const { redirect } = query as { redirect: string };
          // history.push(redirect || '/');
          // return;
          console.log('API call sucessfull', msg)
          
        }
        console.log(msg);
        // 如果失败去设置用户错误信息
        // setUserLoginState(msg);
      } catch (error) {
        console.log('addRule error', error);
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
      setVisible(false)
    // console.log('formData', formData);
    console.log('dataForm', dataForm);
    // const dataFormJson = JSON.stringify(dataForm);
    // console.log('json', dataFormJson);
  };

  const handleFormSubmitEdit = async ()=>{
    console.log('form submitted');
    const dataForm = {
      firstname: formData.firstName?formData.firstName:tempDataView.firstname,
      lastname: formData.lastName?formData.lastName:tempDataView.lastname,
      dob: formData.dateOfBirth?formData.dateOfBirth:tempDataView.dob,
      mobile: formData.mobile?formData.mobile:tempDataView.mobile,
      email: formData.email?formData.email:tempDataView.email,
      address: formData.address?formData.address:tempDataView.address,
      whatsapp: formData.whatsapp?formData.whatsapp:tempDataView.whatsapp,
      status: formData.status,
      gender: formData.gender?formData.gender:tempDataView.gender,
      nationality: formData.nationality?formData.nationality:tempDataView.nationalityId,
      category: formData.category?formData.category:tempDataView.category,
      languages: formData.languagesKnown?formData.languagesKnown:tempDataView.languages,
      startDate: formData.startDate?formData.startDate:tempDataView.startDate,
      lead_type: 1,
      photo: formData.photo,
      lead:[{
        resume: formData.resume,
        qualification: formData.education?formData.education:(tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
          return lead.qualification
        })),
        totalexp: formData.experience?formData.experience:(tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
          return lead.totalexp 
        })),
        video: formData.videoProfile,
        certificates: formData.certificate,
        joiningdate: formData.joiningDate?formData.joiningDate:(tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
          return lead.joiningdate
        })),
        ratings: 1,
        classestaken: 10,
        lead_type: formData.teacherType,
      }],
      
      statusId: formData.status,
      leadAvailability: leadAvailabilities?leadAvailabilities:(tempDataView.leadAvailability&&tempDataView.leadAvailability.map(function (lead, i) {
        return lead
      }))
    };
    // async (values: API.LoginParams) => {
      if (tempDataView) {
        dataForm.id = tempDataView.id;
        dataForm.lead.id = tempDataView.lead.id;
      }
      try {
        // 登录
        console.log('data', dataForm)
        const msg = await addTeacherSchedule(
          { headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(dataForm) }
          );
        if (msg.status === 'ok') {
         
          console.log('API call sucessfull', msg)
          
        }
        console.log(msg);
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
      } catch (error) {
        console.log('addRule error', error);
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
      setVisibleEdit(false)
    console.log('formData', formData);
  }

  let leadAvailabilities = []
  //lead availability
  const WeekdayAvailability = (props)=>{
    const [value, setValue] = useState(
      {
        start_slot: '',
        end_slot: ''
      }
    )

    const [value1, setValue1] = useState(
      {
      weekday: ''
      }
    )


    const leadWeekAvailability = {
      start_slot: value[0],
      end_slot: value[1],
      weekday: props.weekday,
      startDate: props.tempDataView
    }

    
    if(leadWeekAvailability.start_slot && leadWeekAvailability.end_slot && leadWeekAvailability.weekday){
      leadAvailabilities.push(leadWeekAvailability)
      
    }console.log('form', leadAvailabilities)

    return(
      <Row>
      <Col span={24} style = {{margin: "5px"}}>
        
        <Checkbox name = "weekday"  onChange = {e=>setValue1(props.weekday)} style = {{marginRight: "4px", marginLeft: "4px"}} >{props.week}</Checkbox>
        <TimePicker.RangePicker  format = 'HH:mm' style = {{width: "200px"}} onChange = {(time, timeString)=> {setValue(timeString)}} />
        <a><PlusOutlined style = {{marginRight: "4px", marginLeft: "4px"}}/></a>
        <a><DeleteOutlined /></a>        
         </Col>
    </Row>
      )
  }


  const deleteTeacher = async (id)=>{
    console.log('clicked delete teacher')
    try {
      let msg = await teacherRemove(id, {headers: {
        'Content-Type': 'application/json',
      }});
      if (msg.status === 'ok') {
        console.log('API call sucessfull', msg)
      }
      console.log(msg)
    } catch (error) {
      console.log('error', error)
    }
  }
  return (
    <PageContainer>
      {/* {console.log('teacherbatches', teacherBatches)} */}
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.titleTeacher',
          defaultMessage: 'Teacher Management',
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
            
            Add Teacher
          </Button>,
          <Drawer
            title="Add Teacher"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={780}
          >
            <Form onFinish={handleFormSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="first name" >
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
                  <Form.Item name="last Name" >
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
                  >
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
                  <Form.Item name="startDate" >
                    
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
                   
                  >
                    
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
                    
                  >
                    <select
                      placeholder="Gender"
                      value={formData.gender}
                      name="gender"
                      onChange={handleFormChange}
                      style={{ width: '348px', color: 'grey' }}
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
                  <Form.Item name="email" >
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
                  <Form.Item name="address" >
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
                    
                  >
                    <select
                      placeholder="Teacher Type"
                      value={formData.teacherType}
                      name="teacherType"
                      onChange={handleFormChange}
                      style={{ width: 348, color: 'grey' }}
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
                  {/* <Form.Item name="uploadCertificate"> */}
                    <input
                      type="file"
                      id="certificate"
                      class="inputfile"
                      value={formData.certificate}
                      name="certificate"
                      onChange={handleFormChange}
                    />
                    <label for="certificate">Upload Certificate</label>
                  {/* </Form.Item> */}
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
                  <Form.Item name="leadAvailability">
                    <label>Week Availability</label>
                    <WeekdayAvailability weekday = {1} week = "Monday" startDate = {tempDataView}/>
                    <WeekdayAvailability weekday = {2} week = "Tuesday"/>
                    <WeekdayAvailability weekday = {3} week = "Wednesday"/>
                    <WeekdayAvailability weekday = {4} week = "Thursady"/>
                    <WeekdayAvailability weekday = {5} week = "Friday"/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                  <label>Weekend Availability</label>
                  <WeekdayAvailability weekday = {6} week = "Saturday"/>
                  <WeekdayAvailability weekday = {7} week = "Sunday"/>
                  </Form.Item>
                </Col>
              </Row>
              {/* status */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    
                  >
                    <select
                      placeholder="Status"
                      value={formData.status}
                      name="status"
                      onChange={handleFormChange}
                      style={{ width: 350, color: 'grey' }}
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
              <Input type="submit" value="Add Teacher"  style = {{color: 'white', backgroundColor: 'DodgerBlue'}}/>
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
              <FormattedMessage id="pages.searchTable.item"  />
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
        closable={true}
      >
              <Row>
                <Col style={{fontWeight: 900, alignContent:'center', alignItems:'center'}}  span={24}>  
                <center><h2 style={{color:"blue"}}>View Teacher</h2></center>
                </Col>
              </Row>
                <Row style={{fontWeight: 500}} gutter={40, 60}>  
                  <Col span={7} >Photo</Col>
                  <Col span={6}>  
                  <p>Name</p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.firstname + ' ' + tempDataView.lastname}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Joining Date </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.joiningdate}</span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Start Date </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.startDate}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Date of Birth </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.dob}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Gender </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.gender}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Mobile </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.mobile}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>WhatsApp </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.whatsapp}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Email </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.email}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Address </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.address}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Nationality </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.nationalityId}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Category </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.category}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Gender </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.gender}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Education </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.qualification}</span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Experiance </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.totalexp + ' Years'} </span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Teacher Type </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                      switch (lead.teacherType) {
                                        case 1:
                                          return <div>{'Native'} </div>
                                        case 2:
                                          return <div>{'Non Native'} </div>
                                        default:
                                          return <div>{'Native'} </div>
                                      }
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Languages Known </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.languages}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Resume </p>
                  </Col>
                  <Col span={11}>  
                  <p> {tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.resume}</span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p> Video Profile </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.video}</span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Certificates </p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                                        return <span>{lead.Certificates}</span>
                                      })}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Availabilty During the Week</p>
                  </Col>
                  <Col span={11}>  
                  <p>{tempDataView.slots}</p>
                  </Col>
                  <Col span={7} ></Col>
                  <Col span={6}>  
                  <p>Status </p>
                  </Col>
                  <Col span={11}> 
                  <p>{tempDataView.statusId == 1? ( <div>{'Active'} </div>):(tempDataView.statusId == 2? (<div>{'OnHold'} </div>): (tempDataView.statusId == 3 ? (<div>{'In Active'} </div>):<div>{'Leave'} </div>))} 
                  </p>
                  </Col>
                  </Row><br/>
                  <Row>
                  <Col span={10}> 
                    
                  </Col>
                  <Col span={12}> 
                    <Button type="primary" onClick={showDrawerEdit}>
                      {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
                      Edit Teacher
                    </Button>
                  </Col>
                  
                  </Row>
              
        <Drawer
          title="Edit Teacher"
          placement="right"
          onClose={onCloseEdit}
          visible={visibleEdit}
          width={780}
        >
          {console.log('second', tempDataView)}
        <Form onFinish={handleFormSubmitEdit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item >
                    <Input
                      type="text"
                      // placeholder = "firstname"
                      placeholder={tempDataView.firstname}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="last Name" >
                    <Input
                      type="text"
                      placeholder = {tempDataView.lastname}
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
                    
                  >
                    
                    <Input
                      placeholder={tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                        return lead.joiningdate
                      })}
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="startDate" >
                    
                    <Input
                      placeholder={tempDataView.startDate}
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
                    
                  >
                    
                    <Input
                      placeholder={tempDataView.dob}
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
                  >
                    <select
                      placeholder={tempDataView.gender}
                      value={formData.gender}
                      name="gender"
                      onChange={handleFormChange}
                      style={{ width: '348px', color: 'grey' }}
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
                  >
                    <Input
                      type="text"
                      placeholder = {tempDataView.mobile}
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="whatsApp"
                  >
                    <Input
                      type="text"
                      
                      placeholder={tempDataView.whatsapp}
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
                  <Form.Item name="email" >
                    <Input
                      type="text"
                      placeholder={tempDataView.email}
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" >
                    <Input
                      type="text"
                      placeholder={tempDataView.address}
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
                  >
                    <Input
                      type="text"
                      placeholder={tempDataView.nationalityId}
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                  >
                    <Input
                      type="text"
                      placeholder={tempDataView.category}
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
                    
                  >
                    <Input
                      type="text"
                      placeholder={tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                        return lead.qualification
                      })}
                      name="education"
                      value={formData.education}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="totalExperience"
                  >
                    <Input
                      type="text"
                      placeholder = {tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                        return lead.totalexp
                      })}
                      // placeholder={tempDataView.lead.total_exp}
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
                   
                  >
                    <select
                      placeholder={tempDataView.lead&&tempDataView.lead.map(function (lead, i) {
                        switch (lead.teacherType) {
                          case 1:
                            return 'Native'
                          case 2:
                            return 'Non Native'
                          default:
                            return 'Native'
                        }
                        })}
                      value={formData.teacherType}
                      name="teacherType"
                      onChange={handleFormChange}
                      style={{ width: '348px' }}
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
                  >
                    <Input
                      type="text"
                      placeholder={tempDataView.languages}
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
                  {/* <Form.Item name="uploadCertificate"> */}
                    <input
                      type="file"
                      id="certificate"
                      class="inputfile"
                      value={formData.certificate}
                      name="certificate"
                      onChange={handleFormChange}
                    />
                    <label for="certificate">Upload Certificate</label>
                  {/* </Form.Item> */}
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
                  <Form.Item name="leadAvailability">
                    <label>Week Availability</label>
                    <WeekdayAvailability weekday = {1} week = "Monday"/>
                    <WeekdayAvailability weekday = {2} week = "Tuesday"/>
                    <WeekdayAvailability weekday = {3} week = "Wednesday"/>
                    <WeekdayAvailability weekday = {4} week = "Thursady"/>
                    <WeekdayAvailability weekday = {5} week = "Friday"/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                  <label>Weekend Availability</label>
                  <WeekdayAvailability weekday = {6} week = "Saturday"/>
                  <WeekdayAvailability weekday = {7} week = "Sunday"/>
                  
                  </Form.Item>
                </Col>
              </Row>
              {/* status */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    
                  >
                    <select
                      placeholder="Status"
                      value={formData.status}
                      name="status"
                      onChange={handleFormChange}
                      style={{ width: '348px', color: 'grey' }}
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
              <Row>
              <Col span = {12}>
              <Input type="submit" value="Save Changes" style = {{color: 'white', backgroundColor: 'DodgerBlue'}}/>
              </Col>
              <Col span = {12}>
              <Button onClick = {()=>{deleteTeacher(tempDataView.id)}} block type = "primary">Delete</Button>
              </Col>
              </Row>
              
            </Form>
        </Drawer>
      </Drawer>
    </PageContainer>
  );
};

export default TeacherBatchList;
