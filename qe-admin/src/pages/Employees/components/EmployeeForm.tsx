import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import { addNewEmployee, updateExistEmployee } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { Button, Col, Form, Input, Row, Select, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

export type EditEmployeeProps = {
    edit: boolean;
    employeeData: {
        [key: string]: any;
    };
    visible: '';
};

const { Option } = Select;

const Superadmin = { text: "Superadmin", value: "superadmin" };
const Admin = { text: "Admin", value: "admin" };
const pmhead = { text: "PM Head", value: "pmhead" };
const ProgramManager = { text: "Program Manager", value: "programmanager" };
const Sales = { text: "Sales", value: "sales" };
const Saleshead = { text: "Saleshead", value: "saleshead" };
const Finance = { text: "Finance", value: "finance" }

const employeeRoles = [
    Superadmin,
    Admin,
    pmhead,
    ProgramManager,
    Sales,
    Saleshead,
    Finance
];

const EmployeeForm: React.FC<EditEmployeeProps> = (props) => {

    const { edit, visible, employeeData } = props;

    const initialFormData = {
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        role: '',
        status: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    const [selectedEmployee, setSelectedEmployee] = useState<{ role: string, status: string }>({ role: '', status: '' });

    const [isLoading, setIsLoading] = useState(false);



    //validation for phone number
    const handleMobileChange = (value: string) => {
        const number = value;
        setFormData((value) => ({
            ...value,
            phone: number
        }))



    }

    // validation messages for name, email and type fields
    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: '${label} is not a valid email!',
            string: '${label} is not a valid name!',
        },
        string: {
            min: '${label} should be at least two characters'
        },
        pattern: {
            mismatch: '${label} should be a String'
        }
    };

    const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
        setFormData((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }));
    };

    const onFinish = async () => {

        setIsLoading(true);

        let dataForm: any = {
            id: props?.employeeData?.id,
            firstname: formData.firstname ? formData.firstname : props?.employeeData?.firstname,
            lastname: formData.lastname ? formData.lastname : props?.employeeData?.lastname,
            phone: formData.phone ? formData.phone : props?.employeeData?.phone,
            email: formData.email ? formData.email : props?.employeeData?.email,
            role: selectedEmployee.role ? selectedEmployee.role : props?.employeeData?.role,
            status: selectedEmployee.status ? selectedEmployee.status : props?.employeeData?.status
        };

        if (edit) {

            try {

                const msg = await updateExistEmployee({
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataForm),
                });
                handleAPIResponse(msg, "Employee Updated Successfully", "Failed To Update Employee");
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Employee Updated Successfully", "Failed To Update Employee");
            } finally {
                setIsLoading(false);
            }
        }
        else {
            try {
                const { id, ...dataFormWithoutId } = dataForm;

                const msg = await addNewEmployee({
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataFormWithoutId),
                });
                handleAPIResponse(msg, "Employee Added Successfully", "Failed To Add Employee", true);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "Employee Added Successfully", "Failed To Add Employee", false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const [form] = Form.useForm();

    const defaultValues = useCallback(() => {
        if (!visible) return;
        if (edit) {

            const dataToSaveInState = {
                firstname: employeeData?.firstname,
                lastname: employeeData?.lastname,
                phone: employeeData?.phone,
                email: employeeData?.email,
                role: employeeData?.role,
                status: employeeData?.status
            }
            form.setFieldsValue(dataToSaveInState);
            setFormData(dataToSaveInState);
        } else {
            form.resetFields();
            setFormData(initialFormData);
        }
    }, [employeeData, edit, visible]);

    useEffect(() => {
        defaultValues();
    }, [defaultValues]);

    return (
        <>
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                >
                    <Row gutter={16}>
                        {/* ############# firstname ############# */}
                        <Col span={12}>
                            <Form.Item
                                name="firstname"
                                rules={[{
                                    required: true,
                                    type: 'string',
                                }]}
                            >
                                <Input
                                    placeholder="Firstname"
                                    value={formData.firstname}
                                    name="firstname"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        {/* ############## lastname ################# */}
                        <Col span={12}>
                            <Form.Item
                                name="lastname"
                                rules={[{
                                    required: true,
                                    type: 'string',
                                }]}
                            >
                                <Input
                                    placeholder="Lastname"
                                    value={formData.lastname}
                                    name="lastname"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        {/* ############### country code ################ */}

                        <PhoneNumberCountrySelect
                            handleMobileChange={handleMobileChange}
                            phoneNumberName="phone"
                        />


                        {/* ############### Email ############### */}
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        min: 2
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Email"
                                    value={formData.email}
                                    name="email"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        {/* ##################### role ########################3 */}
                        <Col span={12}>
                            <Form.Item name="role">
                                <Select
                                    placeholder="Select Role"
                                    value={selectedEmployee.role}
                                    onChange={(value) => { setSelectedEmployee({ ...selectedEmployee, role: value }) }}
                                >
                                    {employeeRoles.map(role => (<Option value={role.value}>{role.text}</Option>))}
                                </Select>
                            </Form.Item>
                        </Col>
                        {/* ##################### status ########################3 */}
                        <Col span={12}>
                            <Form.Item name="status">
                                <Select
                                    value={selectedEmployee.status}
                                    placeholder="Select Status"
                                    onChange={(value) => { setSelectedEmployee({ ...selectedEmployee, status: value }) }}
                                >
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Button type="primary" htmlType="submit" onClick={() => {
                            }}>
                                {!edit ? "Add Employee" : "Save Changes"}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </>
    );
};

export default EmployeeForm;
