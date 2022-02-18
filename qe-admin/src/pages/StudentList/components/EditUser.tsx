// @ts-nocheck
import React, {useState, useEffect} from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker } from 'antd';
import moment from "moment";
import {studentBatches, addUserSchedule} from "@/services/ant-design-pro/api";
import {
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    validatePhoneNumberLength,
    parsePhoneNumber,
    getCountries,
    getCountryCallingCode
  } from 'libphonenumber-js'
  import * as CountryList from 'country-list'

export type EditUserProps = {
    data: {};
    visible: '';
    setVisible: ()=>void;
    onUpdate: () => void;
};

const {Option} = Select

const EditUser: React.FC<EditUserProps> = (props) => {
    //console.log('data', props.data, props.visible, props.setVisible)
    const {firstName, lastName, email, phoneNumber, type, key} = props.data?props.data:''
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

    const allCountries = CountryList.getData()
    const allCountryCodes = getCountries()
    const countryCodes = allCountryCodes.map((code)=>{
        return getCountryCallingCode(code)
    })
   
    // let previousCodes, previousCodes2, codeCountryDetails
    // if(phoneNumber != undefined){
    //     const firstTry = phoneNumber.slice(0, 2).toString()
    //     const secondTry = phoneNumber.slice(0, 3).toString()
    //     // console.log('num', firstTry, secondTry)
    //     // console.log('cdc', allCountryCodes, countryCodes)
    //     previousCodes = countryCodes.filter(code => code === firstTry).toString()
    //     previousCodes2 = countryCodes.filter(code => code === secondTry)
    //     //console.log('code 00', previousCodes, previousCodes2)
    //     const codeCountry = countryCodes.indexOf(previousCodes)
    //     const codeCountryName = allCountryCodes[codeCountry]
    //     codeCountryDetails = CountryList.getName(codeCountryName)
    //     console.log('code', codeCountryDetails)
    // }

    //default country India
    const defaultCountry = allCountries.filter(country=>country.name === 'India')
    //console.log('default country', defaultCountry, defaultCountry.map(name => name.name))

    //Displaying all countries in select option
    const handleCountry = (value)=>{
        console.log('selected country', value)
        if(value){
        const code = CountryList.getCode(value)
        const codeNumber = getCountryCallingCode(code)
        //console.log('code', code, codeNumber)
        setSelectCountry(code)
        setSelectCountryCode(codeNumber)
        }
    }
    //console.log('country', selectCountry, selectCountryCode)

   
    //validation for phone number
    const handleMobileChange = (event)=>{
        const number = event.target.value
        const message = isValidPhoneNumber(number, selectCountry?selectCountry:'IN')
        //console.log('msg', message, msg)
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
            //console.log(`valid mobile number for ${selectCountry}`)
            setFormData((value)=>({
                ...value,
                [event.target.name]: event.target.value
            }))
        }
        if(message === false && msg === undefined){
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


    const handleInputChange = (event: { target: { name: any; value: any; }; })=>{
        console.log('val', event.target.value, event)
        // event.defaultPrevented
        setFormData((value)=>({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const onFinish = async ()=>{
        console.log('form submitted')
        var code = selectCountryCode?selectCountryCode:'91';
        if(!error){
            let dataForm = {
                firstName: formData.firstName?formData.firstName:props.data.firstName,
                lastName: formData.lastName?formData.lastName:lastName,
                phoneNumber: formData.phoneNumber?formData.phoneNumber:phoneNumber,
                email: formData.email?formData.email:email,
                type: selectUserType?selectUserType:type,
            }
            if (props.data) {
                dataForm.id = props.data.id;
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
                window.location.reload();
                // 如果失败去设置用户错误信息
                // setUserLoginState(msg);
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

    const [form] = Form.useForm()
    const defaultValues = ()=>{
        form.setFieldsValue({
                            FirstName: props.data.firstName,
                            lastName: props.data.lastName,
                            phoneNumber: props.data.phoneNumber,
                            email: props.data.email,
                            userType: type == 'teacher'?'Teacher':'Student'
                            })
    }
    useEffect(() => {
        defaultValues();
    }, [firstName, lastName, phoneNumber, email, type])
    
    return(
        <div>
        <Form
        form = {form}
        onFinish={onFinish}
        validateMessages={validateMessages}
        >
            <Row gutter = {16}>
                <Col span = {12}>
                    <Form.Item
                        name="FirstName"
                        rules = {[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern:  /^[a-zA-Z]*$/,
                        }]}
                    >
                        <Input
                            defaultValue = {firstName}
                            name = "firstName"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="lastName"
                        rules = {[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern:  /^[a-zA-Z]*$/,
                        }]}
                    >
                        <Input
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
                    <Form.Item
                        name="phoneNumber"
                    >
                        <Input
                            name = "phoneNumber"
                            onChange = {handleMobileChange}
                            //prefix = {selectCountryCode?selectCountryCode:'91'}
                        />
                        
                    </Form.Item>
                    {error? (
                        <p style = {{color: 'red'}}>{error}</p>
                    ): ''}
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="email"
                        rules = {[
                            {
                                required: true,
                                type: 'email'
                            }
                        ]}
                    >
                        <Input
                            name = "email"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="userType">
                        <Select
                            onChange = {(value)=>{setSelectUserType(value)}}
                            disabled
                            >
                            <Option value="teacher">Teacher</Option>
                            <Option value="student">Student</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {24}>
                <Button type="primary" htmlType="submit">
                    Save Changes
                </Button>
                </Col>
            </Row>
        </Form>
        </div>
    )
}
    
export default EditUser;

