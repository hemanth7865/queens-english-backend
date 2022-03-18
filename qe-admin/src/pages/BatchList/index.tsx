import {
  DeleteOutlined,
  EyeOutlined,
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
  TimePicker,
  DatePicker,
  Divider,
  Modal,
  Select,
  Table,
  Spin
} from "antd";
// @ts-ignore-next-line
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
const { RangePicker } = DatePicker;
import React, { useState, useRef, useEffect } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import {
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
import { parseISO, format } from "date-fns";

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
  const url = new URL(window.location.href);

  const [showDetail, setShowDetail] = useState<boolean>(url.searchParams.get("add") ? true : false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [addTeacher, setAddTeacher] = useState(url.searchParams.get("add") ? true : false);
  const [timeRange, setTimeRange] = useState<any>([]);
  const [createBatch, setCreateBatch] = useState(url.searchParams.get("add") ? true : false);
  const [addTeacherComponent, setAddTeacherComponent] = useState(false);
  const [classDateRange, setClassDateRange] = useState<any>();
  const [studentList, setStudentList] = useState<any[]>([]);
  const [leadList, setLeadList] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState<any>(url.searchParams.get("teacherId") ? {value: url.searchParams.get("teacherId"), label: url.searchParams.get("teacherName")} : []);
  const [renderEdit,setRenderEdit] = useState(url.searchParams.get("add") ? true : false)
  const [edit, setEdit] = useState(false)

  const [startLesson,setStartLesson] = useState("");
  const [endLesson,setEndLesson] = useState("");
  const [followupVersion, setFollowupVersion] = useState("v2");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [tempData, setTempData] = useState<any>({});

  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [prePop, setPrePop] = useState({});
  const intl = useIntl();

  const options = [];
  for (let i = 0; i < leadList.length; i++) {
    if (leadList[i].type == "teacher") {
      const value = leadList[i].leadId;
      options.push({
        value,
      });
    }
  }

  const teacherOptions = [];
  for (let i = 0; i < leadList.length; i++) {
    if (leadList[i].type == "teacher") {
      const value = leadList[i].leadId;
      teacherOptions.push({
        value,
      });
    }
  }

  //listbatches
  useEffect(() => {
    listBatch({
      current: 1,
      pageSize: 20
    }).then(msg => {
      setTempData(msg.data);
    }).catch(e => {
      console.log("error", e);
    });
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

  async function fetchUserList(username: string) {
    console.log("fetching teacher user", username);
    return listTeacherAndStudent({
      type: 'teacher',
      current: 1,
      pageSize: 5,
      keyword: username
    })
      .then((body) =>
        body.data.map((user: any) => ({
          label: `${user.name}`,
          value: user.id,
        }))
      );
  }
  async function fetchStudentList(username: string) {
    return listTeacherAndStudent(
      {
        current: 1,
        pageSize: 5,
        type: 'student',
        keyword: username
      }
    )
      .then((body) =>
        body.data.map((user: any) => ({
          label: `${user.name} - ${user.phoneNumber}`,
          value: user.id,
        }))
      );
  }

  const handleTimeRange = (value: any) => {
    setTimeRange(value);
  };

  const handleClassDateRange = (value: any) => {
    setClassDateRange(value);
  };

  const handleOk = () => {
    try {
      //@ts-ignore-next-line
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

  const handleFormSubmitEdit = async () => {
      if(!classDateRange || !timeRange || !classDateRange[0] || !classDateRange[1] || !timeRange[0] || !timeRange[1]){
        message.error("Please select class date range");
        return
      }
      try {
        const dataForm = {
          classCode: formData.classCode,
          batchNumber: formData.batchNumber,
          teacherId: teacherName.value,
          startingLessonId: startLesson,
          endingLessonId: endLesson,
          classStartDate: classDateRange[0].format("YYYY-MM-DDTHH:mm:ss") + ".000Z",
          classEndDate: classDateRange[1].format("YYYY-MM-DDTHH:mm:ss") + ".000Z",
          lessonStartTime: timeRange[0].utc().format("YYYY-MM-DDTHH:mm:ss") + ".000Z",
          lessonEndTime: timeRange[1].utc().format("YYYY-MM-DDTHH:mm:ss") + ".000Z",
          ageGroup: selectedAgeGroup,
          followupVersion: followupVersion,
          //@ts-ignore-next-line
          id: createBatch ? null: currentRow?.id,
          batchAvailability: [{}],
          students: [...studentList],
          edit
        };

        setIsLoading(true);
        // 登录
        const msg = await addeditbatch({
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForm),
        });
        if (msg.success) {
          setShowDetail(false)
          setCurrentRow(undefined)
          // actionRef.current?.reloadAndRest?.();
          if(msg.data[0]?.message){
            message.error(msg.data[0].message);
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }else{
            window.location.reload();
          }
          setIsLoading(false);
        }
      } catch (error: any) {
        setIsLoading(false);
        message.error("Please try again: "+error.message);
      };
  }

  const handleFormDelete = async (id: string) => {
    try {
      // 登录
      const msg = await deleteBatch(id);
      if (msg.success) {
        setShowDetail(false)
        setCurrentRow(undefined)
        actionRef.current?.reloadAndRest?.();
        if(msg.data[0]?.message){
          message.error(msg.data[0].message);
        }
      }
    } catch (error) {
      console.log("Failed");
    };
  }

  const handleFormChange = (e: any) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
  };

  const dateToLocal = (date: string) => format(parseISO(date!), "yyyy-MM-dd") + "T" + format(parseISO(date!), "HH:mm") + ".000Z";

  const prepareEditFormData = (rowval: any) => {
    getIndividualBatch(rowval.id)
      .then((data) => {
        const batchData = data.data;

        if(batchData.classes){
          try{
            data.data.classes.lessonStartTime = dateToLocal(batchData.classes.lessonStartTime);
            data.data.classes.lessonEndTime = dateToLocal(batchData.classes.lessonEndTime);
          }catch(e){
            console.log("BT_S_E", data.data.classes, e);
          }
          // return format(parseISO(entity.lessonStartTime!), "hh:mm") + " - " + format(parseISO(entity.lessonEndTime!), "hh:mm");

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

        let reformatData: any[] = tempObj?tempObj?.batchData?.students.map((elem: any)=>{
          elem.value = elem.studentId
          elem.label =  `${elem?.student?.firstName} ${elem?.student?.lastName} - ${elem?.student?.phoneNumber}`;
          elem.key  =  elem.id
          return elem
        }):[]
        setStudentList([...reformatData])
        setSelectedAgeGroup(tempObj?tempObj.batchData.classes.ageGroup:'')

        if(tempObj?.batchData?.classes?.teacher) { 
          setTeacherName({value: tempObj?.batchData?.classes?.teacherId, 
            label: `${tempObj?.batchData?.classes?.teacher.firstName} ${tempObj?.batchData?.classes?.teacher.lastName}`, 
            key:tempObj?.batchData?.classes?.teacherId})
        }

      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setRenderEdit(true);
        setEdit(true)
      });
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
      render(dom, entity){
        //@ts-ignore-next-line
        if(entity.lessonStartTime){
          try{
            //@ts-ignore-next-line
            return format(parseISO(entity.lessonStartTime!), "hh:mm a");
          }catch(e){
            console.log("format time error", e);
            return "... - ..."
          }
        }
        return "-";
      }
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
            //@ts-ignore-next-line
            <Button type="success">
              <FormattedMessage
                id="pages.searchTable.nameStatus.upcoming"
                defaultMessage="Upcoming"
                //@ts-ignore-next-line
                status="Success"
              />
            </Button>
          ),
        },
        1: {
          text: (
            //@ts-ignore-next-line
            <Button type="warning">
              <FormattedMessage
                id="pages.searchTable.nameStatus.ongoing"
                defaultMessage="Ongoing"
                //@ts-ignore-next-line
                status="Processing"
              />
            </Button>
          ),
        },
        2: {
          text: (
            //@ts-ignore-next-line
            <Button type="lightdark">
              <FormattedMessage
                id="pages.searchTable.nameStatus.completed"
                defaultMessage="Completed"
                //@ts-ignore-next-line
                status="Default"
              />
            </Button>
          ),
        },
        3: {
          text: (
            //@ts-ignore-next-line
            <Button type="danger">
              <FormattedMessage
                id="pages.searchTable.nameStatus.cancelled"
                defaultMessage="Cancelled"
                //@ts-ignore-next-line
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
              setCurrentRow(entity);

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
              setCurrentRow(entity);
              setDeleteConfirmModal(true);
            }}
          >
            <DeleteOutlined />
          </a>
        );
      },
    },
  ];

  const dateFormat = "YYYY-MM-DD";

  const timeSlotHandler = (entity: any): string => {
    try{
      return format(parseISO(entity.lessonStartTime!), "hh:mm a") + " - " + format(parseISO(entity.lessonEndTime!), "hh:mm a")
    }catch(e){
      console.log("timeSlotHandler", e);
    }
    return " - ";
  }

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
              setLeadList([]);
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
                <Spin spinning={isLoading}>
                <Form onFinish={handleFormSubmitEdit}>
                  <Row>
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
                            // @ts-ignore-next-line
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
                            // @ts-ignore-next-line
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
                          onChange={(value,e)=>{handleClassDateRange(value)}}
                          // @ts-ignore-next-line
                          defaultValue={ 
                            // @ts-ignore-next-line
                            prePop?.batchData?.classes?.classEndDate?.length > 0 && prePop?.batchData?.classes?.classStartDate?.length ? [
                              // @ts-ignore-next-line
                              moment(prePop.batchData.classes.classStartDate.split("T")[0], dateFormat),
                              // @ts-ignore-next-line
                              moment(prePop.batchData.classes.classEndDate.split("T")[0], dateFormat),
                            ]: []} 
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
                          disabledMinutes={(h) => new Array(60).fill(0).map((_, i) => i !== 0 && i !== 30 ? i: 1)}
                          // @ts-ignore-next-line
                          defaultValue={
                            // @ts-ignore-next-line
                            prePop?.batchData?.classes?.lessonEndTime?.length > 0 && prePop?.batchData?.classes?.lessonStartTime?.length ?
                            [
                              // @ts-ignore-next-line
                              moment(prePop?.batchData?.classes?.lessonStartTime.split("T")[1], "HH:mm"),
                              // @ts-ignore-next-line
                              moment(prePop?.batchData?.classes?.lessonEndTime.split("T")[1], "HH:mm")
                            ] : []
                          }
                          onChange={(value,e)=>handleTimeRange(value)}
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
                          onChange={(newValue: any) => {
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
                        // @ts-ignore-next-line
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
                          // @ts-ignore-next-line
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
                      > 
                         {studentList?
                        <DebounceSelect
                          mode="tags"
                          value={studentList}
                          placeholder="Select students"
                          fetchOptions={fetchStudentList}
                          // @ts-ignore-next-line
                          options = {currentRow?.id?studentList:[]}
                          // @ts-ignore-next-line
                          defaultValue={currentRow?.id?studentList:null}
                          onChange={(newValue: any) => {
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
                </Form></Spin>:''
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
                <div className="title">{
                  // @ts-ignore-next-line
                  tempData?.batchId
                }</div>
                <Row>
                  <Col span={8}>
                    <div className="label">Creation Date</div>
                    <div className="label">Class Date</div>
                    <div className="label">Created By</div>
                    <div className="label">Assigned Teacher</div>
                    <div className="label">Start Lesson</div>
                    <div className="label">End Lesson</div>
                    <div className="label">Student</div>
                    <div className="label">TimeSlot</div>
                    <div className="label">Status</div>
                  </Col>
                  <Col span={2}>
                    <Divider style={{ height: "300px" }} type="vertical" />
                  </Col>
                  <Col span={12}>
                    <div className="label">
                      {tempData?.date ? tempData.date.split("T")[0] : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.dateSlot}
                    </div>
                    <div className="label">
                      {tempData?.createdBy ? tempData.createdBy : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.teacher ? tempData?.teacher : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.startingLessonId ? "Lesson " + LESSONS.filter(i => tempData?.startingLessonId === i.id)[0]?.number : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.endingLessonId ? "Lesson " + LESSONS.filter(i => tempData?.endingLessonId === i.id)[0]?.number : "NA"}
                    </div>
                    <div className="label">
                      {tempData?.students ? tempData?.students : "NA"}
                    </div>
                    <div className="label">
                      {
                        timeSlotHandler(tempData)
                      }
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
