import React, {useState} from 'react';
import { Col, Form, Input, Select } from 'antd';
import {
    getCountries,
    getCountryCallingCode
  } from 'libphonenumber-js'
  import * as CountryList from 'country-list'


const PhoneNumberCountrySelect = ({ 
  handleMobileChange, 
  setSelectCountry = (data: any) => {}, 
  setSelectCountryCode = (data: any) => {}, 
  edit = false }:any) => 
  {
  const [selectCountry, setSelectCountryLocal] = useState('')
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
        !edit  && <Col span = {12}>
            <Form.Item
                name="countryCode">
                <Select placeholder = "Select a country" onChange = {handleCountry} defaultValue = {defaultCountry.map((name: any) => name.name)}>
                    {allCountries.map((country: any)=>{
                        return <Option value = {country.name} key = {country.code}>{country.name}</Option>
                    })}
                </Select>
                
            </Form.Item>
        </Col> 
      }
      <Col span = {12}>
        <Form.Item name="phoneNumber"
          rules={[
              { required: true, pattern: !edit ? /^[0-9]+$/ : /^\+?[0-9]+$/},
          ]}
          >
          <Input
              placeholder = "Enter Mobile Number"
              name = "phoneNumber"
              onChange = {handleMobileChange}
              addonBefore={!edit && "+"+selectCountryCode}
          />
        </Form.Item>
      </Col>
    </>
  )
}

export default PhoneNumberCountrySelect



