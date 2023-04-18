import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Spin,
    notification
} from 'antd';
import { getSra, createSchool, editSchool, listBatchForSchool, listLocation } from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import UploadStudentsBulkWithoutRMN from '@/pages/StudentList/components/UploadStudentsBulkWithoutRMN';

const { Option } = Select;

export type SchoolFormProps = {
    tempData: {
        operation?: string,
        id?: string,
        schoolName?: string,
        schoolCode?: string,
        poc?: string,
        sra?: {
            id: string,
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
        location?: string;
    }
};

const SchoolForm: React.FC<SchoolFormProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
    const [sra, setSra] = useState<any>([]);
    const [batches, setBatches] = useState<any>([]);
    const [newData, setNewdata] = useState<any>(false);
    const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
    const [countries, setCountries] = useState<any>([]);
    const [selectedCountry, setSelectedCountry] = useState<any>(false);
    const [loadingStates, setLoadingStates] = useState<boolean>(false);
    const [states, setStates] = useState<any>([]);
    const [selectedState, setSelectedState] = useState<any>(false);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);
    const [cities, setCities] = useState<any>([]);
    const [selectedCity, setSelectedCity] = useState<any>(false);

    const options = sra.map((item: any) => {
        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
    });

    const [api, contextHolder] = notification.useNotification();

    async function getMessage(value: any) {
        if (value.create) {
            if (value.success) {
                return 'Created School Successfully'
            }
            return value.message ? value.message : 'Failed to create School'
        }
        if (value.success) {
            return 'Updated School Successfully'
        }
        return value.message ? value.message : 'Failed to update School'
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        api.open({
            message: 'Failed to Save School',
            description: 'Failed to Save School due to a technical error. Please try again later. || Error: ' + errorInfo?.errorFields[0]?.errors[0],
            icon: <CloseCircleTwoTone twoToneColor='red' />,
        });
    };

    async function getDescription(value: any) {
        if (value.create) {
            if (value.success) {
                return 'Created School' + value.schoolName
            }
            return value.message ? value.message : 'Failed to create School' + value.schoolName
        }
        if (value.success) {
            return 'Updated School' + value.schoolName
        }
        return value.message ? value.message : 'Failed to update School' + value.schoolName
    }

    const openNotification = async (value: any) => {
        api.open({
            message: await getMessage(value),
            description: await getDescription(value),
            icon: value.success ? <CheckCircleTwoTone twoToneColor='green' /> : <CloseCircleTwoTone twoToneColor='red' />,
        });
    };

    async function getSras() {
        try {
            const sras = await getSra();
            setSra(sras.data)
        } catch (error) {
            console.log(error)
        }
    }

    async function listBatches() {
        setLoadingBatches(true);
        try {
            const batches = await listBatchForSchool();
            setBatches(batches.data);
        } catch (error) {
            console.log(error)
        }
        setLoadingBatches(false);
    }

    async function listLocations(data?: any) {
        if (data?.country && !data?.state) {
            setLoadingStates(true);
        } else if (data?.state) {
            setLoadingCities(true);
        } else {
            setLoadingCountries(true);
        }
        try {
            const locations = await listLocation(data);
            if (data?.country && !data?.state) {
                setStates(locations);
            } else if (data?.state) {
                setCities(locations);
            } else {
                setCountries(locations);
            }
        } catch (error) {
            console.log("Locations Error", error)
        }
        if (data?.country && !data?.state) {
            setLoadingStates(false);
        } else if (data?.state) {
            setLoadingCities(false);
        } else {
            setLoadingCountries(false);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        (async function loadPage() {
            await getSras();
            await listLocations();
            await listBatches();
        })();
        setIsLoading(false);
    }, []);

    const onFinish = async (value: any) => {
        const oldData = props.tempData;
        setNewdata(value);
        async function areArrEqual(arr1: any, arr2: any) {
            if (arr1.length !== arr2.length) return false;
            for (let i = 0; i < arr2.length; i++) {
                if (arr1[i]?.batchNumber !== arr2[i]) {
                    return false;
                }
            }
            return true;
        }
        const sameBatches = oldData.operation === 'create' ? false : await areArrEqual(oldData.classes, value.batches)
        const newBatches = value.batches?.map((item: any) => {
            return item
        })
        const oldBatches = oldData?.classes?.map((item: any) => {
            return item.batchNumber
        })
        const batchesToRemove = oldBatches?.filter((item: any) => !newBatches?.includes(item))
        const batchesToAdd = newBatches?.filter((item: any) => !oldBatches?.includes(item))
        const dataForm = {
            id: value?.id,
            schoolName: value?.schoolName,
            schoolCode: value?.schoolCode?.toUpperCase(),
            poc: value?.poc,
            sraId: value?.sra,
            schoolStatus: value?.schoolStatus,
            batches: sameBatches ? null : {
                addBatches: batchesToAdd,
                removeBatches: batchesToRemove
            },
            cosmosBatches: {
                sendBatches: value?.batches,
                removeBatches: batchesToRemove
            },
            country: value?.country,
            state: value?.state,
            city: value?.city
        };
        setIsLoading(true);
        if (oldData.operation === 'edit') {
            const edit = await editSchool({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            setIsLoading(false);
            if (edit.errorMessage) {
                value.success = false
                value.create = false
                value.message = edit.errorMessage
            } else {
                value.success = true
                value.create = false
                value.message = edit.message
            }
        } else {
            const create = await createSchool({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            setIsLoading(false);
            if (create.errorMessage) {
                value.success = false
                value.create = true
                value.message = create.errorMessage
            } else {
                value.success = true
                value.create = true
                value.message = create.message
            }
        }
        openNotification(value);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    const [form] = Form.useForm()
    const defaultValues = async () => {
        form.setFieldsValue({
            id: newData ? newData?.id : props.tempData?.id,
            schoolName: newData ? newData?.schoolName : props.tempData?.schoolName,
            schoolCode: newData ? newData?.schoolCode : props.tempData?.schoolCode,
            poc: newData ? newData?.poc : props.tempData?.poc,
            sra: newData ? newData?.sra : props.tempData?.sra?.id,
            schoolStatus: newData ? newData?.schoolStatus : props.tempData?.schoolStatus,
            createdAt: newData ? newData?.createdAt : props.tempData?.createdAt,
            numberOfBatches: newData ? newData?.batches?.length : props.tempData?.classes?.length,
            batches: newData ? newData?.batches : props.tempData?.classes?.map((item: any) => item.batchNumber),
            location: newData ? newData?.location : props.tempData?.location,
        })
    };
    useEffect(() => {
        defaultValues()
    },
        [
            newData,
            props.tempData?.id,
            props.tempData?.schoolName,
            props.tempData?.schoolCode,
            props.tempData?.poc,
            props.tempData?.sra?.name,
            props.tempData?.schoolStatus,
            props.tempData?.createdAt,
            props.tempData?.classes?.length,
            props.tempData?.classes?.map((item: any) => item.batchNumber),
            props.tempData?.location
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
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    scrollToFirstError
                >
                    <Form.Item label="School Name" name='schoolName'
                        rules={[{
                            required: true,
                        }]}>
                        <Input />
                    </Form.Item>
                    {props?.tempData?.operation === 'create' ? (
                        <Form.Item label="School Code" name='schoolCode' rules={[{
                            required: true,
                        }]}>
                            <Input maxLength={4} minLength={4} />
                        </Form.Item>
                    ) : (
                        <Form.Item label="School Code" name='schoolCode' rules={[{
                            required: true,
                        }]}>
                            <Input disabled maxLength={5} minLength={3} />
                        </Form.Item>
                    )}
                    <Form.Item label="School POC" name='poc'>
                        <Input />
                    </Form.Item>
                    <Form.Item label="SRA" name='sra' rules={[{
                        required: true,
                    }]}>
                        <Select >{options}</Select>
                    </Form.Item>
                    {props?.tempData?.operation === 'create' ? (
                        <>
                            <Form.Item label="Country" name='country'>
                                <Select
                                    placeholder="Select Country"
                                    optionFilterProp='label'
                                    showSearch
                                    allowClear
                                    loading={loadingCountries}
                                    onChange={(value, option) => { setSelectedCountry(option); listLocations({ country: option }); }}
                                    onClear={() => { setSelectedCountry(null); setSelectedState(null); setSelectedCity(null); setStates([]); setCities([]); }}
                                >
                                    {countries.map((item: any) => {
                                        return <Option value={item.name} label={item.name} key={item.id}>{item.name} ~ {item.iso2}</Option>
                                    })}
                                </Select>
                            </Form.Item>
                            {selectedCountry && !loadingStates && (
                                <Form.Item label="State" name='state'>
                                    <Select
                                        placeholder="Select State"
                                        optionFilterProp='label'
                                        showSearch
                                        allowClear
                                        onChange={(value, option) => { setSelectedState(option); listLocations({ country: selectedCountry.children[2], state: option }) }}
                                        loading={loadingStates}
                                        onClear={() => { setSelectedState(null); setSelectedCity(null); setCities([]); }}
                                    >
                                        {states.map((item: any) => {
                                            return <Option value={item.name} label={item.name} key={item.id}>{item.name} ~ {item.iso2}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                            )}
                            {selectedState && !loadingCities && (
                                <Form.Item label="City" name='city'>
                                    <Select
                                        placeholder="Select City"
                                        optionFilterProp='label'
                                        showSearch
                                        allowClear
                                        onChange={(value, option) => { setSelectedCity(option); listLocations({ country: selectedCountry.children[2], state: selectedState.children[2], city: option }) }}
                                        loading={loadingCities}
                                    >
                                        {cities.map((item: any) => {
                                            return <Option value={item.name} label={item.name} key={item.id}>{item.name}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                            )}
                        </>
                    ) : (
                        <Form.Item label="Location" name='location'>
                            <Input disabled />
                        </Form.Item>
                    )}
                    {props?.tempData?.operation !== 'create' ? (
                        <>
                            <Form.Item label="School ID" name='id' rules={[{
                                required: true,
                            }]}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Created At" name='createdAt'>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Number Of Batches" name='numberOfBatches'>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Status" name='schoolStatus' rules={[{
                                required: true,
                            }]}>
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
                                            return <Option value={item.batchNumber} label={item.batchNumber} key={item.id}>{item.batchNumber}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                    </Spin>

                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="round"
                        block
                        style={{ color: "white", backgroundColor: "DodgerBlue", margin: "2px" }}
                    >Save</Button>
                </Form>
                <UploadStudentsBulkWithoutRMN school={props.tempData?.id} disableDropdown={true} uploadButtonStyle={true} />
            </Spin >
        </>
    );
};

export default SchoolForm;