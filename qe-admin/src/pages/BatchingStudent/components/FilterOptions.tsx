import React, {useState, useEffect, useRef} from 'react';
import { Col, Row, Form, Button, notification, Tabs, TimePicker, message, Spin } from 'antd';
import {
    listBatch,
    addeditbatch,
    getIndividualBatch,
    updateUserStatus
} from "@/services/ant-design-pro/api";
import {
  getLessonByNumber, timeISTToTimezone, timeToLocalTimezone
} from "@/services/ant-design-pro/helpers";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";
import Teachers from "./Teachers";
import {LESSONS} from "../../../../config/lessons";
import moment from "moment";

export type Props = {
    data: any;
    setData: (data: any) => any;
};
const FilterOptions: React.FC<Props> = ({data, setData}) => {
    return (
        <>
        </>
    )
}

export default FilterOptions;