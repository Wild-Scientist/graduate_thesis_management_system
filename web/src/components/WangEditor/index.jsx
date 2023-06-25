import React, { useEffect, useState } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import Cookies from 'js-cookie';

export default function WangEditor({
  value = '',
  uploadImgServer = '/api/upload',
  onChange = (v) => {},
}) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <>
      <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
        <Toolbar
          editor={editor}
          defaultConfig={{}}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
        <Editor
          defaultConfig={{
            MENU_CONF: {
              uploadImage: {
                server: '/api/wang_upload_image',
                fieldName: 'image',
                maxNumberOfFiles: 1,
                headers: {
                  Authorization: `Bearer ${Cookies.get('t')}`,
                },
              },
            },
          }}
          value={value}
          onCreated={setEditor}
          onChange={(editor) => onChange(editor.getHtml())}
          mode="default"
          style={{ height: '500px', overflowY: 'hidden' }}
        />
      </div>
    </>
  );
}
