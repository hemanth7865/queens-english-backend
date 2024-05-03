import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Col, Form, Input, Select } from "antd";
import {
  validatePhoneNumberLength,
  parsePhoneNumber,
  getCountryCallingCode,
  isValidPhoneNumber
} from "libphonenumber-js";
import * as CountryList from "country-list";

const { Option } = Select;

type PhoneNumberCountrySelectProps = {
  handleMobileChange: (value: string) => void;
  phoneNumberName?: string;
  countryCodeName?: string;
  placeholder?: string;
  edit?: boolean;
};

const PhoneNumberCountrySelect = ({
  handleMobileChange,
  phoneNumberName = "phoneNumber",
  placeholder = "Enter Mobile Number",
  edit = false,
}: PhoneNumberCountrySelectProps) => {
  const formInstance = Form.useFormInstance();
  const fieldValue = Form.useWatch(phoneNumberName, formInstance);
  const [countryCallingCode, setCountryCallingCode] = useState("+91");
  const [countryCode, setCountryCode] = useState("IN");

  const allCountries = useMemo(() => CountryList.getData(), []);

  const handleCountry = useCallback((value: string) => {
    const code = getCountryCallingCode(value as any);
    setCountryCode(value);
    setCountryCallingCode("+" + code);
  }, []);

  useEffect(() => {
    if (!fieldValue) return;
    try {
      const parsed = parsePhoneNumber(fieldValue);
      const code = parsed.countryCallingCode;
      const value = parsed.number.replace(`+${code}`, "");
      setCountryCallingCode("+" + code);
      setCountryCode(parsed.country ?? "IN");
      formInstance.setFieldsValue({ [phoneNumberName]: value });
    } catch (error) {
      console.error("Failed to parse phone number:", error);
    }
  }, [fieldValue, phoneNumberName]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 0) {
      handleMobileChange("");
      formInstance.setFieldsValue({ [phoneNumberName]: "" });
      return;
    }
    formInstance.setFieldsValue({ [phoneNumberName]: value });
    handleMobileChange(countryCallingCode + value);
  }, [countryCallingCode, formInstance, handleMobileChange, phoneNumberName]);

  return (
    <>
      {!edit && (
        <Col span={12} key={phoneNumberName}>
          <Form.Item>
            <Select
              placeholder="Select a country"
              onChange={handleCountry}
              value={countryCode}
              defaultValue={countryCode}
            >
              {allCountries.map(({ name, code }) => (
                <Option value={code} key={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      )}
      <Col span={12}>
        <Form.Item
          name={phoneNumberName}
          rules={[
            { required: true, message: "Please enter your mobile number!" },
            ({ }) => ({
              validator(rule, value) {
                const number = `${countryCallingCode}${value}`.replace("+", "")
                try {
                  if (!isValidPhoneNumber(number, countryCode as any)) {
                    return Promise.reject("Please enter a valid mobile number!");
                  }
                  const length = validatePhoneNumberLength(number, countryCode as any)
                  if (length) {
                    return Promise.reject("Please enter a valid mobile number!");
                  }

                  return Promise.resolve();

                } catch (error) {
                  console.error("Failed to validate phone number:", error);
                  return Promise.reject("Please enter a valid mobile number!");
                }
              }
            })
          ]}
        >
          <Input
            placeholder={placeholder}
            name={phoneNumberName}
            onChange={onChange}
            addonBefore={countryCallingCode}
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default PhoneNumberCountrySelect;
