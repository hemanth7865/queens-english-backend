// @ts-nocheck
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Drawer,
  Form,
  Col,
  Row,
  Input,
  Checkbox,
  TimePicker,
  DatePicker,
  Divider,
  Modal,
  Select,
  Tag,
  Typography,
  Table
} from "antd";
import { v4 as uuidv4 } from 'uuid';
const { Title } = Typography;
import moment from "moment";
const { RangePicker } = DatePicker;
import React, { useState, useRef, useEffect } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import type { FormValueType } from "./components/UpdateForm";
import UpdateForm from "./components/UpdateForm";
import TeacherBatchList from "../TeacherBatchList";
import {
  addRule,
  updateRule,
  removeRule,
  batches,
  listTeacherAndStudent,
  listBatch,
  addeditbatch,
  getIndividualBatch,
  deleteBatch
} from "@/services/ant-design-pro/api";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import "./batchList.css";
import DebounceSelect from "@/components/DebounceSelect";
import {LESSONS} from "../../../config/lessons";
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const handleDelete = (entity) => {
  const confirmDelete = window.confirm(
    `Do you want to delete ${entity.batchId} ?`
  );
  if (confirmDelete) {
    try {
      removeRule(entity);
    } catch (error) {
      message.error("Delete failed, please try again");
    }
  }
};

