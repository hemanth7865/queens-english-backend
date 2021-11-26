// @ts-nocheck
import React, {useState} from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker } from 'antd';

export type EditStudentProps = {
    weekday: Number;
    data: {}
    onUpdate: () => void;
};


const EditStudent: React.FC<EditStudentProps> = (props) => {
    console.log('data', props.data)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        address: '',
        days: '',
        numberOfClasses: '',
        preferedLanguageTeacher: '',
        valueOfSale: ''
    })

    const [selectGender, setSelectGender] = useState('')
    const [selectAgeGroup, setSelectAgeGroup] = useState('')
    const [selectClassType, setSelectClassType] = useState('')
    const [selectPreferedTeacher, setSelectPreferedTeacher] = useState('')
    const [selectTeacherAgeGroup, setSelectTeacherAgeGroup] = useState('')
    const [selectStatus, setSelectStatus] = useState('')
    
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')

    const handleInputChange = (event: { target: { name: any; value: any; }; })=>{
        setFormData((value)=>({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const onFinish = ()=>{
        console.log('form submitted')
        const dataForm = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: formData.mobile,
            email: formData.email,
            address: formData.address,
            days: formData.days,
            numberOfClasses: formData.numberOfClasses,
            preferedLanguageTeacher: formData.preferedLanguageTeacher,
            valueOfSale: formData.valueOfSale,
            gender: selectGender,
            ageGroup: selectAgeGroup,
            classType: selectClassType,
            preferedTeacher: selectPreferedTeacher,
            preferedTeacherAgeGroup: selectTeacherAgeGroup,
            status: selectStatus,
            dob: dateOfBirth,
            startDate: dateStart,
            endDate: dateEnd,
        }
        console.log('formData', formData)
        console.log('dataForm', dataForm)
    }

    return(
        <div>
            {console.log('details edit', props.details)}
        <Form
        name="basic"
        onFinish={onFinish}
        >
            <Row gutter = {16}>
                <Col span = {12}>
                    <Form.Item
                        name="first name"
                    >
                        <Input
                            placeholder = "First Name"
                            name = "firstName"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="last name"
                    >
                        <Input
                            placeholder = "Last Name"
                            name = "lastName"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="gender">
                        <Select
                            placeholder="Select a gender"
                            onChange = {(value)=>{setSelectGender(value)}}
                            >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="date of birth"
                    >
                        <DatePicker 
                            placeholder = "Date of Birth"
                            style={{ width: "220px" }}
                            onChange={(date, dateString) => {
                                setDateOfBirth(dateString);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="age group">
                        <Select
                            placeholder="Age Group"
                            onChange = {(value)=>{setSelectAgeGroup(value)}}
                            >
                            <Option value="kid">Kid</Option>
                            <Option value="adult">Adult</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="mobile"
                    >
                        <Input
                            placeholder = "Mobile"
                            name = "mobile"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="email"
                    >
                        <Input
                            placeholder = "Email"
                            name = "email"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="address"
                    >
                        <Input
                            placeholder = "Address"
                            name = "address"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="class type">
                        <Select
                            placeholder="Class Type"
                            onChange = {(value)=>{setSelectClassType(value)}}
                            >
                            <Option value="1:1">1:1</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="days"
                    >
                        <Input
                            placeholder = "Days"
                            name = "days"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Start Date"
                    >
                        <DatePicker 
                            placeholder = "Start Date"
                            style={{ width: "220px" }}
                            onChange={(date, dateString) => {
                                setDateStart(dateString);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="End Date"
                    >
                        <DatePicker 
                            placeholder = "End Date"
                            style={{ width: "220px" }}
                            onChange={(date, dateString) => {
                                setDateEnd(dateString);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="No of Classes"
                    >
                        <Input
                            placeholder = "No of Classes"
                            name = "numberOfClasses"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Prefered Language Teacher"
                    >
                        <Input
                            placeholder = "Prefered Language Teacher"
                            name = "preferedLanguageTeacher"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="Prefered Teacher">
                        <Select
                            placeholder="Prefered Teacher"
                            onChange = {(value)=>{setSelectPreferedTeacher(value)}}
                            >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="Prefered Teacher Age Group">
                        <Select
                            placeholder="Prefered Teacher Age Group"
                            onChange = {(value)=>{setSelectTeacherAgeGroup(value)}}
                            >
                            <Option value="20-30">20-30</Option>
                            <Option value="30-40">30-40</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Prefered Timings (Weekdays)"
                    >
                        <Input
                            placeholder = "Prefered Timings (Weekdays)"
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Prefered Timings (Weekend)"
                    >
                        <Input
                            placeholder = "Prefered Timings (Weekend)"
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="Status">
                        <Select
                            placeholder="Select a Status"
                            onChange = {(value)=>{setSelectStatus(value)}}
                            >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="leave">Leave</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Upload Photo"
                    >
                        <Input
                            placeholder = "Upload Photo"
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="Value of Sale"
                    >
                        <Input
                            placeholder = "Value of Sale"
                            name = "valueOfSale"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {24}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
                </Col>
            </Row>
        </Form>
        </div>
    )
}
    
export default EditStudent;

