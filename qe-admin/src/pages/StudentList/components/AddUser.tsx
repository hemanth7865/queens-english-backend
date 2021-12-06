// @ts-nocheck
import React, {useState} from 'react';
import {Form, Input, Button, Row, Col, Select, DatePicker} from 'antd'
import {
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    validatePhoneNumberLength,
    parsePhoneNumber,
    getCountryCallingCode
  } from 'libphonenumber-js'
import * as CountryList from 'country-list'
import {addUserSchedule} from "@/services/ant-design-pro/api";

//console.log('ccc', CountryList)

export type AddUserProps = {
    setVisible: () => void;
    onUpdate: () => void;
};

const {Option} = Select

const AddUser: React.FC<AddUserProps> = (props) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
    })

    const [selectUserType, setSelectUserType] = useState('')
    const [error, setError] = useState('')
    const [selectCountry, setSelectCountry] = useState('')
    const [selectCountryCode, setSelectCountryCode] = useState('')

    const allCountries = CountryList.getData()
    // console.log('cdc', allCountries)

    //default country India
    const defaultCountry = allCountries.filter(country=>country.name === 'India')
    console.log('default country', defaultCountry, defaultCountry.map(name => name.name))

    //Displaying all countries in select option
    const handleCountry = (value)=>{
        console.log('selected country', value)
        if(value){
        const code = CountryList.getCode(value)
        const codeNumber = getCountryCallingCode(code)
        console.log('code', code, codeNumber)
        setSelectCountry(code)
        setSelectCountryCode(codeNumber)
        }
    }
    console.log('country', selectCountry, selectCountryCode)

    //validation for phone number
    const handleMobileChange = (event)=>{
        const number = event.target.value
        const message = isValidPhoneNumber(number, selectCountry?selectCountry:'IN')
        console.log('msg', message, msg)
        const msg = validatePhoneNumberLength(number, selectCountry?selectCountry:'IN')
        if(msg === 'TOO_LONG'){
            setError('Phone number is too long')
        }else if(msg === 'TOO_SHORT'){
            setError('Phone number is too short')
        }else if(msg === 'NOT_A_NUMBER'){
            setError('Not a Number')
        }else if(msg === 'INVALID_COUNTRY'){
            setError('Please Select country first')
        }else if(msg === undefined){
            setError('')
        }else{
            setError('Phone number is Invalid')
        }
        if(message === true && msg === undefined){
            console.log(`valid mobile number for ${selectCountry}`)
            setFormData((value)=>({
                ...value,
                [event.target.name]: event.target.value
            }))
        }
        if(message === false && msg === undefined){
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

    const handleInputChange = (event: { target: { name: any; value: any; }; })=>{
        setFormData((value)=>({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const onFinish = async ()=>{
        console.log('form submitted')
        if(!error){
            const dataForm = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.mobile,
                email: formData.email,
                type: selectUserType
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
                if (msg.status === "ok") {
                  console.log("API call sucessfull", msg);
                }
                console.log(msg);
              } catch (error) {
                console.log("addRule error", error);
                const defaultLoginFailureMessage = intl.formatMessage({
                  id: "pages.login.failure",
                  defaultMessage: "登录失败，请重试！",
                });
                message.error(defaultLoginFailureMessage);
              }
            props.setVisible(false)
            console.log('formData', formData)
            console.log('dataForm', dataForm)
        }
        
        //window.location.reload()
    }

    //console.log('mesge', error)

    return(
        <div>
        <Form
        name="basic"
        onFinish={onFinish}
        validateMessages={validateMessages}
        >
        <Row gutter = {16}>
            <Col span = {12}>
                <Form.Item
                    name="First Name"
                    rules = {[{
                        required: true,
                        min: 2,
                        type: 'string',
                        pattern:  /^[a-zA-Z]*$/,
                    }]}
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
                    name="Last Name"
                    rules = {[{
                        required: true,
                        min: 2,
                        type: 'string',
                        pattern:  /^[a-zA-Z]*$/,
                    }]}
                >
                    <Input
                        placeholder = "Last Name"
                        name = "lastName"
                        onChange = {handleInputChange}
                    />
                </Form.Item>
            </Col>
            <Col span = {12}>
                <Form.Item
                    name="countryCode">
                    <Select placeholder = "Select a country" onChange = {handleCountry} defaultValue = {defaultCountry.map(name => name.name)}>
                        {allCountries.map((country)=>{
                            return <Option value = {country.name} key = {country.code}>{country.name}</Option>
                        })}
                    </Select>
                </Form.Item>
            </Col>
            <Col span = {12}>
                <Form.Item name="Mobile">
                    <Input
                        placeholder = "Enter Mobile Number"
                        name = "mobile"
                        onChange = {handleMobileChange}
                        prefix = {selectCountryCode?selectCountryCode:'91'}
                        />
                    {error? (
                        <p style = {{color: 'red'}}>{error}</p>
                    ): ''}
                </Form.Item>
            </Col>
            <Col span = {12}>
                <Form.Item
                    name="Email"
                    rules = {[
                        {
                            required: true,
                            type: 'email'
                        }
                    ]}
                >
                    <Input
                        placeholder = "Email"
                        name = "email"
                        onChange = {handleInputChange}
                    />
                </Form.Item>
            </Col>
            <Col span = {12}>
                <Form.Item name="User Type" rules = {[{required: true}]}>
                    <Select
                        placeholder="User Type"
                        onChange = {(value)=>{setSelectUserType(value)}}
                        >
                        <Option value="teacher">Teacher</Option>
                        <Option value="student">Student</Option>
                    </Select>
                </Form.Item>
            </Col>

            <Col span = {24}>
            <Button type="primary" htmlType="submit" block>
                Add User
            </Button>
            </Col>
        </Row>
        </Form>
        </div>
    )
}
    
export default AddUser;

