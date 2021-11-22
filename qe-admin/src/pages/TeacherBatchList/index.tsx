// @ts-nocheck
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
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
  Tooltip,
  Upload,
  RangePicker,
  // Descriptions,
} from "antd";
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import type { FormValueType } from "./components/UpdateForm";
import UpdateForm from "./components/UpdateForm";
import {
  // rule,
  addRule,
  updateRule,
  removeRule,
  teacherBatches,
  addTeacherSchedule,
  teacherBatchesView,
  teacherRemove,
} from "@/services/ant-design-pro/api";

import Icon from "@ant-design/icons";
import "./index.css";
import Availability from "./availability";
import moment from "moment";
import WeekdaySchedule from "./components/WeekdaySchedule";
import { parse, format } from "date-fns";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading("正在添加");
  try {
    await addRule({ ...fields });
    hide();
    message.success("Added successfully");
    return true;
  } catch (error) {
    hide();
    message.error("Adding failed, please try again!");
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
  const hide = message.loading("Configuring");
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success("Configuration is successful");
    return true;
  } catch (error) {
    hide();
    message.error("Configuration failed, please try again!");
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
  const hide = message.loading("正在删除");
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success("Deleted successfully and will refresh soon");
    return true;
  } catch (error) {
    message.error("Delete failed, please try again");
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
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  //teacher side show - add

  //multi drawer - edit
  // const [childrenDrawer, setchildrenDrawer] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [editvisible, seteditvisible] = useState<boolean>(false);
  //form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    joiningDate: "",
    email: "",
    address: "",
    startDate: "",
    dateOfBirth: "",
    gender: "",
    mobile: "",
    whatsapp: "",
    nationality: "",
    category: "",
    education: "",
    experience: "",
    teacherType: "",
    languagesKnown: "",
    resume: "",
    videoProfile: "",
    certificate: "",
    photo: "",
    leadAvailability: null,
    status: "",
  });

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [tempDataView, setTempDataView] = useState({});

  //state for select option
  const [selectValue, setSelectValue] = useState("");
  const [selectTeacher, setSelectTeacher] = useState("");
  const [selectStatus, setSelectStatus] = useState("");

  //state for adding images
  const [uploadResume, setUploadResume] = useState();

  const [selectLead1, setSelectLead1] = useState([]);

  //state for adding datepicker
  const [dateJoining, setDateJoining] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateBirth, setDateOfBirth] = useState("");

  //add drawer
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
    seteditvisible(false);
  };

  const showDrawerEdit = () => {
    setVisibleEdit(true);
    seteditvisible(true);
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
      let msg = await teacherBatchesView(id, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setTempDataView(msg.data);
      console.log(msg);
    } catch (error) {
      console.log("error", error);
    }
  };

  // console.log('viewone', viewOne)
  // console.log('tempdateview', tempDataView)
  const columns: ProColumns<API.RuleListItem>[] = [
    //date
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDate"
          defaultMessage="Date"
        />
      ),
      dataIndex: "date",
      valueType: "date",
    },
    //teacher name
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleName"
          defaultMessage="Name"
        />
      ),
      dataIndex: "name",
    },
    //mobile number
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobileno"
          defaultMessage="Mobile"
        />
      ),
      dataIndex: "mobile",
    },
    //experience
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleExperience"
          defaultMessage="Experience"
        />
      ),
      dataIndex: "experience",
    },
    //status
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStatus"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      hideInForm: true,
      valueEnum: {
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.active"
              defaultMessage="Active"
            />
          ),
          status: "active",
        },

        2: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onhold"
              defaultMessage="On Hold"
            />
          ),
          status: "on hold",
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.leave"
              defaultMessage="In Active"
            />
          ),
          status: "in active",
        },
        4: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.leave"
              defaultMessage="Leave"
            />
          ),
          status: "on leave",
        },
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.leave"
              defaultMessage="Leave"
            />
          ),
          status: "on leave",
        },
      },
    },
    //classes taken
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleClassesTaken"
          defaultMessage="Classes Taken"
        />
      ),
      dataIndex: "classesTaken",
    },
    //ratings
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleRatings"
          defaultMessage="Ratings"
        />
      ),
      dataIndex: "ratings",
    },
    //time slots
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleSlots"
          defaultMessage="Time Slots"
        />
      ),
      dataIndex: "slots",
      render: (dom, entity) => {
        return (
          <Tooltip title={dom}>
            <ClockCircleOutlined />
          </Tooltip>
        );
      },
      renderFormItem: (value) => {
        return <TimePicker.RangePicker format="HH:mm" />;
      },
      search: {
        transform: (value: any) => {
          console.log(
            "val",
            value,
            parse(value[0], "yyyy-MM-dd HH:mm:ss", new Date()).getHours()
          );
          const start_slot = format(
            parse(value[0], "yyyy-MM-dd HH:mm:ss", new Date()),
            "H:mm"
          );
          const end_slot = format(
            parse(value[1], "yyyy-MM-dd HH:mm:ss", new Date()),
            "H:mm"
          );
          console.log("start_slot", start_slot);
          return { start_slot: start_slot, end_slot: end_slot };
        },
      },
    },
    //weekday
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleWeekday"
          defaultMessage="Weekday"
        />
      ),
      dataIndex: "weekday",
      hideInTable: true,
      valueEnum: {
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.monday"
              defaultMessage="Monday"
            />
          ),
          weekday: "monday",
        },

        2: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.tuesday"
              defaultMessage="Tuesday"
            />
          ),
          weekday: "tuesday",
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.wednesday"
              defaultMessage="Wednesday"
            />
          ),
          weekday: "wednesday",
        },
        4: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.thursday"
              defaultMessage="Thursday"
            />
          ),
          weekday: "thursday",
        },
        5: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.friday"
              defaultMessage="Friday"
            />
          ),
          weekday: "friday",
        },
        6: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.saturday"
              defaultMessage="Saturday"
            />
          ),
          weekday: "saturday",
        },
        7: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameweekday.sunday"
              defaultMessage="Sunday"
            />
          ),
          weekday: "sunday",
        },
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleView"
          defaultMessage="view"
        />
      ),
      dataIndex: "view",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log(entity);
              handleOneView(entity.leadId);
              setCurrentRow(entity);
              setShowDetail(true);
              // console.log(tempDataView)
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    },
  ];

  const handleFormChange = (e, value) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
    // console.log('input one');
  };

  const handleSelectChange = (value) => {
    console.log("status", value);
    setSelectValue(value);
  };

  const dateFormat = "HH:mm:ss";

  const propsUpload = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.file.name);
      }
      if (info.file.status === "done") {
        setUploadResume(info.file.name);
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleFormSubmit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      dob: dateBirth,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      whatsapp: formData.whatsapp,
      status: formData.status,
      gender: selectValue,
      nationalityId: formData.nationality,
      category: formData.category,
      languages: formData.languagesKnownn,
      startDate: dateStart,
      lead_type: selectTeacher,
      photo: formData.photo,
      lead: [
        {
          resume: uploadResume,
          qualification: formData.education,
          totalexp: formData.experience,
          video: formData.videoProfile,
          certificates: formData.certificate,
          joiningdate: dateJoining,
          ratings: 1,
          classestaken: 10,
          lead_type: formData.teacherType,
        },
      ],
      statusId: selectStatus,
      leadAvailability: leadAvailabilities,
    };
    // async (values: API.LoginParams) => {
    try {
      // 登录
      console.log("data", dataForm);
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
    } catch (error) {
      console.log("addRule error", error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      message.error(defaultLoginFailureMessage);
    }
    setVisible(false);
    // console.log('formData', formData);
    console.log("dataForm", dataForm);
  };

  const handleFormSubmitEdit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstname: formData.firstName
        ? formData.firstName
        : tempDataView.firstname,
      lastname: formData.lastName ? formData.lastName : tempDataView.lastname,
      dob: dateBirth ? dateBirth : tempDataView.dob,
      mobile: formData.mobile ? formData.mobile : tempDataView.mobile,
      email: formData.email ? formData.email : tempDataView.email,
      address: formData.address ? formData.address : tempDataView.address,
      whatsapp: formData.whatsapp ? formData.whatsapp : tempDataView.whatsapp,
      status: formData.status,
      gender: selectValue ? selectValue : tempDataView.gender,
      nationality: formData.nationality
        ? formData.nationality
        : tempDataView.nationalityId,
      category: formData.category ? formData.category : tempDataView.category,
      languages: formData.languagesKnown
        ? formData.languagesKnown
        : tempDataView.languages,
      startDate: dateStart ? dateStart : tempDataView.startDate,
      lead_type: selectTeacher,
      photo: formData.photo,
      lead: [
        {
          resume: formData.resume,
          qualification: formData.education
            ? formData.education
            : tempDataView.lead &&
            tempDataView.lead.map(function (lead, i) {
              return lead.qualification;
            }),
          totalexp: formData.experience
            ? formData.experience
            : tempDataView.lead &&
            tempDataView.lead.map(function (lead, i) {
              return lead.totalexp;
            }),
          video: formData.videoProfile,
          certificates: formData.certificate,
          joiningdate: dateJoining
            ? dateJoining
            : tempDataView.lead &&
            tempDataView.lead.map(function (lead, i) {
              return lead.joiningdate;
            }),
          ratings: 1,
          classestaken: 10,
          lead_type: formData.teacherType,
        },
      ],
      statusId: selectStatus ? selectStatus : tempDataView.statusId,
      leadAvailability: leadAvailabilities,
    };
    // async (values: API.LoginParams) => {
    if (tempDataView) {
      dataForm.id = tempDataView.id;
      dataForm.lead.id = tempDataView.lead.id;
    }
    try {
      // 登录
      console.log("data", dataForm);
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      // setUserLoginState(msg);
    } catch (error) {
      console.log("addRule error", error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      message.error(defaultLoginFailureMessage);
    }
    console.log("formData", formData);
    console.log("dataForm", dataForm);
    onClose();
    
  };

  let leadAvailabilities = [];
  //console.log('LA',  leadAvailabilities)
  //lead availability
  const WeekdayAvailability = (props) => {
    const [value, setValue] = useState({
      start_slot: "",
      end_slot: "",
    });
    const [value1, setValue1] = useState({
      weekday: "",
    });

    const leadWeekAvailability = {
      start_slot: value[0],
      end_slot: value[1],
      weekday: props.weekday,
      startDate: dateStart,
    };

    let dataLead = props.tempData;
    let slotStart, slotEnd;
    let leadSlot;
    if (dataLead) {
      //console.log('le', dataLead.toString().split(',')[0].slice(4))
      dataLead = dataLead.toString();
      slotStart = dataLead.split(",")[0].slice(4);
      slotEnd = dataLead.split(",")[1];
      console.log("slotss", slotStart);
      leadSlot = {
        start_slot: slotStart,
        end_slot: slotEnd,
        startDate: dateStart,
        weekday: props.weekday,
      };
    }
    if (
      leadWeekAvailability.start_slot &&
      leadWeekAvailability.end_slot &&
      leadWeekAvailability.weekday
    ) {
      leadAvailabilities.push(leadWeekAvailability);
    }
    if (dataLead) {
      leadAvailabilities.push(leadSlot);
      //console.log('Laa', leadAvailabilities)
    }

    const format = "HH:mm";
    return (
      <Row>
        <Col span={7}>
          {dataLead ? (
            <Checkbox name="weekday" checked="true">
              {props.week}
            </Checkbox>
          ) : (
            <Checkbox name="weekday" onChange={(e) => setValue1(props.weekday)}>
              {props.week}
            </Checkbox>
          )}
        </Col>
        <Col span={14}>
          {dataLead ? (
            <TimePicker.RangePicker
              format={format}
              defaultValue={[
                moment(`${slotStart}`, format),
                moment(`${slotEnd}`, format),
              ]}
            />
          ) : (
            <TimePicker.RangePicker
              format={format}
              onChange={(time, timeString) => {
                setValue(timeString);
              }}
            />
          )}
        </Col>
        <Col span={1}>
          <a>
            <PlusOutlined />
          </a>
        </Col>
        <Col span={2}>
          <a>
            <DeleteOutlined />
          </a>
        </Col>
      </Row>
    );
  };
  let timeSlots = tempDataView ? tempDataView.slots : "";
  let monday, tuesday, wednesday, thursday, friday, saturday, sunday;
  if (timeSlots) {
    timeSlots = timeSlots
      .split("to")
      .toString()
      .split(" , ")
      .toString()
      .split(" ");
    monday = timeSlots.filter((lead) => {
      return lead.startsWith("Mon");
    });
    tuesday = timeSlots.filter((lead) => {
      return lead.startsWith("Tue");
    });
    wednesday = timeSlots.filter((lead) => {
      return lead.startsWith("Wed");
    });
    thursday = timeSlots.filter((lead) => {
      return lead.startsWith("Thu");
    });
    friday = timeSlots.filter((lead) => {
      return lead.startsWith("Fri");
    });
    saturday = timeSlots.filter((lead) => {
      return lead.startsWith("Sat");
    });
    sunday = timeSlots.filter((lead) => {
      return lead.startsWith("Sun");
    });
  }
  //console.log('timeslots', timeSlots)

  const deleteTeacher = async (id) => {
    console.log("clicked delete teacher");
    try {
      let msg = await teacherRemove(id, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <PageContainer>
      {/* {console.log('teacherbatches', teacherBatches)} */}
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: "pages.searchTable.titleTeacher",
          defaultMessage: "Teacher Management",
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
            width={820}
          >
            <Form onFinish={handleFormSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="first name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the First Name",
                      },
                    ]}
                  >
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
                  <Form.Item
                    name="last Name"
                    rules={[{ required: true, message: "last Name" }]}
                  >
                    <Input
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* joining and start date */}

                <Col span={12}>
                  <Form.Item
                    name="joiningDate"
                    rules={[{ required: true, message: "Joining Date" }]}
                  >
                    <DatePicker
                      placeholder="Joining Date"
                      style={{ width: "370px" }}
                      onChange={(date, dateString) => {
                        setDateJoining(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    rules={[{ required: true, message: "Start Date" }]}
                  >
                    <DatePicker
                      placeholder="Start Date"
                      style={{ width: "370px" }}
                      onChange={(date, dateString) => {
                        setDateStart(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* Date of Birth and gender */}

                <Col span={12}>
                  <Form.Item
                    name="dateOfBirth"
                    rules={[
                      { required: true, message: "Enter date of birthday" },
                    ]}
                  >
                    <DatePicker
                      placeholder="Joining Date"
                      style={{ width: "370px" }}
                      onChange={(date, dateString) => {
                        setDateOfBirth(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    rules={[
                      { required: true, message: "Please select an gender" },
                    ]}
                  >
                    <Select
                      placeholder="Gender"
                      name="gender"
                      onChange={handleSelectChange}
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Not Applicable">Not Applicable</Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* Mobile and Whatsup */}

                <Col span={12}>
                  <Form.Item name="mobile">
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
                  <Form.Item name="whatsApp">
                    <Input
                      type="text"
                      placeholder="WhatsApp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Email and address */}

                <Col span={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Enter a valid email",
                      },
                    ]}
                  >
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
                  <Form.Item name="address">
                    <Input
                      type="text"
                      placeholder="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Nationality and category */}

                <Col span={12}>
                  <Form.Item
                    name="nationality"
                    rules={[
                      {
                        required: true,
                        pattern: /^[0-9]*$/,
                        message: "Enter the Nationality Number",
                      },
                    ]}
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
                    rules={[{ required: true, message: "Enter the category" }]}
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

                {/* Education/Qualification and total experience */}

                <Col span={12}>
                  <Form.Item name="qualification">
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
                    rules={[
                      {
                        required: true,
                        pattern: /^[0-9]*$/,
                        message: "Enter the total years of experience",
                      },
                    ]}
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

                {/* Teacher Type and Language Known */}

                <Col span={12}>
                  <Form.Item
                    name="teacherType"
                    rules={[
                      { required: true, message: "Enter the Teacher Type" },
                    ]}
                  >
                    <Select
                      placeholder="Teacher Type"
                      onChange={(value) => {
                        setSelectTeacher(value);
                      }}
                    >
                      <Option value="Native">Native</Option>
                      <Option value="Non Native">Non Native</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="languageKnown">
                    <Input
                      type="text"
                      placeholder="Languages Known"
                      name="languagesKnown"
                      value={formData.languagesKnown}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* upload resume and upload video profile */}

                <Col span={12}>
                  <Form.Item name="uploadResume">
                    <Upload {...propsUpload}>
                      <Button
                        icon={<UploadOutlined />}
                        style={{ width: "370px" }}
                      >
                        Upload Resume
                      </Button>
                    </Upload>
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

                {/* upload certificate and upload photo */}

                <Col span={12}>
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

                {/* status */}

                <Col span={12}>
                  <Form.Item
                    name="status"
                    rules={[
                      {
                        required: true,
                        message: "please enter Status",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Status"
                      onChange={(value) => {
                        setSelectStatus(value);
                      }}
                    >
                      <Option value="1">Active</Option>
                      <Option value="2">On Hold</Option>
                      <Option value="0">Leave</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {/* Availability */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Week Availability</label>
                    <WeekdayAvailability weekday={1} week="Monday" />
                    <WeekdayAvailability weekday={2} week="Tuesday" />
                    <WeekdayAvailability weekday={3} week="Wednesday" />
                    <WeekdayAvailability weekday={4} week="Thursady" />
                    <WeekdayAvailability weekday={5} week="Friday" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Weekend Availability</label>
                    <WeekdayAvailability weekday={6} week="Saturday" />
                    <WeekdayAvailability weekday={7} week="Sunday" />
                  </Form.Item>
                </Col>
              </Row>

              <Input
                type="submit"
                value="Add Teacher"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
            </Form>
          </Drawer>,
        ]}
      />

      <Drawer
        title="Teacher details"
        width={780}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
          seteditvisible(false);
        }}
        closable={true}
      >
        {!editvisible ? (
          <>
            <Row>
              <Col
                style={{
                  fontWeight: 900,
                  alignContent: "center",
                  alignItems: "center",
                }}
                span={24}
              >
                <center>
                  <h2 style={{ color: "blue" }}>View Teacher</h2>
                </center>
              </Col>
            </Row>
            <Row style={{ fontWeight: 500 }} gutter={(40, 60)}>
              <Col span={7}>Photo</Col>
              <Col span={6}>
                <p>Name</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.firstname + " " + tempDataView.lastname}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Joining Date </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.joiningdate}</span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Start Date </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.startDate}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Date of Birth </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.dob}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Gender </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.gender}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Mobile </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.mobile}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>WhatsApp </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.whatsapp}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Email </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.email}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Address </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.address}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Nationality </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.nationalityId}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Category </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.category}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Gender </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.gender}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Education </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.qualification}</span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Experiance </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.totalexp + " Years"} </span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Teacher Type </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      switch (lead.teacherType) {
                        case 1:
                          return <div>{"Native"} </div>;
                        case 2:
                          return <div>{"Non Native"} </div>;
                        default:
                          return <div>{"Native"} </div>;
                      }
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Languages Known </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.languages}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Resume </p>
              </Col>
              <Col span={11}>
                <p>
                  {" "}
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.resume}</span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Video Profile </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.video}</span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Certificates </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.lead &&
                    tempDataView.lead.map(function (lead, i) {
                      return <span>{lead.Certificates}</span>;
                    })}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Availabilty During the Week</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.slots}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Status </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.statusId == 1 ? (
                    <div>{"Active"} </div>
                  ) : tempDataView.statusId == 2 ? (
                    <div>{"OnHold"} </div>
                  ) : tempDataView.statusId == 3 ? (
                    <div>{"In Active"} </div>
                  ) : (
                    <div>{"Leave"} </div>
                  )}
                </p>
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={10}></Col>
              <Col span={12}>
                <Button type="primary" onClick={showDrawerEdit}>
                  {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
                  Edit Teacher
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Form onFinish={handleFormSubmitEdit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item>
                    <Input
                      name="firstName"
                      onChange={handleFormChange}
                      defaultValue= {tempDataView.firstname}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="last Name">
                    <Input
                      defaultValue={tempDataView.lastname}
                      name="lastName"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* joining and start date */}

                <Col span={12}>
                  <Form.Item name="joiningDate">
                    <DatePicker
                      defaultValue={moment(`${tempDataView.lead &&
                        tempDataView.lead.map(function (lead, i) {
                          return lead.joiningdate;
                        })}`, 'YYYY/MM/DD')} 
                      format='YYYY/MM/DD' 
                      style={{ width: "350px" }}
                      onChange={(date, dateString) => {
                        setDateJoining(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="startDate">
                    <DatePicker
                      defaultValue={moment(`${tempDataView.startDate}`, 'YYYY/MM/DD')} 
                      format='YYYY/MM/DD' 
                      style={{ width: "350px" }}
                      onChange={(date, dateString) => {
                        setDateStart(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* Date of Birth and gender */}

                <Col span={12}>
                  <Form.Item name="dateOfBirth">
                    <DatePicker
                      defaultValue={moment(`${tempDataView.dob}`, 'YYYY/MM/DD')} 
                      format='YYYY/MM/DD' 
                      style={{ width: "350px" }}
                      onChange={(date, dateString) => {
                        setDateOfBirth(dateString);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="gender">
                    <Select
                      defaultValue = {tempDataView.gender}
                      name="gender"
                      onChange={handleSelectChange}
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Not Applicable">Not Applicable</Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* Mobile and Whatsup */}

                <Col span={12}>
                  <Form.Item name="mobile">
                    <Input
                      type="text"
                      defaultValue={tempDataView.mobile}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="whatsApp">
                    <Input
                      defaultValue={tempDataView.whatsapp}
                      name="whatsapp"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Email and address */}

                <Col span={12}>
                  <Form.Item name="email">
                    <Input
                      defaultValue={tempDataView.email}
                      name="email"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address">
                    <Input
                      defaultValue={tempDataView.address}
                      name="address"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Nationality and category */}

                <Col span={12}>
                  <Form.Item name="nationality">
                    <Input
                      defaultValue={tempDataView.nationalityId}
                      name="nationality"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category">
                    <Input
                      defaultValue={tempDataView.category}
                      name="category"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Education/Qualification and total experience */}

                <Col span={12}>
                  <Form.Item name="qualification">
                    <Input
                      defaultValue={
                        tempDataView.lead &&
                        tempDataView.lead.map(function (lead, i) {
                          return lead.qualification;
                        })
                      }
                      name="education"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="totalExperience">
                    <Input
                      defaultValue={
                        tempDataView.lead &&
                        tempDataView.lead.map(function (lead, i) {
                          return lead.totalexp;
                        })
                      }
                      name="experience"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* Teacher Type and Language Known */}

                <Col span={12}>
                  <Form.Item
                    name="teacherType"
                    rules={[
                      {
                        required: true,
                        message: "please enter Teacher Type",
                      },
                    ]}
                  >
                    <Select
                      defaultValue = "Native"
                      onChange={(value) => {
                        setSelectTeacher(value);
                      }}
                    >
                      <Option value="Native">Native</Option>
                      <Option value="Non Native">Non Native</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="languageKnown">
                    <Input
                      defaultValue={tempDataView.languages}
                      name="languagesKnown"
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                {/* upload resume and upload video profile */}

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

                {/* upload certificate and upload photo */}

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

                {/* status */}

                <Col span={12}>
                  <Form.Item name="status">
                    <Select
                      defaultValue = {tempDataView.statusId == 1
                        ? "Active"
                        : tempDataView.statusId == 2
                          ? "OnHold"
                          : tempDataView.statusId == 3
                            ? "In Active"
                            : "Leave"}
                      onChange={(value) => {
                        setSelectStatus(value);
                      }}
                    >
                      <Option value="1">Active</Option>
                      <Option value="2">On Hold</Option>
                      <Option value="0">Leave</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {/* Availability */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Week Availability</label>
                    <WeekdayAvailability
                      weekday={1}
                      week="Monday"
                      tempData={monday}
                    />
                    <WeekdayAvailability
                      weekday={2}
                      week="Tuesday"
                      tempData={tuesday}
                    />
                    <WeekdayAvailability
                      weekday={3}
                      week="Wednesday"
                      tempData={wednesday}
                    />
                    <WeekdayAvailability
                      weekday={4}
                      week="Thursady"
                      tempData={thursday}
                    />
                    <WeekdayAvailability
                      weekday={5}
                      week="Friday"
                      tempData={friday}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Weekend Availability</label>
                    <WeekdayAvailability
                      weekday={6}
                      week="Saturday"
                      tempData={saturday}
                    />
                    <WeekdayAvailability
                      weekday={7}
                      week="Sunday"
                      tempData={sunday}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={12}>
                  <Button
                    onClick={() => {
                      deleteTeacher(tempDataView.id);
                    }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TeacherBatchList;
