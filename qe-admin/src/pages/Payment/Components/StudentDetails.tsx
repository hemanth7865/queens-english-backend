import React from 'react';
import { List } from 'antd';

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

const StudentDetails: React.FC<Props> = (props) => {
    const { value } = props;

    const detailsStudent = value.label?.split(" -- ");
    const data = [
        `name:   ${detailsStudent[0]}`,
        `RMN:   ${detailsStudent[1]}`,
        `Start Date:   ${detailsStudent[2]}`,
        `Whatsapp:   ${detailsStudent[3]}`,
        `Lead ID:   ${detailsStudent[4]}`,
    ]

    return (
        <List
            size="large"
            header={<div style={{ textAlign: "center" }}>Student Details</div>}
            bordered
            dataSource={data}
            renderItem={item => <List.Item>{item}</List.Item>}
        />

    )
}

export default StudentDetails;

