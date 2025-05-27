// components/CKEditorDecoupledWrapper.js
'use client';
import React, { useEffect, useRef, useState } from 'react';

function EditorDecoupledWrapper(props) {
  const editorInstanceRef = useRef(null); // Untuk menyimpan instance editor aktual
  const toolbarContainerRef = useRef(null);
  const editorModulesRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    editorModulesRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
      DecoupledEditor: require('@ckeditor/ckeditor5-build-decoupled-document'), // Gunakan build yang benar
    };
    setIsMounted(true);

    return () => {
      if (
        editorInstanceRef.current &&
        typeof editorInstanceRef.current.destroy === 'function'
      ) {
        editorInstanceRef.current
          .destroy()
          .catch((error) => console.error('Error destroying editor:', error));
        editorInstanceRef.current = null;
      }
    };
  }, []);

  if (
    !isMounted ||
    !editorModulesRef.current?.CKEditor ||
    !editorModulesRef.current?.DecoupledEditor
  ) {
    return (
      props.loadingComponent || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Memuat Editor...
        </div>
      )
    );
  }

  const { CKEditor, DecoupledEditor } = editorModulesRef.current;

  return (
    <div className="document-editor-container" style={props.containerStyle}>
      <div
        className="toolbar-container"
        ref={toolbarContainerRef}
        style={props.toolbarStyle}
      >
        {/* Toolbar akan dimasukkan di sini */}
      </div>
      <div className="editor-instance-container" style={props.editorStyle}>
        <CKEditor
          editor={DecoupledEditor}
          data={props.data || ''}
          config={props.config}
          onReady={(editor) => {
            editorInstanceRef.current = editor; // Simpan instance editor
            console.log('DecoupledEditor siap digunakan!', editor);

            if (toolbarContainerRef.current) {
              while (toolbarContainerRef.current.firstChild) {
                toolbarContainerRef.current.removeChild(
                  toolbarContainerRef.current.firstChild,
                );
              }
              toolbarContainerRef.current.appendChild(
                editor.ui.view.toolbar.element,
              );
            } else {
              console.warn('Container untuk toolbar tidak ditemukan.');
            }

            if (props.onReady) {
              props.onReady(editor);
            }
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            if (props.onChange) {
              props.onChange(data);
            }
          }}
          onError={(error, { phase }) => {
            console.error('CKEditor Error:', error, 'Phase:', phase);
            if (props.onError) {
              props.onError(error, { phase });
            }
          }}
          disabled={props.disabled || false}
        />
      </div>
      <style jsx global>{`
        .document-editor-container {
          border: 1px solid var(--ck-color-base-border, #ccc);
          border-radius: var(--ck-border-radius, 5px);
          max-width: 950px;
          margin: 2em auto;
          background-color: #f9f9f9;
        }
        .toolbar-container {
          background-color: var(--ck-color-toolbar-background, #fff);
          border-bottom: 1px solid var(--ck-color-base-border, #ccc);
          padding: 5px;
        }
        .toolbar-container .ck-toolbar {
          border: none;
        }
        .editor-instance-container .ck-editor__editable_inline {
          min-height: 400px;
          padding: calc(1.5 * var(--ck-spacing-large, 1.5em));
          background: var(--ck-color-base-surface, #fff);
          border-bottom-left-radius: var(--ck-border-radius, 5px);
          border-bottom-right-radius: var(--ck-border-radius, 5px);
        }
        :root {
          /* Mengatasi masalah z-index dropdown di Next.js */
          --ck-z-default: 100;
          --ck-z-modal: calc(var(--ck-z-default) + 999);
        }
      `}</style>
    </div>
  );
}

export default EditorDecoupledWrapper;
