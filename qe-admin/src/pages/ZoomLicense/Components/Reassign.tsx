import {
    Form,
    Spin,
    Button
} from "antd";
import { useState } from "react";
import {
    listTeacherAndStudent
} from "@/services/ant-design-pro/api";
import DebounceSelect from "@/components/DebounceSelect";

const Reassign = (props: { handleReassignLicense: (from: string, to: string) => any, isLoading: boolean, data: any }) => {
    const { handleReassignLicense, isLoading, data } = props;
    const [teacherName, setTeacherName] = useState<any>({});
    async function fetchUserList(username: string) {
        return listTeacherAndStudent({
            type: 'teacher',
            current: 1,
            pageSize: 5,
            keyword: username
        })
            .then((body: any) =>
                body.data.map((user: any) => ({
                    label: `${user.name}`,
                    value: user.id,
                }))
            );
    }

    const sumbit = () => {
        if (teacherName.value) {
            handleReassignLicense(data.user_id, teacherName.value)
        }
    }

    return (<>
        <Spin spinning={isLoading}>
            <Form onFinish={sumbit} style={{ minHeight: "250px" }}>
                <Form.Item
                    name="teacherId"
                    rules={[
                        {
                            required: true,
                            message: "Please Selecte Teacher",
                        },
                    ]}
                >
                    <DebounceSelect
                        showSearch
                        value={teacherName}
                        placeholder="Select teacher"
                        fetchOptions={fetchUserList}
                        options={[]}
                        onChange={(newValue: any) => {
                            setTeacherName(newValue);
                        }}
                        style={{
                            width: "100%",
                        }}
                    />
                </Form.Item>

                <Button
                    type="primary"
                    onClick={sumbit}
                >
                    Reassign Zoom License
                </Button>
            </Form>
        </Spin>
    </>)
}
export default Reassign;