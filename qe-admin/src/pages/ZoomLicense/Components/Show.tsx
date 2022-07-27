import { Col, Row, Table, Space } from "antd";

interface Props {
    data: any;
}

const Show = ({ data }: Props) => {
    console.log(data);
    const columns = [
        {
            title: 'Meeting ID',
            dataIndex: "id",
            key: 'id',
        },
        {
            title: 'Batch',
            dataIndex: ["batch", "batchNumber"],
            key: 'batch',
        },
        {
            title: 'Host URL',
            dataIndex: 'start_url',
            key: 'start_url',
            render: (dom: any, entity: any) => {
                const pureLink = entity.start_url.split("?")[0];
                return <a href={pureLink + `?zak=${data.zak_token}`} target="_blank">Host URL</a>
            }
        },
        {
            title: 'Join URL',
            dataIndex: 'join_url',
            key: 'join_url',
            render: (dom: any, entity: any) => {
                return <a href={entity.join_url} target="_blank">Join URL</a>
            }
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
        },
    ];

    return data && data.id ? (
        <div>
            <h3 style={{ marginBottom: 20, textAlign: "center" }}>License Details</h3>
            <Space>
                <Row gutter={[16, 15]}>
                    <Col span={8}>
                        <div>ID</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.id}
                        </div>
                    </Col>
                    <Col span={8}>
                        <div>License Owner Name</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.first_name}
                            {data.last_name}
                        </div>
                    </Col>

                    <Col span={8}>
                        <div>License Email</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.email}
                        </div>
                    </Col>

                    <Col span={8}>
                        <div>Teacher Email</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.user?.email}
                        </div>
                    </Col>

                    <Col span={8}>
                        <div>Teacher Phone Number</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.user?.phoneNumber}
                        </div>
                    </Col>

                    <Col span={8}>
                        <div>Generated Zoom Links</div>
                    </Col>
                    <Col span={16}>
                        <div>
                            {data.meetings?.length}
                        </div>
                    </Col>

                </Row>
            </Space>
            <h3 style={{ marginTop: 20, marginBottom: 20, textAlign: "center" }}>Zoom Links Details</h3>
            <Table dataSource={data?.meetings || []} columns={columns}></Table>
        </div>
    ) : <></>;
};

export default Show;
