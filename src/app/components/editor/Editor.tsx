"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autoformat,
  Autosave,
  BlockQuote,
  Bold,
  Essentials,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./Editor.scss";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function Editor({ value, onChange }: Props) {
  const [isReady, setIsReady] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsReady(true);
    return () => setIsReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isReady) return {};

    return {
      editorConfig: {
        // ✅ GPL License
        licenseKey: "GPL",

        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "insertImage",
            "mediaEmbed",
            "insertTable",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
        },

        // ✅ Gunakan hanya plugin open source
        plugins: [
          Autoformat,
          Autosave,
          BlockQuote,
          Bold,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          Paragraph,
          PasteFromOffice,
          PictureEditing,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
        ],

        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
        },

        simpleUpload: {
          uploadUrl: "/api/upload",
        },

        placeholder: "Write here.. :)",
      },
    };
  }, [isReady]);

  return (
    <div ref={editorRef}>
      {editorConfig && (
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={value}
          onChange={(_, editor) => onChange(editor.getData())}
        />
      )}
    </div>
  );
}
