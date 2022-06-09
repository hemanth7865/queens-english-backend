// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker, notification, Spin } from 'antd';
import moment from "moment";
import { studentBatches, addUserSchedule } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import {
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    validatePhoneNumberLength,
    parsePhoneNumber,
    getCountries,
    getCountryCallingCode
} from 'libphonenumber-js'
import * as CountryList from 'country-list'
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";

export type EditUserProps = {
    data: {};
    visible: '';
    setVisible: () => void;
    onUpdate: () => void;
};

const { Option } = Select

const EditUser: React.FC<EditUserProps> = (props) => {
    //console.log('data', props.data, props.visible, props.setVisible)
    const { firstName, lastName, email, phoneNumber, type, key } = props.data ? props.data : ''
    // console.log('first', firstName, lastName, email, type, key)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
    })

    const [selectUserType, setSelectUserType] = useState('')
    const [error, setError] = useState('')
    const [selectCountry, setSelectCountry] = useState('')
    const [selectCountryCode, setSelectCountryCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const allCountries = CountryList.getData()
    const allCountryCodes = getCountries()
    const [clearCache, setClearCache] = useState(false);
    const countryCodes = allCountryCodes.map((code) => {
        return getCountryCallingCode(code)
    })

    //default country India
    const defaultCountry = allCountries.filter(country => country.name === 'India')

    //Displaying all countries in select option
    const handleCountry = (value) => {
        console.log('selected country', value)
        if (value) {
            const code = CountryList.getCode(value)
            const codeNumber = getCountryCallingCode(code)
            //console.log('code', code, codeNumber)
            setSelectCountry(code)
            setSelectCountryCode(codeNumber)
        }
    }


    //validation for phone number
    const handleMobileChange = (event) => {
        const number = event.target.value
        const message = isValidPhoneNumber(number, selectCountry ? selectCountry : 'IN')
        //console.log('msg', message, msg)
        const msg = validatePhoneNumberLength(number, selectCountry ? selectCountry : 'IN')
        if (msg === 'TOO_LONG') {
            setError('Phone number is too long')
        } else if (msg === 'TOO_SHORT') {
            setError('Phone number is too short')
        } else if (msg === 'NOT_A_NUMBER') {
            setError('Not a Number')
        } else if (msg === 'INVALID_COUNTRY') {
            setError('Please Select country first')
        } else if (msg === undefined) {
            setError('')
        } else {
            setError('Phone number is Invalid')
        }
        if (message === true && msg === undefined) {
            setFormData((value) => ({
                ...value,
                [event.target.name]: event.target.value
            }))
        }
        if (message === false && msg === undefined) {
            setError('Enter a valid Mobile Number')
        }


    }


    //validation messages for name, email and type fields
    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: '${label} is not a valid email!',
            string: '${label} is not a valid name!',
        },
        string: {
            min: '${label} should be altleast two characters'
        },
        pattern: {
            mismatch: '${label} should be a String'
        }
    };


    const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
        console.log('val', event.target.value, event)
        // event.defaultPrevented
        setFormData((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const onFinish = async () => {
        setIsLoading(true);
        console.log('form submitted')
        var code = selectCountryCode ? selectCountryCode : '91';
        if (!error) {
            let dataForm = {
                firstName: formData.firstName ? formData.firstName : props.data.firstName,
                lastName: formData.lastName ? formData.lastName : lastName,
                phoneNumber: formData.phoneNumber ? formData.phoneNumber : phoneNumber,
                email: formData.email ? formData.email : email,
                type: selectUserType ? selectUserType : type,
            }
            if (props.data) {
                dataForm.id = props.data.id;
            }
            if (clearCache) {
                dataForm.cacheTime = new Date().getTime();
            }
            try {
                // 登录
                console.log("data", dataForm);
                const msg = await addUserSchedule({
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataForm),
                });
                handleAPIResponse(msg, "User Updated Successfully", "Failed To Update User");
            } catch (error) {
                handleAPIResponse({ status: 400 }, "User Updated Successfully", "Failed To Update User");
            }
            props.setVisible(false)

            console.log('formData', formData)
            console.log('dataForm', dataForm)
        }
        setIsLoading(false);
        //window.location.reload()
    }

    const [form] = Form.useForm()
    const defaultValues = () => {
        setClearCache(false);
        form.setFieldsValue({
            FirstName: props.data.firstName,
            lastName: props.data.lastName,
            phoneNumber: props.data.phoneNumber,
            email: props.data.email,
            userType: type == 'teacher' ? 'Teacher' : 'Student'
        });
    }
    useEffect(() => {
        defaultValues();
    }, [firstName, lastName, phoneNumber, email, type])

    return (
        <div>
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="FirstName"
                                rules={[{
                                    required: true,
                                    min: 2,
                                    type: 'string',
                                    pattern: /^[a-zA-Z]*$/,
                                }]}
                            >
                                <Input
                                    defaultValue={firstName}
                                    name="firstName"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                rules={[{
                                    required: true,
                                    min: 2,
                                    type: 'string',
                                    pattern: /^[a-zA-Z]*$/,
                                }]}
                            >
                                <Input
                                    name="lastName"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="countryCode">
                                <Select placeholder="Select a country" onChange={handleCountry} defaultValue={defaultCountry.map(name => name.name)}>
                                    {allCountries.map((country) => {
                                        return <Option value={country.name} key={country.code}>{country.name}</Option>
                                    })}
                                </Select>

                            </Form.Item>
                        </Col>

                        <PhoneNumberCountrySelect handleMobileChange={handleMobileChange} defaultValue={props.data.phoneNumber} edit={true} />

                        <Col span={12}>
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email'
                                    }
                                ]}
                            >
                                <Input
                                    name="email"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="userType">
                                <Select
                                    onChange={(value) => { setSelectUserType(value) }}
                                    disabled
                                >
                                    <Option value="teacher">Teacher</Option>
                                    <Option value="student">Student</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Button type="primary" htmlType="submit" onClick={() => {
                                setClearCache(false);
                            }}>
                                Save Changes
                            </Button>

                            <Button type="primary" htmlType="submit" onClick={() => {
                                setClearCache(true);
                            }}>
                                Clear Cache
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </div>
    )
}

export default EditUser;

