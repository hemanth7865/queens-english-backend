import React, { useEffect, useMemo, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Spin,
    notification,
    Checkbox,
    Table
} from 'antd';
import { getSra, createSchool, editSchool, listBatchForSchool, listLocation, deactivateSchool } from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import UploadStudentsBulkWithoutRMN from '@/pages/StudentList/components/UploadStudentsBulkWithoutRMN';
import { USER_STATUS } from '@/components/Constants/constants';

const { Option } = Select;

export type SchoolFormProps = {
    tempData: {
        operation?: string,
        id?: string,
        schoolName?: string,
        schoolCode?: string,
        locationCode?: string,
        schoolId?: string,
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
        lockLesson?: boolean;
    }
};

const SchoolForm: React.FC<SchoolFormProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
    const [sra, setSra] = useState<any>([]);
    const [batches, setBatches] = useState<any>([]);
    const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
    const [countries, setCountries] = useState<any>([]);
    const [selectedCountry, setSelectedCountry] = useState<any>(false);
    const [loadingStates, setLoadingStates] = useState<boolean>(false);
    const [states, setStates] = useState<any>([]);
    const [selectedState, setSelectedState] = useState<any>(false);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);
    const [cities, setCities] = useState<any>([]);
    const [selectedCity, setSelectedCity] = useState<any>(false);
    const [isLockLessonChecked, setIsLockLessonChecked] = useState<boolean>(false);
    const [deactivateResponse, setDeactivateResponse] = useState<any>(null);

    const handleLockLessonChange = (e: any) => {
        setIsLockLessonChecked(e.target.checked);
        form.setFieldsValue({ lockLesson: e.target.checked });
    };

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

    const inactivateSchool = async (schoolId: string | undefined) => {
        if (!schoolId) {
            openNotification({
                success: false,
                create: false,
                message: "Please provide valid school Id."
            })
            return;
        }
        setIsLoading(true);
        try {
            const response = await deactivateSchool(schoolId);
            if (response.error) throw new Error(response.message);
            setDeactivateResponse(response);

            openNotification({
                success: true,
                create: false,
                message: `School ${props?.tempData?.schoolName} has been inactivated successfully.`
            })
            const anyFailure = Object.keys(response).some((key) => response[key].failure > 0)
            if (!anyFailure) {
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        } catch (error: any) {
            openNotification({
                success: false,
                create: false,
                message: error?.message
            })
        } finally {
            setIsLoading(false);
        }
    }

    const onFinish = async (value: any) => {
        const oldData = props.tempData;
        if (oldData?.schoolStatus !== USER_STATUS.INACTIVE_CAPS && value.schoolStatus === USER_STATUS.INACTIVE_CAPS) {
            inactivateSchool(oldData?.id);
            return;
        }
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
            locationCode: value?.locationCode?.toUpperCase(),
            schoolId: value?.schoolCode?.toUpperCase() + value?.locationCode?.toUpperCase(),
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
            city: value?.city,
            lockLesson: value?.lockLesson ?? false,
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
            id: props.tempData?.id,
            schoolName: props.tempData?.schoolName,
            schoolCode: props.tempData?.schoolCode,
            locationCode: props.tempData?.locationCode,
            schoolId: props.tempData?.schoolId,
            poc: props.tempData?.poc,
            sra: props.tempData?.sra?.id,
            schoolStatus: props.tempData?.schoolStatus,
            createdAt: props.tempData?.createdAt,
            numberOfBatches: props.tempData?.classes?.length,
            batches: props.tempData?.classes?.map((item: any) => item.batchNumber),
            location: props.tempData?.location,
            lockLesson: props.tempData?.lockLesson,
        })
        setIsLockLessonChecked(props.tempData?.lockLesson ?? false)
    };
    useEffect(() => {
        defaultValues()
    }, [props.tempData])


    const DeactivateTable = () => {
        if (!deactivateResponse) return null;
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Success',
                dataIndex: 'success',
                key: 'success',
            },
            {
                title: 'Failure',
                dataIndex: 'failure',
                key: 'failure',
            }
        ];

        const data = useMemo(() => {
            return Object.keys(deactivateResponse)?.map((itemKey: string) => {
                return {
                    name: itemKey,
                    success: deactivateResponse[itemKey].success,
                    failure: deactivateResponse[itemKey].failure,
                }
            })
        }, [deactivateResponse]);

        return <Table columns={columns} dataSource={data} />;
    }

    return (
        <>
            <Spin spinning={isLoading} tip="Please wait, this might take upto 1-2 mins." >
                {contextHolder}

                {props?.tempData?.schoolStatus !== "Inactive" && (
                    <>
                        <Button type="primary" onClick={() => {
                            inactivateSchool(props?.tempData?.id);
                        }} style={{ marginBottom: 16, marginLeft: 20 }}>
                            Deactivate School
                        </Button>
                        <DeactivateTable />
                    </>
                )}

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
                        }, {
                            validator: (_, value) =>
                                !value.includes(" ")
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("No spaces allowed"))
                        }]}>
                            <Input maxLength={4} minLength={4} />
                        </Form.Item>
                    ) : (
                        <Form.Item label="School Code" name='schoolCode' rules={[{
                            required: true,
                        }, {
                            validator: (_, value) =>
                                !value.includes(" ")
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("No spaces allowed"))
                        }]}>
                            <Input disabled maxLength={5} minLength={3} />
                        </Form.Item>
                    )}
                    {props?.tempData?.operation === 'create' ? (
                        <Form.Item label="Location Code" name='locationCode' rules={[{
                            required: false,
                        }, {
                            validator: (_, value) =>
                                !value.includes(" ")
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("No spaces allowed"))
                        }]}>
                            <Input maxLength={3} minLength={3} />
                        </Form.Item>
                    ) : (
                        <Form.Item label="Location Code" name='locationCode' rules={[{
                            required: false,
                        }, {
                            validator: (_, value) =>
                                !value.includes(" ")
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("No spaces allowed"))
                        }]}>
                            <Input maxLength={3} minLength={3} />
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

                    <Form.Item
                        label="Lock lessons feature"
                        name="lockLesson"
                        help={`This feature will lock the lessons for the students in the school while there is due assessment for the students.\nif the feature is disabled then the feature will be disabled for all the teachers in the school as well.`}
                    >
                        <Checkbox
                            style={
                                {
                                    paddingInlineStart: "10px",
                                }
                            }
                            checked={isLockLessonChecked}
                            onChange={handleLockLessonChange}
                        />
                    </Form.Item>
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