const DEFAULT_FORM_DATA = {
  classCode: "",
  batchNumber: "",
  teacherId: "",
  startingLessonId: "",
  endingLessonId: "",
  classStartDate: "",
  classEndDate: "",
  lessonStartTime: "",
  lessonEndTime: "",
  ageGroup: "",
  followupVersion: "v2",
  id: "",
  batchAvailability: [{}],
  students: [],
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
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [addTeacher, setAddTeacher] = useState(false);
  const [timeRange, setTimeRange] = useState([]);
  const [batchDate, setbatchDate] = useState("");
  const [availabilityType, setAvailabiltyType] = useState("");
  const [createBatch, setCreateBatch] = useState(false);
  const [addTeacherComponent, setAddTeacherComponent] = useState(false);
  const [error, seterror] = useState("");
  const [classDateRange, setClassDateRange] = useState();
  const [studentList, setStudentList] = useState([]);
  const [leadList, setLeadList] = useState({});
  const [teacherName, setTeacherName] = useState([]);
  const [batchDetails, setBatchDetails] = useState({});
  const [renderEdit,setRenderEdit] = useState(false)
  const [edit, setEdit] = useState(false)

  const [startLesson,setStartLesson] = useState("");
  const [endLesson,setEndLesson] = useState("");
  const [followupVersion, setFollowupVersion] = useState("v2");

  const options = [];
  const studentMap = {};
  for (let i = 0; i < leadList.length; i++) {
    if (leadList[i].type == "teacher") {
      const value = leadList[i].leadId;
      options.push({
        value,
      });
    }
  }
  const teacherMap = {};
  const teacherOptions = [];
  for (let i = 0; i < leadList.length; i++) {
    if (leadList[i].type == "teacher") {
      const value = leadList[i].leadId;
      teacherOptions.push({
        value,
      });
    }
  }
  function handleStudentSelect(value) {
    setStudentList([...value]);
  }

  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [tempData, setTempData] = useState({});
  const [tempDataView, setTempDataView] = useState({});
  //listbatches
  useEffect(async (params: any) => {
    console.log("uuid",uuidv4())
    try {
      let msg = await listBatch({
        current: 1,
        pageSize: 20
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setTempData(msg.data);
      console.log("batches", msg.data);
      //
    } catch (error) {
      console.log("error", error);
    }
    return () => {
      console.log("effect cleanup");
    };
  }, []);

  useEffect(() => {
    listTeacherAndStudent()
      .then((data) => {
        setLeadList(data?.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        console.log("leadList", leadList);
      });
  }, []);

  async function fetchUserList(username) {
    console.log("fetching teacher user", username);
    return listTeacherAndStudent({
      type: 'teacher',
      current: 1,
      pageSize: 5,
      keyword: username
    })
      .then((body) =>
        body.data.map((user) => ({
          label: `${user.name}`,
          value: user.id,
        }))
      );
  }
  async function fetchStudentList(username) {
    console.log("fetching student user", username);
    return listTeacherAndStudent(
      {
        current: 1,
        pageSize: 5,
        type: 'student',
        keyword: username
      }
    )
      .then((body) =>
        body.data.map((user) => ({
          label: `${user.name} - ${user.phoneNumber}`,
          value: user.id,
        }))
      );
  }

  const [dateStart, setDateStart] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [prePop, setPrePop] = useState({});

  // const [deleteData, setDeleteData] = useState();
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const handleTimeRange = (value,e) => {
    setTimeRange([...value]);
    console.log("timeRange", timeRange);
  };
  const handleClassDateRange = (value,e) => {
    console.log('classDateRange',value)
    console.log(value);
    setClassDateRange([...value]);
  };
  useEffect(() => {
    console.log("start date", timeRange);
  }, [timeRange]);
  const handleClassDate = (value) => {};
  const handleOk = () => {
    try {
      console.log(currentRow);
      handleFormDelete(currentRow.id);
    } catch (error) {
      console.log(error);
      message.error("Delete failed, please try again");
    }
    setDeleteConfirmModal(false);
  };

  const handleCancel = () => {
    setDeleteConfirmModal(false);
  };

  const handleTeacherChange = (value) => {
    setTeacherName(value);
  };
  const handleFormSubmitEdit = async () => {
      //REFORMATTED DATE RANGE
      console.log("createBatch")
      let formattedStartDate = classDateRange[0]._d.toString().split(" ");
      let formattedEndDate = classDateRange[1]._d.toString().split(" ");
      let startmonthNumber =
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].indexOf(formattedStartDate[1]) + 1;
      let endMonthNumber =
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].indexOf(formattedEndDate[1]) + 1;
      let finalStartDate =
        formattedStartDate[3] +
        "-" +
        startmonthNumber.toString() +
        "-" +
        formattedStartDate[2] +
        "T" +
        formattedStartDate[4] +
        ".000Z";
      let finalEndDate =
        formattedEndDate[3] +
        "-" +
        endMonthNumber.toString() +
        "-" +
        formattedEndDate[2] +
        "T" +
        formattedEndDate[4] +
        ".000Z";
      //REFORMATTED TIME RANGE
      let formatLessonStartTime = timeRange[0]._d.toString().split(" ");
      let formatLessonEndTime = timeRange[1]._d.toString().split(" ");
      let lessonStartMonth =
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].indexOf(formatLessonStartTime[1]) + 1;
      let lessonEndMonth =
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].indexOf(formatLessonEndTime[1]) + 1;
      let finalStartTime =
        formatLessonStartTime[3] +
        "-" +
        lessonStartMonth.toString() +
        "-" +
        formatLessonStartTime[2] +
        "T" +
        formatLessonStartTime[4] +
        ".000Z";
      let finalEndTime =
        formatLessonStartTime[3] +
        "-" +
        lessonEndMonth.toString() +
        "-" +
        formatLessonEndTime[2] +
        "T" +
        formatLessonEndTime[4] +
        ".000Z";

      const dataForm = {
        classCode: formData.classCode,
        batchNumber: formData.batchNumber,
        teacherId: teacherName.value,
        startingLessonId: startLesson,
        endingLessonId: endLesson,
        classStartDate: finalStartDate,
        classEndDate: finalEndDate,
        lessonStartTime: finalStartTime,
        lessonEndTime: finalEndTime,
        ageGroup: selectedAgeGroup,
        followupVersion: followupVersion,
        id: createBatch ? null: currentRow?.id,
        batchAvailability: [{}],
        students: [...studentList],
        edit
      };
      console.log("formData", dataForm);

      try {
        // 登录
        console.log("data", dataForm);
        const msg = await addeditbatch({
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForm),
        });
        console.log("msg", msg, msg.status);
        if (msg.success) {
          console.log("API call sucessfull", msg);
          setShowDetail(false)
          setCurrentRow(undefined)
          actionRef.current?.reloadAndRest?.();
          if(msg.data[0]?.message){
            message.error(msg.data[0].message);
          }
          console.log('details',showDetail)
        }
        console.log(msg);
      } catch (error) {
        console.log("Failed");
      };
  }

  const handleFormDelete = async (id: string) => {
    try {
      // 登录
      const msg = await deleteBatch(id);
      console.log("msg", msg, msg.status);
      if (msg.success) {
        console.log("API call sucessfull", msg);
        setShowDetail(false)
        setCurrentRow(undefined)
        actionRef.current?.reloadAndRest?.();
        if(msg.data[0]?.message){
          message.error(msg.data[0].message);
        }
        console.log('details',showDetail)
      }
      console.log(msg);
    } catch (error) {
      console.log("Failed");
    };
  }

  const handleFormChange = (e, value) => {
    console.log("ff",value,e.target.name,e.target.value)
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
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
  
  const prepareEditFormData = (rowval: any) => {
    console.log("rowval",rowval.id)
    getIndividualBatch(rowval.id)
      .then((data) => {
        console.log("batch DData", data);
        setBatchDetails(data.data);
        const batchData = data.data;
        if(batchData.classes){
          setFormData({...formData, classCode: batchData.classes.classCode,
          batchNumber: batchData.classes.batchNumber, followupVersion: batchData.classes.followupVersion});
          setFollowupVersion(batchData.classes.followupVersion);
        }
        var tempObj = {
          batchData: data.data,
          starttime:batchData?.classes?.classStartDate,
          endttime: batchData?.classes?.classEndDate,
        };
        setPrePop(tempObj);
        try {
          setClassDateRange(tempObj?.batchData?.classes?.classEndDate?.length > 0 && tempObj?.batchData?.classes?.classStartDate?.length ? [
            moment(tempObj.batchData.classes.classStartDate.split("T")[0], dateFormat),
            moment(tempObj.batchData.classes.classEndDate.split("T")[0], dateFormat),
          ]:undefined)
        } catch (e) {
          console.log('start date error', e)
        }

        try{
          setTimeRange(tempObj?.batchData?.classes?.lessonEndTime?.length > 0 && tempObj?.batchData?.classes?.lessonStartTime?.length ?
            [ moment(tempObj?.batchData?.classes?.lessonStartTime.split("T")[1], "HH:mm"),
            moment(tempObj?.batchData?.classes?.lessonEndTime.split("T")[1], "HH:mm")]:undefined)
        }catch(e){
          console.log("Time Range Error", e);
        }

        setStartLesson(tempObj?.batchData?.classes?.startingLessonId);
        setEndLesson(tempObj?.batchData?.classes?.endingLessonId);

        let reformatData = tempObj?tempObj?.batchData?.students.map((elem,index,arr)=>{
          console.log('elem',elem)
          elem.value = elem.studentId
          elem.label =  `${elem?.student?.firstName} ${elem?.student?.lastName} - ${elem?.student?.phoneNumber}`;
          elem.key  =  elem.id
          console.log('changed', elem.value, elem.label,elem.key)
          return elem
        }):[]
        setStudentList([...reformatData])
        console.log("reformatData",...reformatData)
        setSelectedAgeGroup(tempObj?tempObj.batchData.classes.ageGroup:'')

        if(tempObj?.batchData?.classes?.teacher) { 
          setTeacherName({value: tempObj?.batchData?.classes?.teacherId, 
            label: `${tempObj?.batchData?.classes?.teacher.firstName} ${tempObj?.batchData?.classes?.teacher.lastName}`, 
            key:tempObj?.batchData?.classes?.teacherId})
        }

        console.log("rowval", batchDetails);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setRenderEdit(true);
        setEdit(true)
      });

    //
    // console.log("batchDetails", batchDetails);
    // setTeacherName(batchDetails?.)
    // setStudentList()
  };
  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titledates"
          defaultMessage="Date"
        />
      ),
      dataIndex: "date",
      valueType: "date",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.batchId"
          defaultMessage="Batch ID"
        />
      ),
      dataIndex: "batchId",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleCreatedBy"
          defaultMessage="Created By"
        />
      ),
      dataIndex: "createdBy",
    },
    //Teacher row
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTeacher"
          defaultMessage="Teacher"
        />
      ),
      dataIndex: "teacher",
      valueType: "textarea",
    },
    //Students row
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudents"
          defaultMessage="Student"
        />
      ),
      dataIndex: "students",
      valueType: "textarea",
    },
    //Time slot
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTimeSlot"
          defaultMessage="Time Slot"
        />
      ),
      dataIndex: "timeSlot",
      // valueType: "textarea",
      renderFormItem: (value) => {
        console.log(value);
        return <TimePicker.RangePicker format="HH:mm" />;
      },
    },
    //button
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
      //brb
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.view.nameLabel"
          defaultMessage="view"
        />
      ),
      dataIndex: "view",
      tip: "The rule name is the unique key",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              console.log("setCurrentRow view",entity)
              setShowDetail(true);
              setTempData(entity);
              setAddTeacher(false);
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    },
    {
      //brb
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titleedit"
          defaultMessage="edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              // console.log('entity',entity);
              setCurrentRow(entity);
              console.log("setCurrentRow edit",entity)

              prepareEditFormData(entity);
              setAddTeacher(true);
              setShowDetail(true);
              setCreateBatch(false);
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
          defaultMessage="delete"
        />
      ),
      dataIndex: "delete",
      tip: "The rule name is the unique key",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              // console.log(entity);
              setCurrentRow(entity);
              setDeleteConfirmModal(true);
              console.log("currentrow", currentRow);
            }}
          >
            <DeleteOutlined />
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

  const dateFormat = "YYYY-MM-DD";
  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: "pages.searchTable.title",
          defaultMessage: "BatchList",
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
              /**
               * Clean up and show edit form
               */
              handleModalVisible(false);
              setShowDetail(true);
              setAddTeacher(true);
              setCreateBatch(true);
              setAddTeacherComponent(false);
              setRenderEdit(true);
              setEdit(false);
              setFormData(DEFAULT_FORM_DATA);
              setTeacherName([]);
              setClassDateRange(undefined);
              setStudentList([]);
              setLeadList({});
              setBatchDetails({});
              setStartLesson("");
              setEndLesson("");
              setFollowupVersion("");
            }}
          >
            {/* <Button type="primary" key="primary" onClick={showDrawer}> */}
            Create Batch
          </Button>,
        ]}
        request={listBatch}
        columns={columns}
        //the checkbox
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
            console.log(selectedRows);
          },
        }}
      />
      <Modal
        title="Delete?"
        visible={deleteConfirmModal}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to delete the current batch?</p>
      </Modal>
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage
                id="pages.searchTable.chosen"
                defaultMessage="Chosen"
              />{" "}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{" "}
              <FormattedMessage
                id="pages.searchTable.item"
                defaultMessage="项"
              />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{" "}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{" "}
                <FormattedMessage
                  id="pages.searchTable.tenThousand"
                  defaultMessage="万"
                />
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
          id: "pages.searchTable.createForm.newRule",
          defaultMessage: "New rule",
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

      <Drawer
        width={addTeacherComponent ? 1400 : 600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
          setAddTeacherComponent(false);
          setRenderEdit(false)
          setPrePop({})
        }}
        closable={true}
      >
        {" "}
        {addTeacherComponent ? (
          // <TeacherBatchList />
          <></>
        ) : (
          <>
            {addTeacher ? (
              <>
                {createBatch  ? (
                  <div style={{ fontWeight: 700, marginBottom: "20px" }}>
                    Create Batch
                  </div>
                ) : (
                  <div style={{ fontWeight: 700, marginBottom: "20px" }}>
                    Edit Batch
                  </div>
                )}
                {renderEdit?
                <Form onFinish={handleFormSubmitEdit}>
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        name="classCode"
                        rules={[{ required: true, message: "Class Code" }]}
                      >
                        <Input
                          type="text"
                          placeholder="Class Code"
                          name="classCode"
                          value={formData.classCode}
                          defaultValue={formData.classCode}
                          onChange={handleFormChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="batchNumber"
                        rules={[{ required: true, message: "Batch Number" }]}
                      >
                        <Input
                          type="text"
                          placeholder="Batch Number"
                          name="batchNumber"
                          value={formData.batchNumber}
                          defaultValue={formData.batchNumber}
                          onChange={handleFormChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="startingLessonId"
                        rules={[
                          { required: true, message: "Starting Lesson Id" },
                        ]}
                      >
                        <Select
                          placeholder="Starting Lesson"
                          onChange={(value) => {
                            setStartLesson(value)
                          }}
                          defaultValue={
                                              startLesson}
                          value={formData.startingLessonId}
                          disabled={edit}
                        >
                          {
                            LESSONS.map((_l) => (<Option key={_l.id} value={_l.id}>Lesson {_l.number}</Option>))
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="endingLessonId"
                        rules={[
                          { required: true, message: "Ending Lesson Id" },
                        ]}
                      >
                        <Select
                          placeholder="Ending Lesson"
                          onChange={(value) => {
                           setEndLesson(value)
                          }}
                          value={endLesson}
                          defaultValue={endLesson}
                          disabled={edit}
                        >
                          {
                            LESSONS.map((_l) => (<Option key={_l.id} value={_l.id}>Lesson {_l.number}</Option>))
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="dateRangePicker"
                        rules={[{ required: true, message: "Batch Date" }]}
                      >
                        {console.log("prePopRender",prePop)}
                        <RangePicker
                          style={{ width: "551px" }}
                          onChange={(value,e)=>{handleClassDateRange(value,e)}}
                          defaultValue={ 
                            prePop?.batchData?.classes?.classEndDate?.length > 0 && prePop?.batchData?.classes?.classStartDate?.length ? [
                              moment(prePop.batchData.classes.classStartDate.split("T")[0], dateFormat),
                              moment(prePop.batchData.classes.classEndDate.split("T")[0], dateFormat),
                            ]: {}} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="BatchTime"
                        rules={[{ required: true, message: "Batch Time" }]}
                      > {currentRow?console.log(prePop):''}
                        <TimePicker.RangePicker
                          format={"HH:mm"}
                          defaultValue={
                            prePop?.batchData?.classes?.lessonEndTime?.length > 0 && prePop?.batchData?.classes?.lessonStartTime?.length ?
                            [
                              moment(prePop?.batchData?.classes?.lessonStartTime.split("T")[1], "HH:mm"),
                              moment(prePop?.batchData?.classes?.lessonEndTime.split("T")[1], "HH:mm")
                            ] : {}
                          }
                          onChange={(value,e)=>handleTimeRange(value,e)}
                          style={{ width: "551px" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item
                        name="teacherId"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your id",
                          },
                        ]}
                      >
                        {console.log("currentRow", currentRow)}
                        <DebounceSelect
                          showSearch
                          value={teacherName}
                          placeholder="Select teacher"
                          fetchOptions={fetchUserList}
                          options = {[]}
                          onChange={(newValue) => {
                            setTeacherName(newValue);
                            console.log("teacherDeb", newValue);
                          }}
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col offset={1} span={7}>
                      <Button
                        size="default"
                        onClick={() => {
                          setAddTeacherComponent(true);
                        }}
                        on
                        type="primary"
                      >
                        Add New Teacher
                      </Button>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="ageGroup"
                        rules={[
                          { required: true, message: "Select age group" },
                        ]}
                      >
                        {console.log('ageGroup',prePop)}
                        <Select
                          placeholder="Age Group"
                          onChange={(v) => setSelectedAgeGroup(v)}
                          value={selectedAgeGroup}
                          defaultValue={!createBatch?prePop?.batchData?.classes.ageGroup:''}
                        >
                          <Option value="Pre-Teen">Pre-Teen</Option>
                          <Option value="Teen">Teen</Option>
                        </Select>
                      </Form.Item>
                    </Col>
      
                    <Col span={24}>
                      <Form.Item
                        name="studentList"
                        rules={[{ required: true, message: "Select students" }]}
                      >  {console.log("lol",studentList)}
                         {studentList?
                        <DebounceSelect
                          mode="tags"
                          value={studentList}
                          placeholder="Select students"
                          fetchOptions={fetchStudentList}
                          options = {currentRow?.id?studentList:[]}
                          defaultValue={currentRow?.id?studentList:null}
                          onChange={(newValue) => {
                            console.log("student",studentList)
                            setStudentList([...newValue]);
                          }}
                          style={{
                            width: "100%",
                          }}
                        />:<></>}
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Button
                        // size="large"
                        style={{ width: "551px" }}
                        type="primary"
                        onClick={handleFormSubmitEdit}
                      >
                        Save
                      </Button>
                    </Col>
                  </Row>
                </Form>:''
                }
              </>
            ) : (
              <>
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
                    columns={
                      columns as ProDescriptionsItemProps<API.RuleListItem>[]
                    }
                  />
                )}
                <div className="title">{tempData?.batchId}</div>
                <Row>
                  <Col span={8}>
                    <div className="label">Date</div>
                    <div className="label">Created By</div>
                    <div className="label">Assigned Teacher</div>
                    <div className="label">Student</div>
                    <div className="label">TimeSlot</div>
                    <div className="label">Status</div>
                  </Col>
                  <Col span={2}>
                    <Divider style={{ height: "300px" }} type="vertical" />
                  </Col>
                  <Col span={8}>
                    <div className="label">
                      {tempData?.date ? tempData.date.split("T")[0] : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.createdBy ? tempData.createdBy : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.teacher ? tempData?.teacher : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.students ? tempData?.students : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.timeSlot ? tempData?.timeSlot : "NA"}
                    </div>
                    <div className="label"> {tempData?.status}</div>
                  </Col>
                  <Col span={24}>
                    <div className="title">Students</div>
                    <Table style={{width: "100%"}} dataSource={tempData?.studentsList} columns={[
                      {
                        title: "First Name",
                        dataIndex: "firstName",
                        key: "firstName"
                      },
                      {
                        title: "Last Name",
                        dataIndex: "lastName",
                        key: "lastName"
                      },
                      {
                        title: "Phone Number",
                        dataIndex: "phoneNumber",
                        key: "phoneNumber"
                      }
                    ]} />
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default BatchList;
