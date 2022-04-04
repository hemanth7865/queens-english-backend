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
import { parse, format } from "date-fns";
import moment from "moment";
import {
  getLessonByNumber, timeISTToLocalTimezone
} from "@/services/ant-design-pro/helpers";

type list = {
  label: string | number;
  value: string | number;
};

export type Props = {
  value: list[];
  defaultValue: list[];
  options: list[];
  fetchStudentList: (params: any) => Promise<list[]>;
  onChange: (data: list[]) => void;

};

const Batch: React.FC<Props> = (props) => {
    const {onChange, value} = props;

    const actionRef = useRef<ActionType>();

    async function fetchStudentList(params: any) {
      return listTeacherAndStudent(
        {
          current: 1,
          pageSize: 5,
          type: 'student',
          ...params
        }
      )
    }

    const columns: ProColumns<API.RuleListItem>[] = [
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.student"
              defaultMessage="Name"
            />
          ),
          dataIndex: "name",
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.student"
              defaultMessage="Phone Number"
            />
          ),
          dataIndex: "phoneNumber",
          search: false,
        },
        {
            title: "Select",
            tip: "Select Student",
            hideInSearch: true,
            render: (dom: any, entity) => {
              const selected = value.filter((i: list) => i.value === dom.id)[0];
              return (
                <a
                  style={selected ? { color: 'red' } : {}}
                  onClick={() => {
                    if(selected){
                      onChange(value.filter((i: list) => i.value !== dom.id))
                    }else{
                      onChange([...value, {label: `${dom.name} - ${dom.phoneNumber}`, value: dom.id}])
                    }
                  }}
                >
                  {selected ? "Remove Student" : "Select Student"}
                </a>
              );
            },
          },
      ];

    return(
        <Row gutter={16}>
            <Col span={24}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={"Students"}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                      defaultCollapsed:true, 
                      labelWidth: 60,
                      split: false,
                      className: "batch-select-student-form"
                    }}
                    request={fetchStudentList}
                    columns={columns}
                    toolBarRender = { false }
                    pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30']}}
                />
            </Col>

            <Col>
                  {value.map((item, index) => {
                    return (
                      <div>{item.label}</div>
                    )
                  })}
            </Col>
        </Row>
    )
}
    
export default Batch;

