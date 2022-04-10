import React, {useState} from 'react';
import { Col, Form, Input, Select } from 'antd';
import {
    getCountries,
    getCountryCallingCode
  } from 'libphonenumber-js'
  import * as CountryList from 'country-list'

const { Option } = Select;

const PhoneNumberCountrySelect = ({ 
  handleMobileChange, 
  formData,
  phoneNumberName = "phoneNumber",
  countryCodeName = "countryCode",
  placeholder = "Enter Mobile Number",
  setSelectCountry = (data: any) => {}, 
  setSelectCountryCode = (data: any) => {}, 
  edit = false, defaultValue }:any) => 
  {
  const [selectCountry, setSelectCountryLocal] = useState('');
  const [localValue, setLocalValue] = useState(defaultValue);
  const [selectCountryCode, setSelectCountryCodeLocal] = useState(91)

  const allCountries = CountryList.getData()
  const defaultCountry = allCountries.filter((country: any) => country.name === 'India')

  //Displaying all countries in select option
  const handleCountry = (value: string)=>{
      console.log('selected country', value)
      if(value){
        const code = CountryList.getCode(value)
        const codeNumber: any = getCountryCallingCode(code)
        //console.log('code', code, codeNumber)
        setSelectCountryLocal(code)
        setSelectCountryCodeLocal(codeNumber)

        setSelectCountry(code)
        setSelectCountryCode(codeNumber)
      }
  }


  return (
    <>
      {
        !edit  && <Col span = {12} key={phoneNumberName + defaultValue}>
            <Form.Item
                name={countryCodeName}>
                <Select placeholder = "Select a country" onChange = {handleCountry} defaultValue = {defaultCountry.map((name: any) => name.name)}>
                    {allCountries.map((country: any)=>{
                        return <Option value = {country.name} key = {country.code}>{country.name}</Option>
                    })}
                </Select>
                
            </Form.Item>
        </Col> 
      }
      <Col span = {12}>
        <Form.Item name={phoneNumberName}
          rules={[
              (edit && localValue?.startsWith("+91", 0)) || !edit && selectCountryCode == 91 ? 
              { required: true, pattern: !edit ? /^[0-9]{10}$/ : /^\+[0-9]{12}$/, message: "Make Sure To Write Correct Phone Number"} : 
              { required: true, pattern: !edit ? /^[0-9]+$/ : /^\+[0-9]{10,15}$/, message: "Make Sure To Write Correct Phone Number"} 
          ]}
          >
          <Input
              placeholder={placeholder}
              name={phoneNumberName}
              onChange = {(e) => {handleMobileChange(e); setLocalValue(e.target.value); }}
              defaultValue={defaultValue}
              addonBefore={!edit && "+"+selectCountryCode}
          />
        </Form.Item>
      </Col>
    </>
  )
}

export default PhoneNumberCountrySelect



