import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MinusCircleOutlined
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
  Checkbox,
  TimePicker,
  Tooltip,
  notification,
  Space,
  Spin,
  Tabs
} from "antd";
import React, { useState, useRef, useEffect } from "react";
import { useIntl, FormattedMessage, useAccess } from "umi";

import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";

import {
  teacherBatches,
  addTeacherSchedule,
  teacherBatchesView,
  teacherRemove,
  listSchool,
} from "@/services/ant-design-pro/api";

import {
  handleAPIResponse
} from "@/services/ant-design-pro/helpers";

import "./index.css";
import moment from "moment";
import { parse, format } from "date-fns";
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import ViewDrawer from '../School/components/Drawers/viewDrawer';
import TeacherBulkUpload from "./components/TeacherBulkUpload";
import SchoolChangeContainer from "./components/SchoolChangeContainer";

const TeacherBatchList: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [editvisible, seteditvisible] = useState<boolean>(false);
  const [schools, setSchools] = useState<any[]>([]);
  const access = useAccess();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    joiningDate: "",
    email: "",
    address: "",
    batchCode: "",
    startDate: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    whatsapp: "",
    category: "",
    education: "",
    experience: "",
    teacherType: "teacher",
    languages: "",
    resume: "",
    videoProfile: "",
    certificate: "",
    photo: "",
    // countryCode: selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER,
    leadAvailability: null,
    status: "",
  });

  const actionRef = useRef<ActionType>();
  const [tempDataView, setTempDataView] = useState<any>({});
  const [selectCountryCode, setSelectCountryCode] = useState(91)
  const [selectCountry, setSelectCountry] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [key, setKey] = useState(0);

  //state for select option
  const [selectValue, setSelectValue] = useState("");
  const [selectStatus, setSelectStatus] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  //state for adding datepicker
  const [dateJoining, setDateJoining] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateBirth, setDateOfBirth] = useState("");
  const [currentRow, setCurrentRow] = useState<any>(null);

  useEffect(() => {
    listSchool()
      .then((data: any) => {
        setSchools(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  //add drawer
  const showDrawer = () => {
    setKey((e) => e + 1)
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
    seteditvisible(false);
  };

  const handleMobileChangeCountry = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setPhoneNumber(e.target.value);
  }

  const showDrawerEdit = () => {
    setKey((e) => e + 1)
    seteditvisible(true);
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const handleOneView = async (id: any) => {
    try {
      let msg = await teacherBatchesView(id);
      if (msg.status === "ok") {
        console.log("API call successfull", msg);
      }
      setTempDataView(msg.data);
      setKey((e) => e + 1)
      console.log("view one", msg);
    } catch (error) {
      console.log("error", error);
    }
  };

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
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobileno"
          defaultMessage="Phone Number"
        />
      ),
      dataIndex: "phoneNumber",
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
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.schoolTeacher"
          defaultMessage="School"
        />
      ),
      dataIndex: "schoolName",
      render: (dom, entity) => {
        return <Row justify={'space-between'}>
          <span>{entity?.schoolName}</span>
          {access.canSuperAdmin ? (<>
            <SchoolChangeContainer teacher={entity} schools={schools} />
          </>) : null}
        </Row>
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleName"
          defaultMessage="Teacher Id"
        />
      ),
      dataIndex: "teacherId",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleName"
          defaultMessage="Batch Code"
        />
      ),
      dataIndex: "batchCode",
    },
    //mobile number

    //experience
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleExperience"
          defaultMessage="Experience"
        />
      ),
      dataIndex: "totalexp",
      hideInTable: true,
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
              id="pages.searchTable.nameStatus.leave"
              defaultMessage="Leave"
            />
          ),
          status: "Leave",
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onhold"
              defaultMessage="On Hold"
            />
          ),
          status: "On Hold",
        },
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onhold"
              defaultMessage="In Active"
            />
          ),
          status: "In Active",
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
      hideInTable: true,
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
      hideInTable: true,
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
      hideInTable: true,
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
      renderFormItem: (value) => {
        return (
          <Select mode="tags">
            <Select.Option value="1">Monday</Select.Option>
            <Select.Option value="2">Tuesday</Select.Option>
            <Select.Option value="3">Wednesday</Select.Option>
            <Select.Option value="4">Thursday</Select.Option>
            <Select.Option value="5">Friday</Select.Option>
            <Select.Option value="6">Saturday</Select.Option>
            <Select.Option value="7">Sunday</Select.Option>
          </Select>
        );
      },
      search: {
        transform: (value) => {
          console.log("value", value);
          return { weekday: value };
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleView"
          defaultMessage="View"
        />
      ),
      dataIndex: "view",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              handleOneView(entity.leadId);
              setShowDetail(true);
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titleedit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
              handleOneView(entity.leadId);
              showDrawerEdit();
            }}
          >
            <EditOutlined />
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titledelete"
          defaultMessage="Delete"
        />
      ),
      dataIndex: "delete",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a onClick={() => { }}>
            <DeleteOutlined />
          </a>
        );
      },
    },
  ];

  const handleFormChange = (e: { target: { name: any; value: any; }; }, value: any) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
    // console.log('input one');
  };

  const handleSelectChange = (value: React.SetStateAction<string>) => {
    console.log("status", value);
    setSelectValue(value);
  };

  const handleFormSubmit = async () => {
    console.log("form submitted");
    setIsLoading(true);
    leadTotal.forEach((e) => {
      delete e.user_key;
    });
    const leadArray = [...leadTotal, ...leadAvailabilities]
    const dataForm = {
      teacherId: formData.teacherId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: dateBirth,
      phoneNumber: '+' + selectCountryCode + phoneNumber,
      email: formData.email,
      address: formData.address,
      whatsapp: formData.whatsapp,
      gender: selectValue,
      category: formData.category,
      languages: formData.languages,
      startDate: dateStart,
      type: "teacher",
      photo: formData.photo,
      batchCode: formData.batchCode,
      // lead: [
      //   {
      //     resume: uploadResume,
      //     qualification: formData.education,
      //     totalexp: formData.experience,
      //     video: formData.videoProfile,
      //     certificates: formData.certificate,
      //     joiningdate: dateJoining,
      //     ratings: 1,
      //     classestaken: 10,
      //     teachertype: formData.teacherType,
      //   },
      // ],
      status: selectStatus,
      schoolId: selectedSchool,
      leadAvailability: leadArray,
    };
    // async (values: API.LoginParams) => {
    try {
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });

      handleAPIResponse(msg, "Teacher Added Successfully", "Failed To Add Teacher");
    } catch (error) {
      handleAPIResponse({ status: 400 }, "Teacher Added Successfully", "Failed To Add Teacher");
      message.error("Add Teacher Error");
    }
    setVisible(false);
    setIsLoading(false);
  };

  const handleFormSubmitEdit = async () => {
    setIsLoading(true);
    leadTotal.forEach((e) => {
      delete e.user_key;
    });
    const leadArray = [...leadAvailabilities, ...leadTotal]
    const dataForm = {
      teacherId: formData.teacherId
        ? formData.teacherId
        : tempDataView.teacherId,
      firstName: formData.firstName
        ? formData.firstName
        : tempDataView.firstName,

      batchCode: formData.batchCode ? formData.batchCode : tempDataView.batchCode,
      lastName: formData.lastName ? formData.lastName : tempDataView.lastName,
      dob: dateBirth ? dateBirth : tempDataView.dob,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber : tempDataView.phoneNumber,
      email: formData.email ? formData.email : tempDataView.email,
      address: formData.address ? formData.address : tempDataView.address,
      whatsapp: formData.whatsapp ? formData.whatsapp : tempDataView.whatsapp,
      gender: selectValue ? selectValue : tempDataView.gender,
      category: formData.category ? formData.category : tempDataView.category,
      languages: formData.languagesKnown
        ? formData.languagesKnown
        : tempDataView.languages,
      startDate: dateStart ? dateStart : tempDataView.startDate,
      type: "teacher",
      photo: formData.photo,
      lead: [
        {
          resume: formData.resume,
          qualification: formData.education
            ? formData.education
            : tempDataView.teacher &&
            tempDataView.teacher.map(function (lead: { qualification: any; }, i: any) {
              return lead.qualification;
            }),
          totalexp: formData.experience
            ? formData.experience
            : tempDataView.teacher &&
            tempDataView.teacher.map(function (lead: { totalexp: any; }, i: any) {
              return lead.totalexp;
            }),
          video: formData.videoProfile,
          certificates: formData.certificate,
          joiningdate: dateJoining
            ? dateJoining
            : tempDataView.teacher &&
            tempDataView.teacher.map(function (lead: { joiningdate: any; }, i: any) {
              return lead.joiningdate;
            }),
          ratings: 1,
          classestaken: 10,
          teachertype: "teacher",
        },
      ],
      status: selectStatus ? selectStatus : tempDataView.status,
      schoolId: selectedSchool ? selectedSchool : tempDataView.schoolId,
      leadAvailability: leadArray,
    };
    // async (values: API.LoginParams) => {
    if (tempDataView) {
      dataForm.id = tempDataView.id;
      dataForm.teacherId = tempDataView.teacherId;
    }
    try {
      // 登录
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });

      handleAPIResponse(msg, "Teacher Updated Successfully", "Failed To Update Teacher");
    } catch (error) {
      message.error("Add Teacher Error");
      handleAPIResponse({ status: 400 }, "Teacher Added Successfully", "Failed To Add Teacher");
    }
    onClose();
    setIsLoading(false);
  };

  let leadAvailabilities: { start_slot: any; end_slot: any; weekday: any; start_date: string; }[] = [];
  let leadTotal: any[] = [];
  let extraWeek: { start_slot: any; end_slot: any; weekday: any; start_date: any; }[] = [];
  console.log('LA', leadAvailabilities, leadTotal, extraWeek)

  //lead availability
  const WeekdayAvailability = (props: { weekday: React.SetStateAction<{ weekday: string; }>; tempData: any[]; week: {} | null | undefined; }) => {
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
      start_date: dateStart,
    };

    let dataLead = props.tempData;
    let slotStart, slotEnd;
    let leadSlot;

    let slotStartRepeat: { slotStart: any; slotEnd: any; }[] = [];
    let slotEndRepeat = [];
    if (dataLead) {
      if (dataLead.length > 1) {
        dataLead.map((data: string) => {
          data = data.toString();
          slotStart = data.split(",")[0].slice(4);
          slotEnd = data.split(",")[1];
          slotStartRepeat.push({ slotStart: slotStart, slotEnd: slotEnd })
          leadSlot = {
            start_slot: slotStart,
            end_slot: slotEnd,
            weekday: props.weekday,
            start_date: dateStart ? dateStart : tempDataView.startDate,
          };
          extraWeek.push(leadSlot)
        })
      }
      dataLead = dataLead.toString();
      slotStart = dataLead.split(",")[0].slice(4);
      slotEnd = dataLead.split(",")[1];
      leadSlot = {
        start_slot: slotStart,
        end_slot: slotEnd,
        start_date: dateStart ? dateStart : tempDataView.startDate,
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


    const format = "HH:mm";
    return (
      <Row style={{ margin: 5 }}>
        <Col span={7}>
          {dataLead ?
            props.tempData.length > 1 ? (
              props.tempData.map((items: any) => {
                return <Col style={{ marginLeft: -5, margin: 7 }}>
                  <Checkbox
                    name="extra"
                    checked="true"
                    onChange={(e) => setValue1(props.weekday)}
                  >
                    {props.week}
                  </Checkbox>
                </Col>
              })
            ) :
              (
                <Checkbox
                  name="weekday"
                  checked="true"
                  onChange={(e) => setValue1(props.weekday)}
                >
                  {props.week}
                </Checkbox>
              ) : (
              <Checkbox name="weekday" onChange={(e) => setValue1(props.weekday)}>
                {props.week}
              </Checkbox>
            )}
        </Col>
        <Col span={14}>
          {dataLead ? props.tempData.length > 1 ? (
            slotStartRepeat.map((items) => {
              return <TimePicker.RangePicker
                format={format}
                defaultValue={[
                  moment(`${items.slotStart}`, format),
                  moment(`${items.slotEnd}`, format),
                ]}
                onChange={(time, timeString) => {
                  setValue(timeString);
                }}
              />
            })
          ) : (
            <TimePicker.RangePicker
              format={format}
              defaultValue={[
                moment(`${slotStart}`, format),
                moment(`${slotEnd}`, format),
              ]}
              onChange={(time, timeString) => {
                setValue(timeString);
              }}
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
      </Row>
    );
  };


  const ExtraWeekdayAvailability = (props: { id: any; }) => {
    const [value, setValue] = useState({
      start_slot: "",
      end_slot: "",
    });
    const [value1, setValue1] = useState({})
    const [weeknumber, setWeekNumber] = useState({})

    function handleChange(value: React.SetStateAction<{}>) {
      setWeekNumber(value)
    }

    const leadWeekAvailability = {
      start_slot: value[0],
      end_slot: value[1],
      weekday: weeknumber,
      start_date: dateStart,
      user_key: props.id
    };

    if (
      leadWeekAvailability.start_slot &&
      leadWeekAvailability.end_slot &&
      leadWeekAvailability.weekday
    ) {
      leadTotal.push(leadWeekAvailability);
      leadTotal = leadTotal.filter(element => {
        const isDuplicate = leadTotal.includes(element.user_key);
        if (!isDuplicate) {
          leadTotal.push(element.user_key);
          return true;
        }
      });
    }
    const format = "HH:mm";
    return (
      <Row style={{ margin: 1 }}>
        <Col span={2}>
          <Checkbox
            name="weekday"
            onChange={(e) => setValue1('new')}
          >
          </Checkbox>
        </Col>
        <Col span={6}>
          <Select onChange={handleChange}>
            <Select.Option value={1}>Monday</Select.Option>
            <Select.Option value={2}>Tuesday</Select.Option>
            <Select.Option value={3}>Wednesday</Select.Option>
            <Select.Option value={4}>Thursady</Select.Option>
            <Select.Option value={5}>Friday</Select.Option>
            <Select.Option value={6}>Saturday</Select.Option>
            <Select.Option value={7}>Sunday</Select.Option>
          </Select>
        </Col>
        <Col span={1}></Col>
        <Col span={14}>
          <TimePicker.RangePicker
            format={format}
            onChange={(time, timeString) => {
              setValue(timeString);
            }}
          />
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
    monday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Mon");
    });
    tuesday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Tue");
    });
    wednesday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Wed");
    });
    thursday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Thu");
    });
    friday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Fri");
    });
    saturday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Sat");
    });
    sunday = timeSlots.filter((lead: string) => {
      return lead.startsWith("Sun");
    });
  }
  //console.log('timeslots', timeSlots)

  //delete teacher
  const openNotification = (id: any) => {
    const key = id;
    const btn = (
      <Button type="primary" size="small" onClick={() => deleteTeacher(key)}>
        Confirm
      </Button>
    );
    notification.open({
      message: "Notification Title",
      description: `Do you want to delete ?`,
      btn,
      key,
      onClose: close,
    });
  };

  const deleteTeacher = async (id: any) => {
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
      console.log("delete", msg);
    } catch (error) {
      console.log("error", error);
    }
  };

  //Using default values for prepopulationg
  const [form] = Form.useForm();
  const defaultValues = () => {
    form.setFieldsValue({
      firstName: tempDataView.firstName,
      lastName: tempDataView.lastName,
      joiningDate: moment(
        tempDataView.teacher &&
        tempDataView.teacher.map(function (lead: { joiningdate: any; }, i: any) {
          return lead.joiningdate;
        }),
        "YYYY/MM/DD"
      ),
      startDate: moment(tempDataView.startDate, "YYYY/MM/DD"),
      gender: tempDataView.gender,
      phoneNumber: tempDataView.phoneNumber,
      status: tempDataView.status,
      whatsApp: tempDataView.whatsApp,
      email: tempDataView.email,
      address: tempDataView.address,
      category: tempDataView.category,
      qualification:
        tempDataView.teacher &&
        tempDataView.teacher.map(function (lead: { qualification: any; }, i: any) {
          return lead.qualification;
        }),
      totalExperience:
        tempDataView.teacher &&
        tempDataView.teacher.map(function (lead: { totalexp: any; }, i: any) {
          return lead.totalexp;
        }),
      teacherType: "teacher",
      languageKnown: tempDataView.languages,
      schoolName: tempDataView.schoolName,
    });
  };
  useEffect(() => {
    defaultValues();
  }, [tempDataView.firstName, tempDataView.lastName]);

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
        toolBarRender={() => [
          <TeacherBulkUpload />,
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
            <Spin spinning={isLoading}>
              <Form onFinish={handleFormSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="first name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter first Name",
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
                      rules={[
                        { required: true, message: "Please enter last Name" },
                      ]}
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
                    <Form.Item name="joiningDate">
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
                    <Form.Item name="startDate">
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
                    <Form.Item name="dateOfBirth">
                      <DatePicker
                        placeholder="Date of Birth"
                        style={{ width: "370px" }}
                        onChange={(date, dateString) => {
                          setDateOfBirth(dateString);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="gender">
                      <Select
                        placeholder="Gender"
                        name="gender"
                        onChange={handleSelectChange}
                      >
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Female">Female</Select.Option>
                        <Select.Option value="Not Applicable">Not Applicable</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>


                  {/* Mobile and Whatsup */}

                  <PhoneNumberCountrySelect handleMobileChange={handleMobileChangeCountry} setSelectCountry={setSelectCountry} setSelectCountryCode={setSelectCountryCode} edit={false} />

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
                    <Form.Item name="email"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Email",
                        },
                      ]}>
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
                    <Form.Item name="category">
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
                    <Form.Item name="totalExperience">
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
                    <Form.Item name="languageKnown">
                      <Input
                        type="text"
                        placeholder="Languages Known"
                        name="languagesKnown"
                        value={formData.languages}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  {/* For selecting schools while adding teacher */}
                  <Col span={12}>
                    <Form.Item name="schoolId">
                      <Select
                        placeholder="School"
                        onChange={(value) => {
                          setSelectedSchool(value);
                        }}
                      >
                        {schools.map((s) => (<Select.Option value={s.id}>{`${s.schoolName} ~ ${s.schoolCode}`}</Select.Option>))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* status */}

                  <Col span={24}>
                    <Form.Item name="status">
                      <Select
                        placeholder="Status"
                        onChange={(value) => {
                          setSelectStatus(value);
                        }}
                      >
                        <Select.Option value="0">In Active</Select.Option>
                        <Select.Option value="1">Active</Select.Option>
                        <Select.Option value="2">Leave</Select.Option>
                        <Select.Option value="3">On Hold</Select.Option>
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
                      <WeekdayAvailability weekday={4} week="Thursday" />
                      <WeekdayAvailability weekday={5} week="Friday" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="leadAvailability">
                      <label>Weekend Availability</label>
                      <WeekdayAvailability weekday={6} week="Saturday" />
                      <WeekdayAvailability weekday={7} week="Sunday" />
                      <Form.List name="users">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (

                              <Space key={key} style={{ display: 'flex' }} align="baseline">
                                {console.log('key', key)}
                                <Form.Item
                                  {...restField}
                                >
                                  <ExtraWeekdayAvailability key={key} />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Extra Availability
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </Col>
                </Row>

                <Input
                  type="submit"
                  value="Add Teacher"
                  style={{ color: "white", backgroundColor: "DodgerBlue" }}
                />
              </Form>
            </Spin>
          </Drawer>,
        ]}
      />

      <Drawer
        title="Teacher details"
        width={780}
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          seteditvisible(false);
        }}
        closable={true}
      >
        <Tabs>
          <Tabs.TabPane tab="Teacher Details" key="1">
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
                    <p>{tempDataView.firstName + " " + tempDataView.lastName}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Joining Date </p>
                  </Col>
                  <Col span={11}>
                    <p>
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { joiningdate: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }, i: any) {
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
                    <p>Phone Number </p>
                  </Col>
                  <Col span={11}>
                    <p>{tempDataView.phoneNumber}</p>
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
                    <p>Category </p>
                  </Col>
                  <Col span={11}>
                    <p>{tempDataView.category}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Education </p>
                  </Col>
                  <Col span={11}>
                    <p>
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { qualification: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }, i: any) {
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
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { totalexp: string; }, i: any) {
                          return <span>{lead.totalexp + " Years"} </span>;
                        })}
                    </p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Teacher Type </p>
                  </Col>
                  <Col span={11}>
                    <p>Teacher</p>
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
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { resume: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }, i: any) {
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
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { video: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }, i: any) {
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
                      {tempDataView.teacher &&
                        tempDataView.teacher.map(function (lead: { Certificates: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }, i: any) {
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
                      {tempDataView.status == 1 ? (
                        <div>{"Active"} </div>
                      ) : tempDataView.status == 3 ? (
                        <div>{"OnHold"} </div>
                      ) : tempDataView.status == 2 ? (
                        <div>{"Leave"} </div>
                      ) : (
                        <div>{"In Active"} </div>
                      )}
                    </p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>School </p>
                  </Col>
                  <Col span={11}>
                    <p>
                      {schools?.filter(e => e?.id === tempDataView?.schoolId)[0]!?.schoolName}
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
              <Spin spinning={isLoading}>
                <Form onFinish={handleFormSubmitEdit} form={form} key={key}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="firstName">
                        <Input name="firstName" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="lastName">
                        <Input name="lastName" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>

                    {/* joining and start date */}

                    <Col span={12}>
                      <Form.Item name="joiningDate">
                        <DatePicker
                          format="YYYY/MM/DD"
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
                          format="YYYY/MM/DD"
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
                          format="YYYY/MM/DD"
                          style={{ width: "350px" }}
                          onChange={(date, dateString) => {
                            setDateOfBirth(dateString);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="gender">
                        <Select name="gender" onChange={handleSelectChange}>
                          <Select.Option value="Male">Male</Select.Option>
                          <Select.Option value="Female">Female</Select.Option>
                          <Select.Option value="Not Applicable">Not Applicable</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Mobile and Whatsup */}
                    <PhoneNumberCountrySelect handleMobileChange={handleFormChange} edit={true} defaultValue={tempDataView?.phoneNumber} />

                    <Col span={12}>
                      <Form.Item name="whatsApp">
                        <Input name="whatsapp" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>

                    {/* Email and address */}

                    <Col span={12}>
                      <Form.Item name="email">
                        <Input name="email" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="address">
                        <Input name="address" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>

                    {/* Nationality and category */}

                    <Col span={12}>
                      <Form.Item name="category">
                        <Input name="category" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>

                    {/* Education/Qualification and total experience */}

                    <Col span={12}>
                      <Form.Item name="qualification">
                        <Input name="education" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="totalExperience">
                        <Input name="experience" onChange={handleFormChange} />
                      </Form.Item>
                    </Col>

                    {/* Teacher Type and Language Known */}
                    <Col span={12}>
                      <Form.Item name="languageKnown">
                        <Input
                          name="languagesKnown"
                          onChange={handleFormChange}
                          placeholder={"Languages Known"}
                        />
                      </Form.Item>
                    </Col>

                    {/* upload resume and upload video profile */}

                    {/* School */}
                    <Col span={12}>
                      <Form.Item name="schoolId">
                        <Select
                          defaultValue={tempDataView.schoolId}
                          value={tempDataView.schoolId}
                          onChange={(value) => {
                            setSelectedSchool(value)
                          }}
                        >
                          {schools.map((s) => (<Select.Option value={s.id}>{`${s.schoolName} ~ ${s.schoolCode}`}</Select.Option>))}
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* status */}

                    <Col span={12}>
                      <Form.Item name="status">
                        <Select
                          defaultValue={
                            tempDataView.statusId == 1
                              ? "Active"
                              : tempDataView.statusId == 3
                                ? "OnHold"
                                : tempDataView.statusId == 2
                                  ? "Leave"
                                  : "In Active"
                          }
                          onChange={(value) => {
                            setSelectStatus(value);
                          }}
                        >
                          <Select.Option value="0">In Active</Select.Option>
                          <Select.Option value="1">Active</Select.Option>
                          <Select.Option value="2">Leave</Select.Option>
                          <Select.Option value="3">On Hold</Select.Option>
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
                          week="Thursday"
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
                        <Form.List name="users">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (

                                <Space key={key} style={{ display: 'flex' }} align="baseline">
                                  {console.log('key', key)}
                                  <Form.Item
                                    {...restField}
                                  >
                                    <ExtraWeekdayAvailability key={key} />
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                  Extra Availability
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Input
                        type="submit"
                        value="Save Changes"
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                      />
                    </Col>
                    <Col span={8}></Col>
                    <Col span={8}>
                      <Button
                        onClick={() => {
                          openNotification(tempDataView.id);
                        }}
                        block
                        type="primary"
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Spin>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Batch Details" key="2">
            <ViewDrawer tempData={currentRow} />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </PageContainer>
  );
};

export default TeacherBatchList;