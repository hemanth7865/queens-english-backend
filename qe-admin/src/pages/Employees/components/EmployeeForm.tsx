// @ts-nocheck
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import { addNewEmployee, updateExistEmployee } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { placeOrder } from "@/services/swagger/store";
import { Button, Col, Form, Input, Row, Select, Spin } from 'antd';

import {

    isValidPhoneNumber,
    validatePhoneNumberLength
} from 'libphonenumber-js';
import React, { useCallback, useEffect, useState } from 'react';

export type EditEmployeeProps = {
    employeeData: {};
    visible: '';
    setVisible: () => void;
    onUpdate: () => void;
};

const { Option } = Select;

const Superadmin = { text: "Superadmin", value: "superadmin" };
const Admin = { text: "Admin", value: "admin" };
const pmhead = { text: "PM Head", value: "pmhead" };
const ProgramManager = { text: "Program Manager", value: "programmanager" };
const Sales = { text: "Sales", value: "sales" };
const Saleshead = { text: "Saleshead", value: "saleshead" };
const Finance ={ text :"Finance", value: "finance" }

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

    const { edit, visible, setVisible, employeeData } = props
    const { firstname, lastname, email, phone, key, status, id, role } = employeeData ? employeeData : '';

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
    const [selectedCountry, setSelectedCountry] = useState({ code: 'IN', dialCode: 91 });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reload, setReload] = useState(0);

    const refresh = () => setReload((e) => e + 1);


    //validation for phone number
    const handleMobileChange = (event: any) => {
        const number = event.target.value

        const message = isValidPhoneNumber(number, selectedCountry.code ? selectedCountry.code : 'IN')

        const msg = validatePhoneNumberLength(number, selectedCountry.code ? selectedCountry.code : 'IN')

        switch (msg) {
            case 'TOO_LONG':
                setError('Phone number is too long')
                break;
            case 'TOO_SHORT':
                setError('Phone number is too short')
                break;
            case 'NOT_A_NUMBER':
                setError('Not a Number')
                break;
            case 'INVALID_COUNTRY':
                setError('Please Select country first')
                break;
            case undefined:
                setError('')
                break;
            default:
                setError('Phone number is Invalid')
        }

        setFormData((value) => ({
            ...value,
            phone: event.target.value
        }))


        if (message === false && msg === undefined) {
            setError('Enter a valid Mobile Number')
        }
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
        if (error) return;

        setIsLoading(true);

        var code = selectedCountry ? selectedCountry.dialCode : '91';

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
                props.setVisible(false);
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
                props.setVisible(false);
                setIsLoading(false);
            }
        }
    };

    const [form] = Form.useForm();

    const defaultValues = useCallback(() => {

        const last10Digits = phone?.substring(phone?.length - 10);

        const dataToSaveInState = {
            firstname: firstname,
            lastname: lastname,
            phone: last10Digits || "",
            email: email,
            role: role,
            status: status
        }
        form.setFieldsValue(dataToSaveInState);
        setFormData(dataToSaveInState);
    }, [firstname, lastname, phone, email, role, status, edit])

    useEffect(() => {
        defaultValues();
    }, [defaultValues]);

    return (
        <div>
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                    key={reload}
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
                            key={props?.employeeData?.id}
                            handleMobileChange={handleMobileChange}
                            setSelectedCountry={setSelectedCountry}
                            defaultValue={props?.employeeData?.phone}
                            value={formData?.phone}
                           
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
        </div>
    );
};

export default EmployeeForm;
