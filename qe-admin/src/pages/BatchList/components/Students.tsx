import React, {useRef} from 'react';
import { Col, Row, List } from 'antd';
import {
    listTeacherAndStudent,
} from "@/services/ant-design-pro/api";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";

type list = {
  label: string | number;
  value: string | number;
};

export type Props = {
  value: list[];
  defaultValue: list[];
  options: list[];
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

    const remove = (id: string) => {
      onChange(value.filter((i: list) => i.value !== id))
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
                      remove(dom.id)
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


    const listColumns: ProColumns<list>[] = [
      {
        title: (
          <FormattedMessage
            id="pages.searchTable.student"
            defaultMessage="Student"
          />
        ),
        dataIndex: "label",
      },
      {
          title: "Select",
          tip: "Select Student",
          hideInSearch: true,
          render: (dom: any, entity) => {
            const selected = value.filter((i: list) => i.value === dom.value)[0];
            return (
              <a
                style={selected ? { color: 'red' } : {}}
                onClick={() => {
                  if(selected){
                    remove(dom.value)
                  }else{
                    onChange([...value, {label: `${dom.name} - ${dom.phoneNumber}`, value: dom.value}])
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
        <Row gutter={0}>
            <Col span={24}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={"Select Batch Students"}
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
                    pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30']}}
                />
            </Col>

            <Col span={24} style={{marginTop: 10}}>
                <ProTable<list, API.PageParams>
                    headerTitle={"Selected Students"}
                    rowKey="key"
                    search={false}
                    columns={listColumns}
                    dataSource={value}
                    pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30']}}
                />
            </Col>
        </Row>
    )
}
    
export default Batch;

