import {
    Spin,
    Button
} from "antd";
import { useState } from "react";
import {
    dynamicAPI
} from "@/services/ant-design-pro/api";

const Reassign = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState({});
    const handleCall = async (url: string, method: string, params: any, options: any) => {
        setIsLoading(true);
        try {
            const res = await dynamicAPI(url, method, params, options);
            setResponse(res);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    return (<>
        <Spin spinning={isLoading}>
            <code>
                <pre>
                    {JSON.stringify(response, null, 4)}
                </pre>
            </code>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: "column" }}>
                <Button type="primary" onClick={() => handleCall("zoom-users/generate-active-license", "post", {}, {})}>Generate Licenes For Active Teachers</Button>
                <Button type="primary" onClick={() => handleCall("zoom-meetings/active-batches-generate-meetings", "post", {}, {})}>Generate Zoom Meeting Links For Active Batches</Button>
                <Button type="primary" onClick={() => handleCall("zoom-user/update/zak", "post", {}, {})}>Update Users ZAK Token, It should be run each two to three months</Button>
                <Button type="primary" onClick={() => handleCall("zoom-user/inactive/licenses", "get", {}, {})}>Get Inactive Teacers That Has Licenses</Button>
                <Button type="primary" onClick={() => handleCall("zoom/links/sync/cosmos", "post", {}, {})}>Sync Zoom Links To Cosmos</Button>
                <Button type="primary" onClick={() => confirm("Are you sure that you wanna reset zoom meetings settings ?") && handleCall("zoom/meetings/reset/settings", "post", {}, {})}>Reset Zoom Meetings Seetings</Button>
                <Button type="primary" onClick={() => handleCall("generate/zoom/join/links/bulk", "post", {}, {})}>Generate Students Join Link</Button>
                <Button type="primary" onClick={() => handleCall("zoom/sync/attendance", "post", {}, {})}>Sync Zoom Attendance</Button>
                <Button type="primary" onClick={() => window.open("/be/zoom/csv/meetings")}>Download Zoom Links</Button>
            </div>
        </Spin>
    </>)
}
export default Reassign;