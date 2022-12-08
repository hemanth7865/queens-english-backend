import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Spin,
    Alert,
    notification
} from 'antd';
import { getSra, createSchool, editSchool, listBatchForSchool } from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone } from '@ant-design/icons';

const { Option } = Select;

export type SchoolFormProps = {
    tempData: {
        operation?: string,
        id?: string,
        schoolName?: string,
        schoolCode?: string,
        poc?: string,
        sra?: {
            id?: string,
            name?: string,
            email?: string,
            mobile?: string,
            status?: string,
        },
        schoolStatus?: string,
        createdAt?: string,
        classes?: [{ id: string, batchnumber?: string }],
        sraName?: string,
        classObject?: [{ batchId: string, batchNumber?: string, students?: any[] }],
    }
};

const SchoolForm: React.FC<SchoolFormProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
    const [sra, setSra] = useState<any>([]);
    const [batches, setBatches] = useState<any>([]);

    const options = sra.map((item: any) => {
        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
    });

    const [api, contextHolder] = notification.useNotification();

    const openNotification = (value: any) => {
        api.open({
            message: value.create ? value.success ? 'Created School Successfully' : 'Failed to create School' : value.success ? 'Updated School Successfully' : 'Failed to update School',
            description:
                value.create ? value.success ? 'Created School' + value.schoolName : 'Failed to create School' + value.schoolName : value.success ? 'Updated School' + value.schoolName : 'Failed to update School' + value.schoolName,
            icon: <CheckCircleTwoTone style={{ color: 'greem' }} />,
        });
    };

    async function getSras() {
        const sras = await getSra();
        setSra(sras.data)
    }
    useEffect(() => {
        setIsLoading(true);
        getSras();
        listBatches();
        setIsLoading(false);
    }, []);

    async function listBatches() {
        setLoadingBatches(true);
        const batches = await listBatchForSchool();
        setBatches(batches.data);
        console.log(batches.data)
        setLoadingBatches(false);
    }

    console.log(props.tempData)

    const onFinish = async (value: any) => {
        const dataForm = {
            id: value?.id,
            schoolName: value?.schoolName,
            schoolCode: value?.schoolCode,
            poc: value?.poc,
            sraId: value?.sra,
            schoolStatus: value?.schoolStatus,
            batches: value?.batches,
        };
        if (props.tempData.operation === 'edit') {
            setIsLoading(true);
            const edit = await editSchool({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            setIsLoading(false);
            if (edit.success === true) {
                value.success = true
                value.create = false
                openNotification(value)
            } else {
                value.success = false
                value.create = false
                openNotification(value)
            }
        } else {
            setIsLoading(true);
            const create = await createSchool({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            setIsLoading(false);
            if (create.success === true) {
                value.success = true
                value.create = true
                openNotification(value)
            } else {
                value.success = false
                value.create = true
                openNotification(value)
            }
        }
    };

    const [form] = Form.useForm()
    const defaultValues = async () => {
        form.setFieldsValue({
            id: props.tempData?.id,
            schoolName: props.tempData?.schoolName,
            schoolCode: props.tempData?.schoolCode,
            poc: props.tempData?.poc,
            sra: props.tempData?.sra?.name,
            schoolStatus: props.tempData?.schoolStatus,
            createdAt: props.tempData?.createdAt,
            numberOfBatches: props.tempData?.classes?.length,
            batches: props.tempData?.classes?.map((item: any) => item.batchNumber),
        })
    };
    useEffect(() => {
        defaultValues()
    },
        [
            props.tempData?.id,
            props.tempData?.schoolName,
            props.tempData?.schoolCode,
            props.tempData?.poc,
            props.tempData?.sra?.name,
            props.tempData?.schoolStatus,
            props.tempData?.createdAt,
            props.tempData?.classes,
        ]
    )

    return (
        <>
            <Spin spinning={isLoading} >
                {contextHolder}
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                    scrollToFirstError
                >
                    <Form.Item label="School Name" name='schoolName'>
                        <Input />
                    </Form.Item>
                    {props?.tempData?.operation === 'create' ? (
                        <Form.Item label="School Code" name='schoolCode'>
                            <Input />
                        </Form.Item>
                    ) : (
                        <Form.Item label="School Code" name='schoolCode'>
                            <Input disabled />
                        </Form.Item>
                    )}
                    <Form.Item label="School POC" name='poc'>
                        <Input />
                    </Form.Item>
                    <Form.Item label="SRA" name='sra'>
                        <Select >{options}</Select>
                    </Form.Item>
                    {props?.tempData?.operation !== 'create' ? (
                        <>
                            <Form.Item label="School ID" name='id'>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Created At" name='createdAt'>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Number Of Batches" name='numberOfBatches'>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Status" name='schoolStatus'>
                                <Select>
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </>
                    ) : (
                        ''
                    )}
                    <Spin spinning={loadingBatches} >
                        {loadingBatches ? (
                            <Form.Item label="Loading Batches"></Form.Item>
                        ) : (
                            <>
                                <Form.Item label="Batches" name='batches'>
                                    <Select
                                        mode="multiple"
                                        placeholder="Select Batches"
                                        optionFilterProp='label'
                                    >
                                        {batches.map((item: any) => {
                                            return <Option value={item.id} label={item.batchNumber}>{item.batchNumber}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                    </Spin>

                    <Button
                        onClick={() => { console.log(props.tempData) }}
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    >Test</Button>

                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="round"
                        block
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    >Save</Button>
                </Form>
            </Spin >
        </>
    );
};

export default SchoolForm;