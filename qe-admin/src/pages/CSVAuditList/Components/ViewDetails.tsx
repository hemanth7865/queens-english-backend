import { Button, Col, Divider, Row, Table, Tabs } from 'antd'
import TabPane from 'antd/lib/tabs/TabPane'
import moment from 'moment'
import { FC, useMemo } from 'react'

interface ViewDetailsProps {
  data: {
    errors?: string
    fileName?: string
    id?: string
    schoolId?: string
    schoolName?: string
    uploadType?: string
    uploadedAt?: string
    uploadedBy?: string
    uploadedByName?: string
  }
}

const ViewDetails: FC<ViewDetailsProps> = ({ data }) => {

  const errors = useMemo(() => {
    if (data?.errors) {
      const errorArray = JSON.parse(data?.errors)
      if (data?.uploadType === "Student Upload") {
        return errorArray.map((error: any) => ({
          data: error?.["First Name"] + " " + error?.["Last Name"] + " - " + error?.["RMN"],
          errorMessage: error?.["ErrorMessage"]
        }))
      }
      if (data?.uploadType === "Teacher Upload") {
        return errorArray.map((error: any) => ({
          data: error?.["Teacher"],
          errorMessage: error?.["Error Message"]
        }))
      }
      if (data?.uploadType === "Batch Upload") {
        return errorArray.map((error: any) => ({
          data: error?.["Batch code"],
          errorMessage: error?.["Error Message"]
        }))
      }
      return errorArray
    }
    return []
  }, [data?.errors, data?.uploadType])

  const url = useMemo(() => {
    if (data?.fileName) {
      return `https://eqbulkuploads.s3.ap-south-1.amazonaws.com/${data?.fileName}`;
    }
    return ""
  }, [data?.fileName])

  const columns = [
    {
      title: data?.uploadType?.split(" ")[0] || "Data",
      dataIndex: 'data',
      key: 'Data',
    },
    {
      title: 'Error Message',
      dataIndex: 'errorMessage',
      key: 'Error Message',
    },
  ];

  return <Tabs defaultActiveKey="1">
    <TabPane tab={moment(data?.uploadedAt).format("DD-MM-YYYY")} key="1">
      <Row gutter={[16, 15]}>

        <Col span={8}>
          <div>Upload Date</div>
        </Col>
        <Col span={16}>
          <div>
            {moment(data?.uploadedAt).isValid() ? moment(data?.uploadedAt).format("DD MMM YYYY HH:mm:ss a") : "NA"}
          </div>
        </Col>

        <Col span={8}>
          <div>School Name</div>
        </Col>
        <Col span={16}>
          <div>
            {data?.schoolName || "NA"}
          </div>
        </Col>

        <Col span={8}>
          <div>Upload Type</div>
        </Col>
        <Col span={16}>
          <div>
            {data?.uploadType || "NA"}
          </div>
        </Col>

        <Col span={8}>
          <div>Upload By</div>
        </Col>
        <Col span={16}>
          <div>
            {data?.uploadedByName || "NA"}
          </div>
        </Col>

        <Col span={8}>
          <div>CSV File</div>
        </Col>
        <Col span={16}>
          <Button type="outlined" key="primary">
            <a href={url} target="_blank">
              Download
            </a>
          </Button>
        </Col>

        <Divider />

        <Col span={24}>
          <h3>Errors</h3>
        </Col>
        <Col span={24}>
          {errors.length === 0 ? <div>No Errors while doing bulk upload.</div> : (
            <Table dataSource={errors} columns={columns} />
          )}
        </Col>

      </Row>
    </TabPane>
  </Tabs>;

}

export default ViewDetails