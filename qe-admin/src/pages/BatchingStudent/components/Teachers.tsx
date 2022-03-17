import React, {useState, useRef} from 'react';
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

export type BatchProps = {
    setSelectedBatch: (v: string) => void;
    selectedBatch: boolean | string;
    data: {}
};

const Batch: React.FC<BatchProps> = (props) => {
    const {selectedBatch, setSelectedBatch} = props;
    const {data} = props;
    const [batch, setBatch] = useState<{value: string, label: string}>();
    const [teacherId, setTeacherId] = useState();

    async function fetchTeachersList(params: {}) {
        return listTeacherAndStudent({
            type: "teacher",
            ...params,
          // pass the rest of filter params here
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
    
    const columns: ProColumns<API.RuleListItem>[] = [
        //date
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
        {
            title: "Select",
            tip: "Select Batch",
            hideInSearch: true,
            render: (dom, entity) => {
              return (
                <a
                  onClick={() => {
                    //@ts-ignore-next-line
                    setTeacherId(dom.id);
                    //@ts-ignore-next-line
                    window.open(window.location.origin + `/manage/batch?teacherId=${dom.id}&teacherName=${dom.name}&add=1`, '_blank').focus();
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

