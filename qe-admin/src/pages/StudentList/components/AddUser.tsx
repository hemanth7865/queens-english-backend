import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import { addUserSchedule, listSchool } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { Button, Col, Form, Input, Row, Select, Spin } from 'antd';
import * as CountryList from 'country-list';
import {
    isValidPhoneNumber,
    validatePhoneNumberLength
} from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { useAccess } from 'umi';

//console.log('ccc', CountryList)

export type AddUserProps = {
    setVisible: () => void;
    onUpdate: () => void;
    offlineUser: boolean;
    userType: string;
};

const { Option } = Select

const StudentUser = { text: "Student", value: "student" }
const TeacherUser = { text: "Teacher", value: "teacher" }
const BothUser = { text: "Both", value: "both" }

const userTypes = [
    StudentUser,
    TeacherUser,
    BothUser,
]

const AddUser: React.FC<AddUserProps> = (props) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        classSection: '',
    })

    const [selectUserType, setSelectUserType] = useState<string>('')
    const [selectedSchool, setSelectSchool] = useState()
    const [selectOfflineUser, setOfflineUser] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectCountry, setSelectCountry] = useState('IN')
    const [selectCountryCode, setSelectCountryCode] = useState(91)
    const [schools, setSchools] = useState<any[]>([])
    const access = useAccess();

    useEffect(() => {
        if (props.offlineUser) {
            setOfflineUser("1");
        }
    }, [props.offlineUser]);

    useEffect(() => {
        if (props.userType === 'student') {
            setSelectUserType(props.userType);
        }
    }, [props.userType]);

    useEffect(() => {
        if (schools.length === 0) {
            listSchool({ onlySchools: true })
                .then((data: any) => {
                    setSchools(data.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [schools]);

    const allCountries = CountryList.getData()


    //validation for phone number
    const handleMobileChange = (event) => {
        const number = event.target.value
        const message = isValidPhoneNumber(number, selectCountry ? selectCountry : 'IN')
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

        console.log(`valid mobile number for ${selectCountry}`)
        setFormData((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }))

        if (message === false && msg === undefined) {
            setError('Enter a valid Mobile Number')
        }
        //console.log(validatePhoneNumberLength(number, 'IN'))

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
        setFormData((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const addStudentTeacher = async (userType: string, ignoreDuplicateCheck: boolean = false) => {
        var code = selectCountryCode ? selectCountryCode : '91';
        setIsLoading(true)
        if (!error) {
            let dataForm: any
            if (userType === StudentUser.value) {
                dataForm = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: '+' + code + formData.phoneNumber,
                    email: formData.email,
                    type: userType,
                    offlineUser: selectOfflineUser,
                    status: "active",
                }
            } else {
                dataForm = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: '+' + code + formData.phoneNumber,
                    email: formData.email,
                    offlineUser: selectOfflineUser,
                    type: userType,
                }
            }

            if (selectOfflineUser === "1") {
                dataForm.schoolId = selectedSchool
                dataForm.classSection = formData.classSection
            }

            try {
                const msg = await addUserSchedule({
                    params: {
                        ignoreDuplicateCheck
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataForm),
                });
                handleAPIResponse(msg, "User Added Successfully", "Failed To Add User", false);
            } catch (error) {
                handleAPIResponse({ status: 400 }, "User Added Successfully", "Failed To Add User", false);
            }
        }
        setIsLoading(false);
    }

    const onFinish = async () => {
        if (selectUserType === BothUser.value) {
            await addStudentTeacher(TeacherUser.value, true)
            await addStudentTeacher(StudentUser.value, true)
        } else {
            await addStudentTeacher(selectUserType)
        }
        props.setVisible(false)
    }

    return (
        <div>
            <Spin spinning={isLoading}>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="First Name"
                                rules={[{
                                    required: true,
                                    min: 2,
                                    type: 'string',
                                    pattern: /^[a-zA-Z]*$/,
                                }]}
                            >
                                <Input
                                    placeholder="First Name"
                                    name="firstName"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Last Name"
                                rules={[{
                                    required: true,
                                    min: 2,
                                    type: 'string',
                                    pattern: /^[a-zA-Z]*$/,
                                }]}
                            >
                                <Input
                                    placeholder="Last Name"
                                    name="lastName"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <PhoneNumberCountrySelect handleMobileChange={handleMobileChange} setSelectCountry={setSelectCountry} setSelectCountryCode={setSelectCountryCode} edit={false} />
                        <Col span={8}>
                            <Form.Item
                                name="Email"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Email"
                                    name="email"
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="User Type" rules={[{ required: true }]}>
                                <Select
                                    defaultValue={props.userType}
                                    value={selectUserType}
                                    placeholder="User Type"
                                    onChange={(value) => { setSelectUserType(value) }}
                                    disabled={props.userType === 'student'}
                                >
                                    {userTypes.map(userType => (<Option value={userType.value}>{userType.text}</Option>))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="offlineUser">
                                <Select
                                    defaultValue={props.offlineUser ? '1':''}
                                    value={selectOfflineUser}
                                    onChange={(value) => { setOfflineUser(value) }}
                                    disabled={props.offlineUser}
                                >
                                    <Option value="0">Online</Option>
                                    <Option value="1">Offline</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        {selectOfflineUser === '1' &&
                            <>
                                <Col span={12}>
                                    <Form.Item name="School" rules={[{ required: selectOfflineUser === "1" }]}>
                                        <Select
                                            disabled={selectOfflineUser !== "1"}
                                            placeholder="Select School"
                                            onChange={(value) => { setSelectSchool(value) }}
                                        >
                                            {schools?.map((s: any) => (<Select.Option value={s?.id}>{`${s?.schoolName} ~ ${s?.schoolCode}`}</Select.Option>))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="Class Section"
                                        rules={[
                                            {
                                                required: false,
                                                type: 'string'
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder="ex: 1A / 4C"
                                            name="classSection"
                                            onChange={handleInputChange}
                                        />
                                    </Form.Item>
                                </Col>
                            </>
                        }

                        <Col span={24}>
                            <Button type="primary" htmlType="submit" block>
                                Add User
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </div>
    )
}

export default AddUser;

