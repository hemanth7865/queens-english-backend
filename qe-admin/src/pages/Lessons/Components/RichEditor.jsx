import React from "react";
import { Editor } from 'react-draft-wysiwyg';
import './../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import UploadImage from "./UploadImage";

const RichEditor = () => {
    return (
        <div style={{ background: "#f2f2f2", padding: 5 }}>
            <Editor
                toolbarCustomButtons={[<UploadImage />]}
                toolbar={{
                    image: {
                        urlEnabled: false,
                        uploadEnabled: false,
                    }
                }}
            />
        </div>
    )
}

export default RichEditor;