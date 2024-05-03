import React, { useEffect, useState } from "react";
import { Button, Checkbox, Col, Form, Row, Select, Spin } from "antd";
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import { listSchool, addUserSchedule } from "@/services/ant-design-pro/api";

import { handleAPIResponse, openNotificationWithIcon } from "@/services/ant-design-pro/helpers";
import { useAccess } from "umi";

const StudentUser = { text: "Student", value: "student" };
const TeacherUser = { text: "Teacher", value: "teacher" };
const BothUser = { text: "Both", value: "both" };

const userTypes = [StudentUser, TeacherUser, BothUser];

export type UserFormProps = {
    visible: boolean;
    onSuccess?: () => void;
    isEdit?: boolean;
    userData?: {
        id?: string,
        firstName?: string,
        lastName?: string,
        phoneNumber?: string,
        email?: string,
        classSection?: string,
        type?: "student" | "teacher",
        offlineUser?: "0" | "1",
        schoolId?: string,
        demoAccount?: boolean,
        [key: string]: any;
    };
    disabled?: {
        offlineUser?: boolean;
        type?: boolean;
        [key: string]: any;
    }
};

const UserForm: React.FC<UserFormProps> = ({
    isEdit,
    userData,
    onSuccess,
    visible,
    disabled
}) => {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState
        ({
            id: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            classSection: "",
            type: "",
            offlineUser: "0",
            schoolId: "",
            demoAccount: false,
        });
    const [isLoading, setIsLoading] = useState(true);
    const [schools, setSchools] = useState<any[]>([]);

    useEffect(() => {
        if (visible)
            if (userData) {
                setFormData({
                    id: userData?.id ?? "",
                    firstName: userData?.firstName ?? "",
                    lastName: userData?.lastName ?? "",
                    phoneNumber: userData?.phoneNumber ?? "",
                    email: userData?.email ?? "",
                    classSection: userData?.classSection ?? "",
                    type: userData?.type ?? "",
                    offlineUser: userData?.offlineUser ? "1" : "0",
                    schoolId: userData?.schoolId ?? "",
                    demoAccount: userData?.demoAccount ?? false,
                });

                form.setFieldsValue({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber,
                    email: userData.email,
                    classSection: userData.classSection ?? "",
                    type: userData.type,
                    offlineUser: userData.offlineUser ? "1" : "0",
                    schoolId: userData.schoolId,
                    demoAccount: userData.demoAccount ?? false,
                });
            } else {
                setFormData({
                    id: "",
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    email: "",
                    classSection: "",
                    type: "",
                    offlineUser: "0",
                    schoolId: "",
                    demoAccount: false,
                });
                form.resetFields();
            }
    }, [isEdit, userData, visible]);

    const getSchools = async () => {
        try {
            setIsLoading(true);
            const response = await listSchool({ onlySchools: true });
            setSchools(response.data ?? []);
        } catch (error: any) {
            openNotificationWithIcon("error", error?.message || "Failed to fetch schools", false);
            console.error("Error fetching schools: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("visible", visible);
        if (visible) getSchools();
    }, [visible]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const onFinish = async () => {
        setIsLoading(true);
        const dataForm = { ...formData };
        try {
            if (isEdit) await updateUser(dataForm);
            else await addUser(dataForm);

            onSuccess?.();
        } catch (error: any) {
            openNotificationWithIcon("error", error?.message || "Failed to process user", false);
            console.error("Error processing user: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPhoneNumberChange = (value: string) => {
        console.log("phone number", value);
        setFormData({ ...formData, phoneNumber: value });
    };

    const addStudentTeacher = async (
        data: typeof formData,
        userType: string,
        ignoreDuplicateCheck: boolean = false
    ) => {
        setIsLoading(true);
        let dataForm: typeof formData & {
            status: string;
        } = {
            ...data,
            type: userType,
            status: "active",
        };

        // remove undefined keys
        Object.keys(dataForm).forEach((key) => {
            if (dataForm[key] === undefined || dataForm[key] === "") {
                delete dataForm[key];
            }
        });

        console.log("dataForm from addStudentTeacher", dataForm);
        try {
            const msg = await addUserSchedule({
                params: {
                    ignoreDuplicateCheck,
                },
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            handleAPIResponse(
                msg,
                "User Added Successfully",
                "Failed To Add User",
                true
            );
        } catch (error: any) {
            openNotificationWithIcon("error", error?.message || "Failed To Add User", false);
        }
    };

    const addUser = async (data: typeof formData) => {
        if (data.type === BothUser.value) {
            await addStudentTeacher(data, TeacherUser.value, true);
            await addStudentTeacher(data, StudentUser.value, true);
        } else {
            await addStudentTeacher(data, data.type, true);
        }
    };

    const updateUser = async (data: typeof formData) => {
        let dataForm = { ...data };
        try {
            // 登录
            // remove undefined keys
            Object.keys(dataForm).forEach((key) => {
                if (dataForm[key] === undefined || dataForm[key] === "") {
                    delete dataForm[key];
                }
            });

            console.log("data form update", dataForm);
            const msg = await addUserSchedule({
                headers: {
                    "Content-Type": "application/json",
                },
                params: {
                    ignoreDuplicateCheck: true,
                },
                body: JSON.stringify(dataForm),
            });
            handleAPIResponse(
                msg,
                "User Updated Successfully",
                "Failed To Update User",
                true,
            );
        } catch (error: any) {
            openNotificationWithIcon("error", error?.message || "Failed To Update User", false);
        }
    };

    return (
        <Spin spinning={isLoading}>
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Row gutter={16}>
                    <FormItem
                        label="First Name"
                        name="firstName"
                        onChange={handleInputChange}
                    />
                    <FormItem
                        label="Last Name"
                        name="lastName"
                        onChange={handleInputChange}
                    />
                    <PhoneNumberCountrySelect handleMobileChange={onPhoneNumberChange} />
                    <FormItem
                        label="Email"
                        name="email"
                        type="email"
                        onChange={handleInputChange}
                    />
                    <UserTypeSelect
                        value={formData.type}
                        onChange={(value: string) =>
                            setFormData((prev) => ({ ...prev, type: value }))
                        }
                        disabled={isEdit || !!disabled?.type}
                    />
                    <OfflineUserSelect
                        value={formData.offlineUser}
                        onChange={(value: string) =>
                            setFormData((prev) => ({ ...prev, offlineUser: value }))
                        }
                        disabled={disabled?.offlineUser}
                    />
                    <DemoAccountCheckbox
                        value={formData.demoAccount}
                        onChange={(value) =>
                            setFormData((prev) => ({ ...prev, demoAccount: value }))
                        }
                    />
                    {formData.offlineUser === "1" && (
                        <Col span={24}>
                            <Row gutter={16}>
                                <SchoolSelect
                                    schools={schools}
                                    value={formData.schoolId}
                                    onChange={(value) => {
                                        setFormData((prev) => ({ ...prev, schoolId: value }));
                                    }}
                                />
                                {!isEdit && (
                                    <FormItem
                                        label="Class Section"
                                        placeholder="ex: 1A / 4C"
                                        name="classSection"
                                        onChange={handleInputChange}
                                    />
                                )}
                            </Row>
                        </Col>
                    )}

                    <Col span={24}>
                        <Button type="primary" htmlType="submit" block>
                            {isEdit ? "Update User" : "Add User"}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Spin>
    );
};

export default UserForm;


type UserTypeSelectProps = {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
};

const UserTypeSelect = ({ value, onChange, disabled }: UserTypeSelectProps) => {
    return (
        <Col span={12}>
            <Form.Item name="type" label="User Type" rules={[{ required: true }]}>
                <Select
                    value={value}
                    defaultValue={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    {userTypes.map((type) => (
                        <Select.Option key={type.value} value={type.value}>
                            {type.text}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Col>
    );
};

type SchoolSelectProps = {
    schools: Array<{ id: string; schoolName: string; schoolCode: string }>;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const SchoolSelect = ({
    schools,
    value,
    onChange,
    disabled,
}: SchoolSelectProps) => {
    return (
        <Col span={12}>
            <Form.Item name="schoolId" label="School" rules={[{ required: true }]}>
                <Select
                    placeholder="Select School"
                    value={value}
                    defaultValue={value}
                    onChange={(value: string) => onChange(value)}
                    disabled={disabled}
                >
                    {schools.map((school) => (
                        <Select.Option key={school.id} value={school.id}>
                            {`${school.schoolName} ~ ${school.schoolCode}`}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Col>
    );
};

type OfflineUserSelectProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const OfflineUserSelect = ({
    value,
    onChange,
    disabled,
}: OfflineUserSelectProps) => {
    return (
        <Col span={12}>
            <Form.Item
                name="offlineUser"
                label="Offline User"
                rules={[{ required: true }]}
            >
                <Select
                    defaultValue={value}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    <Select.Option value="0">Online</Select.Option>
                    <Select.Option value="1">Offline</Select.Option>
                </Select>
            </Form.Item>
        </Col>
    );
};

const DemoAccountCheckbox = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}) => {
    const access = useAccess();
    return (
        <Col span={12}
            style={{
                display: "flex",
                alignItems: "flex-end",
            }}
        >
            <Form.Item name="demoAccount" valuePropName="checked">
                <Checkbox onChange={(e) => onChange(e.target.checked)} checked={value}
                    disabled={!access.canSuperAdmin}
                >
                    Demo Account
                </Checkbox>
            </Form.Item>
        </Col>
    );
};
