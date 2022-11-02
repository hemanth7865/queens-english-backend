import { Col, Row, Space } from "antd";

interface Props {
    data: any;
}

const UpdatedRecordData = ({ data }: Props) => {
    return (
        <div>
            {
                <Space>
                    <Row gutter={[16, 15]}>
                        <Col span={24}>
                            <div><pre style={{ width: '650px' }}>{JSON.stringify(data, null, 2)}</pre></div>
                        </Col>
                    </Row>
                </Space>
            }

        </div >
    );
};

export default UpdatedRecordData;
