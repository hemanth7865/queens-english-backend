import React, { useState } from 'react';
import { Select, Divider, Input, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

let index = 0;

export const SelectPlanType = () => {
  const [items, setItems] = useState(['Razorpay', 'Bank Transfer', 'Cashfree']);
  const [name, setName] = useState('');
  const [namea, setNamea] = useState('');

  const onNameChange = event => {
      console.log(event.target.value)
    setName(event.target.value);
  };

  const addItem = e => {
    console.log(e.target.value)
    e.preventDefault();
    setItems([...items, name || `New item ${index++}`]);
    setName('');
  };

  function handleChange(value) {
    console.log(`selected ${value}`);
    setNamea(value)
  }

  console.log('item', items)
  console.log('name', name)

  return (
    <Select
      style={{ width: 300 }}
      placeholder="custom dropdown render"
      onChange={(value) => setNamea(value)}
      dropdownRender={menu => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space align="center" style={{ padding: '0 8px 4px' }}>
            <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
            <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
              <PlusOutlined /> Others
            </Typography.Link>
          </Space>
        </>
      )}
    >
      {items.map(item => (
        <Option key={item} value = {item}>{item}</Option>
      ))}
    </Select>
  );
};