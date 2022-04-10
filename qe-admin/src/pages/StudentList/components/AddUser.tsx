import React, {useState} from 'react';
import {Form, Input, Button, Row, Col, Select, Spin} from 'antd'
import {
    isValidPhoneNumber,
    validatePhoneNumberLength,
  } from 'libphonenumber-js'
import * as CountryList from 'country-list'
import {addUserSchedule} from "@/services/ant-design-pro/api";
import {handleAPIResponse} from "@/services/ant-design-pro/helpers";
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";

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
        phoneNumber: '',
        email: '',
    })

    const [selectUserType, setSelectUserType] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectCountry, setSelectCountry] = useState('IN')
    const [selectCountryCode, setSelectCountryCode] = useState(91)

    const allCountries = CountryList.getData()
 

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

            console.log(`valid mobile number for ${selectCountry}`)
            setFormData((value)=>({
                ...value,
                [event.target.name]: event.target.value
            }))
        
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
        var code = selectCountryCode?selectCountryCode:'91';
        setIsLoading(true)
        if(!error){
            let dataForm
            if(selectUserType === "student"){
                dataForm = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: '+'+ code + formData.phoneNumber,
                    email: formData.email,
                    type: selectUserType,
                    status: "enrolled",
                }
            }else{
                dataForm = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: '+'+ code + formData.phoneNumber,
                    email: formData.email,
                    type: selectUserType,
                }
            }
            
            try {
                const msg = await addUserSchedule({
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dataForm),
                });
                handleAPIResponse(msg, "User Added Successfully", "Failed To Add User");
              } catch (error) {
                handleAPIResponse({status: 400}, "User Added Successfully", "Failed To Add User");
              }
            props.setVisible(false)
        }
        setIsLoading(false);
    }

    return(
        <div>
            <Spin spinning={isLoading}>
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
                        <PhoneNumberCountrySelect handleMobileChange={handleMobileChange} setSelectCountry={setSelectCountry} setSelectCountryCode={setSelectCountryCode} edit={false} /> 
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
            </Spin>
        </div>
    )
}
    
export default AddUser;

