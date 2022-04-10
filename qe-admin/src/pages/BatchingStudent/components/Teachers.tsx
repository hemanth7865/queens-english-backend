import React, {useState, useRef, useEffect} from 'react';
import {
    ClockCircleOutlined,
  } from "@ant-design/icons";
import { Col, Row, Form, TimePicker,Tooltip } from 'antd';
import {
    listTeacherAndStudent,
    listBatch,
} from "@/services/ant-design-pro/api";
import DebounceSelect from "@/components/DebounceSelect";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";
import { parse, format } from "date-fns";
import moment from "moment";
import {
  getLessonByNumber, timeISTToLocalTimezone
} from "@/services/ant-design-pro/helpers";

export type BatchProps = {
    setSelectedBatch: (v: string) => void;
    selectedBatch: boolean | string;
    data: {
      timings?: string;
      courseFrequency?: string;
      startDate?: Date,
      startLesson?: string,
    }
};

const Batch: React.FC<BatchProps> = (props) => {
    const {setSelectedBatch} = props;
    const {data} = props;
    const [batch, setBatch] = useState<{value: string, label: string}>();
    const [teacherId, setTeacherId] = useState();

    const lesson = getLessonByNumber(data.startLesson);

    async function fetchTeachersList(params: {}) {
        const defaultFilter: {
          start_slot?: string;
          end_slot?: string;
          weekday?: string;
          frequency?: string;
          autoSearch?: boolean
        } = {
          autoSearch: true
        };
        if(data?.timings && data?.timings.length > 0){
          defaultFilter.start_slot = data?.timings.slice(0, 5);
          let end_slot_info = defaultFilter.start_slot.split(":");
          if(end_slot_info.length > 1){
            defaultFilter.end_slot = `${parseInt(end_slot_info[0]) + 1}:${end_slot_info[1]}`;
          }
        }

        if(data?.courseFrequency){
          let frequencies = {
            MWF: "1,3,5",
            SS: "6,0",
            TTS: "2,4,6",
            MTWTF: "1,2,3,4,5"
          };


          defaultFilter.weekday = frequencies[data?.courseFrequency] || "";
          defaultFilter.frequency = data?.courseFrequency;
        }

        return listTeacherAndStudent({
            type: "teacher",
            ...params,
          // pass the rest of filter params here
          ...defaultFilter,
        });
    }

    async function fetchAllBatchList(b: string) {
        return listBatch({
            current: 1,
            pageSize: 5,
            //@ts-ignore-next-line
            batchId: b,
            // pass the rest of filter params here
        }).then((body) =>
            //@ts-ignore-next-line
            body.data.map((b) => ({
                //@ts-ignore-next-line
                label: b.batchId,
                //@ts-ignore-next-line
                value: b.id,
            })
        ));
    }

    const actionRef = useRef<ActionType>();

    useEffect(() => {
      actionRef?.current?.reload();
    } , [props.data]);

    const createBatch = (dom: any) => {
      let startDate = moment(data.startDate, "YYYY-MM-DD").format("YYYY-MM-DD");
      let endDate = moment(startDate, "YYYY-MM-DD").add('years', 1).format("YYYY-MM-DD");
      let startTime = moment(timeISTToLocalTimezone(data.timings), "HH:mm").format("HH:mm");
      let endTime = moment(startTime, "HH:mm").add('hours', 1).format("HH:mm");

      const linkParams: string[] = [
        `teacherId=${dom.id}`,
        `teacherName=${dom.name}`,
        `add=1`,
      ];

      if(data.startDate && startDate !== "Invalid date"){
        linkParams.push(`startDate=${startDate}`);
        linkParams.push(`endDate=${endDate}`);
      }

      if(data.timings && startTime !== "Invalid date"){
        linkParams.push(`startTime=${startTime}`);
        linkParams.push(`endTime=${endTime}`);
      }

      if(lesson?.id){
        linkParams.push(`startLesson=${lesson.id}`);
      }

      if(data.courseFrequency){
        linkParams.push(`frequency=${data.courseFrequency}`);
      }

      let params: string = linkParams.join("&");

      window?.open(window.location.origin + `/manage/batch?${params}`, '_blank')?.focus();
    }

    const columns: ProColumns<API.RuleListItem>[] = [
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titlemobileno"
              defaultMessage="Phone Number"
            />
          ),
          dataIndex: "phoneNumber",
        },
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
              id="pages.searchTable.titleExperience"
              defaultMessage="Experience"
            />
          ),
          dataIndex: "totalexp",
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titleClassesTaken"
              defaultMessage="Classes Taken"
            />
          ),
          dataIndex: "classesTaken",
        },
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
        {
            title: "Select",
            tip: "Select Batch",
            hideInSearch: true,
            render: (dom: any, entity) => {
              return (
                <a
                  onClick={() => {
                    setTeacherId(dom.id);
                    createBatch(dom);
                  }}
                >
                  Create Batch
                </a>
              );
            },
          },
      ];

    return(
        <Row gutter={16}>
            <Col span={24}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={"Teachers"}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                        labelWidth: 120,
                    }}
                    request={fetchTeachersList}
                    columns={columns}
                    pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30']}}
                />
            </Col>
            <Col span={24} key={teacherId}>
                <p>Please Select Student Batch From Here After Completing Batch Creation.</p>
                <Form.Item name="batchId">
                    <DebounceSelect
                        showSearch
                        value={batch}
                        placeholder="Select Batch"
                        fetchOptions={fetchAllBatchList}
                        options = {[]}
                        onChange={(newValue: {value: string, label: string}) => {
                            setSelectedBatch(newValue.value)
                            setBatch(newValue);
                        }}
                        style={{
                            width: "100%",
                        }}
                    />
                </Form.Item>
            </Col>
        </Row>
    )
}
    
export default Batch;

