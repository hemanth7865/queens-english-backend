import { useState, useEffect, useRef } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UploadImage, { ImagesData } from "./UploadImage";
import ReactDOMServer from 'react-dom/server';


/*
 * Custom toolbar component
 */
const CustomEditorToolbar = ({ images, setImages, sectionKey }: any) => (
    <div id={"toolbar" + sectionKey}>
        <select
            title='header'
            className="ql-header"
            defaultValue={''}
            onChange={(e) => e.persist()}
        >
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value="4"></option>
            <option selected></option>
        </select>
        <select title="font" className="ql-font"><option></option><option value="serif"></option><option value="monospace"></option></select>
        <button title="bold" className="ql-bold"></button>
        <button title="italic" className="ql-italic"></button>
        <select title="color" className="ql-color">
            <option value="red"></option>
            <option value="blue"></option>
            <option selected></option>
        </select>
        <button title="strike" className="ql-strike"></button>
        <button title="link" className="ql-link"></button>
        <button title="underline" className="ql-underline"></button>
        <button title="blockquote" className="ql-blockquote"></button>
        <button title="code-block" className="ql-code-block"></button>
        <span className="ql-formats">
            <button type="button" title="ordered list" className="ql-list" value="ordered"> </button>
            <button type="button" title="bullet list" className="ql-list" value="bullet"> </button>
        </span>
        <button title="images" className="ql-images">
            <UploadImage images={images} setImages={setImages} />
        </button>
    </div>
);

type Props = {
    sectionKey: string;
    onChange: (data: string) => any;
    defaultValue: string;
}

const RichEditor = ({ sectionKey, onChange, defaultValue }: Props) => {
    const [editorState, setEditorState] = useState<string>(defaultValue);
    const [images, setImages] = useState<string[]>([])
    const editorRef = useRef<null | ReactQuill>(null);

    useEffect(() => {
        if (images.length > 0) {
            const imagesHTML = ReactDOMServer.renderToString(<ImagesData images={images} />);
            setEditorState((state) => imagesHTML + state);
        }
        console.log(images);
    }, [images]);

    useEffect(() => {
        if (editorState) {
            onChange(editorState);
        }
    }, [editorState]);

    return (
        <div style={{ width: "100%" }} id="LessonScriptEditor">
            <CustomEditorToolbar images={images} setImages={setImages} sectionKey={sectionKey}></CustomEditorToolbar>
            <ReactQuill theme="snow" value={editorState} onChange={setEditorState} ref={editorRef} formats={[
                'header',
                'font',
                'bold',
                'italic',
                'underline',
                'strike',
                'blockquote',
                'code-block',
                'list',
                'bullet',
                'indent',
                'link',
                'image',
                'color',
            ]} modules={{
                toolbar: {
                    container: "#toolbar" + sectionKey,
                }
            }} />
        </div>
    )
}

export default RichEditor;