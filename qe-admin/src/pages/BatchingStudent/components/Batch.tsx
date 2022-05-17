import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Form,
  Button,
  notification,
  Tabs,
  message,
  Spin,
} from "antd";
import {
  listBatch,
  addeditbatch,
  getIndividualBatch,
  updateUserStatus,
} from "@/services/ant-design-pro/api";
import {
  getLessonByNumber,
  timeISTToTimezone,
  timeToLocalTimezone,
} from "@/services/ant-design-pro/helpers";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";
import Teachers from "./Teachers";
import { LESSONS } from "../../../../config/lessons";
import moment from "moment";
import FilterOptions from "./FilterOptions";
import { format } from "prettier";

const { TabPane } = Tabs;

export type BatchProps = {
  data: any;
  visible: boolean;
  setVisible: (value: boolean) => void;
  onUpdate?: () => void;
  onFinish?: (id: string) => any;
  filterTheme?: string;
  currentBatch?: any;
  filterCallBack?: (data: any) => any;
};

const Batch: React.FC<BatchProps> = (props) => {
  const [selectedBatch, setSelectedBatch] = useState<boolean | string>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [excludedTeacher, setExcludedTeacher] = useState<string>();
  const [data, setData] = useState(props.data);
  const rebatching = props.filterTheme == "RE_BATCHING";
  const currentBatch = props.currentBatch;


  console.log(data);

  const { id, timings, startLesson, dob, courseFrequency, startDate, course } =
    data;

  const lesson = getLessonByNumber(startLesson);

  //console.log('active lesson id: '+JSON.stringify(currentBatch));

  async function fetchBatchList(params: {}) {
    let fixedFilter: {
      activeLessonId?: string;
      dob?: Date;
      age?: number;
      frequency?: string;
      lessonStartTime?: string;
      lessonEndTime?: string;
      classStartDate?: string;
      maxStudentsCount?: number;
      excludedTeacher?: string;
      excludeCurrentBatchId?: string;
      lessonGap?: number;
      classEndDate: string;
    } = {
      maxStudentsCount: 7,
      lessonGap: 10,
      classEndDate: moment().format("YYYY-MM-DD"),
    };

    if (lesson?.id) {
      fixedFilter.activeLessonId = lesson.id;
    }

    if (dob && dob.length > 0) {
      fixedFilter.dob = dob;
      fixedFilter.age = moment(new Date()).diff(
        moment(dob, "YYYY-MM-DD"),
        "years",
        true
      );
    }

    if (courseFrequency && courseFrequency.length > 0) {
      fixedFilter.frequency = courseFrequency.split(" ")[0]; // make sure to get the frequency only in case there's a space
    }

    /**
     * Ignore start date
     */
    // if(startDate && startDate.length > 0){
    //   fixedFilter.classStartDate = startDate.split("T")[0];
    // }

    if (timings && timings.length > 0) {
      fixedFilter.lessonStartTime = timeISTToTimezone(timings);
    }

    if (excludedTeacher && excludedTeacher.length > 0) {
      fixedFilter.excludedTeacher = excludedTeacher;
    }

    if (rebatching) {
      fixedFilter.excludeCurrentBatchId = currentBatch?.id;
    }

    return listBatch({
      ...params,
      // pass th rest of filter params here
      ...fixedFilter,
    });
  }

  const reload = () => {
    actionRef?.current?.reload();
  };

  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (data.id !== props.data?.id) {
      setData(props.data);
      setExcludedTeacher(undefined);
    }
    setSelectedBatch(false);
    reload();
  }, [props.data, data]);

  const openNotificationWithIcon = (
    type: string,
    msg = { status: 200, data: "Error received during adding batch" }
  ) => {
    notification[type]({
      message: `Status ${type}`,
      description: msg.data,
    });
  };

  const submitUpdateStudent = async (value: any) => {
    const msg = await updateUserStatus({
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });
    if (value.status !== "createBatch") {
      if (msg.status === 400) {
        openNotificationWithIcon("error", {
          status: 400,
          data: "Failed To Mark Student Status As Onboarding",
        });
      } else {
        openNotificationWithIcon("success", {
          status: 400,
          data: "Student Status Is Onboarding",
        });
      }
    } else {
      if (msg.status === 400) {
        openNotificationWithIcon("error", {
          status: 400,
          data: "Failed To Mark Student Status As Create Batch",
        });
      } else {
        openNotificationWithIcon("success", {
          status: 400,
          data: "Student Status Is Create Batch",
        });
      }
    }

    return msg;
  };

  const onFinish = async () => {
    if (!rebatching && data.batchCode?.length > 0) {
      alert(`Student is part of batch ${data.batchCode}, Please remove student from this batch, then try to add again.`);
      return false;
    }
    setIsLoading(true);
    let success = true;
    if (props.onFinish && typeof selectedBatch === "string") {
      const propsResult = await props.onFinish(selectedBatch);
      if (propsResult === false) {
        success = false;
        setIsLoading(false);
        return success;
      }
      const result = await submitUpdateStudent({
        ...props.data,
        status: "onboarding",
        callStatus: "",
        callBackon: "",
        waMessageSent: "",
      });

      if (result.status !== 200) {
        success = false;
      }
    }

    if (id && typeof selectedBatch === "string" && !props.onFinish) {
      let dataForm = {};
      try {
        const batchDetails = await (
          await getIndividualBatch(selectedBatch)
        ).data;

        // @ts-ignore-next-line
        dataForm = {
          ...batchDetails.classes,
          edit: true,
          students: [{ value: id }],
          batchAvailability: [{}],
        };
        // @ts-ignore-next-line
        if (dataForm.teacher) {
          // @ts-ignore-next-line
          delete dataForm.teacher;
        }

        // @ts-ignore-next-line
        for (let student of batchDetails.students) {
          // @ts-ignore-next-line
          if (
            !dataForm.students.filter((s) => s.value === student.id).length > 0
          ) {
            // @ts-ignore-next-line
            dataForm.students.push({ value: student.studentId });
          }
        }

        const msg = await addeditbatch({
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForm),
        });

        if (msg.success) {
          if (msg.data[0]?.message) {
            success = false;
            setIsLoading(false);
            message.error(msg.data[0].message);
          } else {
            openNotificationWithIcon("success", {
              data: "Completed Adding Student To Batch, Marking Student As Onboard...",
              status: 200,
            });

            const result = await submitUpdateStudent({
              ...props.data,
              status: "onboarding",
            });

            if (result.status !== 200) {
              success = false;
            }
          }
        } else {
          openNotificationWithIcon("error", {
            data: "Failed To Complete Adding Student To Batch",
            status: 400,
          });
          success = false;
        }
      } catch (error) {
        success = false;
        message.error("Something went wrong while adding student to batch.");
        console.log("add student to batch error", error);
      }
    }

    setIsLoading(false);
    if (success) {
      // @ts-ignore-next-line
      props.setVisible(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleNeedBatch = async (data: any) => {
    if (
      confirm("Are you sure you want to move student to create batch stage?")
    ) {
      setIsLoading(true);
      let success = true;
      const result = await submitUpdateStudent({
        ...data,
        status: "createBatch",
        callStatus: "",
        callBackon: "",
        waMessageSent: "",
      });
      if (result.status !== 200) {
        success = false;
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      setIsLoading(false);
    }
  };

  const columns: ProColumns<API.RuleListItem>[] = [
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
          id="pages.searchTable.titleTeacher"
          defaultMessage="Teacher"
        />
      ),
      dataIndex: "teacher",
      valueType: "textarea",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudents"
          defaultMessage="Students"
        />
      ),
      dataIndex: "students",
      valueType: "textarea",
    },
    {
      title: "Lessons",
      dataIndex: "lessons",
      render(dom, entity: any) {
        const startLesson = LESSONS.filter((l) =>
          entity.startingLessonId ? l.id === entity.startingLessonId : false
        )[0]?.number;
        const endLesson = LESSONS.filter((l) =>
          entity.endingLessonId ? l.id === entity.endingLessonId : false
        )[0]?.number;
        return `${startLesson || "NA"} To ${endLesson || "NA"}`;
      },
    },
    {
      title: "Active Lesson",
      dataIndex: "activeLesson",
      render(dom, entity: any) {
        const activeLesson = LESSONS.filter((l) =>
          entity.activeLessonId ? l.id === entity.activeLessonId : false
        )[0]?.number;
        return activeLesson || "NA";
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleFrequency"
          defaultMessage="Frequency"
        />
      ),
      dataIndex: "frequency",
      valueType: "textarea",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTimeSlot"
          defaultMessage="Time Slot"
        />
      ),
      dataIndex: "timeSlot",
      render: (data: any) => {
        if (data.length > 0 && data.split("-").length > 1) {
          const [start, end] = data.split("-");
          return `${timeToLocalTimezone(start)} - ${timeToLocalTimezone(end)}`;
        }
        return "... - ...";
      },
    },
    {
      title: "Select",
      tip: "Select Batch",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              // @ts-ignore-next-line
              setSelectedBatch(dom.id);
            }}
          >
            {
              // @ts-ignore-next-line
              selectedBatch === dom?.id ? "Selected" : "Select"
            }
          </a>
        );
      },
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <FilterOptions
        data={data}
        setData={setData}
        reload={reload}
        filterTheme={props.filterTheme}
        currentBatch={props.currentBatch}
        setExcludedTeacher={setExcludedTeacher}
        excludedTeacher={excludedTeacher}
        filterCallBack={props.filterCallBack}
      />
      <Form onFinish={onFinish}>
        <Tabs
          defaultActiveKey={
            ["IELTS - 1:1", "DISE - 1:1"].includes(course) ? "2" : "1"
          }
          key={course}
        >
          <TabPane tab="Batch" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="batchId">
                  <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={"Batches"}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                      labelWidth: 120,
                    }}
                    toolBarRender={() => []}
                    request={fetchBatchList}
                    columns={columns}
                    pagination={{
                      defaultPageSize: 5,
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20", "30"],
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Teacher" key="2">
            <Teachers
              data={data}
              selectedBatch={selectedBatch}
              setSelectedBatch={setSelectedBatch}
            />
          </TabPane>
        </Tabs>

        <Row gutter={16}>
          <Col>
            <Button type="primary" htmlType="submit" disabled={!selectedBatch}>
              {rebatching ? "Re-batch Student" : "Add Student To Batch"}
            </Button>
          </Col>
          <Col>
            <Button onClick={() => handleNeedBatch(data)}>Create Batch</Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

export default Batch;
