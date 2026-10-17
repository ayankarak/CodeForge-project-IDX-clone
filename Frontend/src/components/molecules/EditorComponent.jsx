import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { useEditorSocketStore } from '../../store/editorSocketStore';
import { useActiveFileTabStore } from '../../store/activeFileTabStore';
import { extensionToFileType } from '../../utils/extensionToFileType';

export const EditorComponent = () => {
    let timerId=null;

    const [editorState, setEditorState] = useState({
        theme: null
    });

    const { editorSocket } = useEditorSocketStore();
    const { activeFileTab, setActiveFileTab } = useActiveFileTabStore();

    const timerRef = useRef(null);
    const editorRef = useRef(null);
    const applyingRemoteChangeRef = useRef(false);

    async function downloadTheme() {
        const response = await fetch('/Dracula.json');
        const data = await response.json();
        console.log(data);
        setEditorState({ ...editorState, theme: data });
    }

    function handleEditorTheme(editor, monaco) {
        monaco.editor.defineTheme('dracula', editorState.theme);
        monaco.editor.setTheme('dracula');
    }

    function handleChange(value) {
         // Do not save a change received from another tab.
        if (applyingRemoteChangeRef.current) {
            return;
        }
        if (!editorSocket || !activeFileTab?.path) {
            return;
        }
        // Clear old timer
        if(timerId != null) {
            clearTimeout(timerId);
        }
        // set the new timer
        timerId = setTimeout(() => {
            const editorContent = value;
            console.log("Sending writefile event");
            editorSocket.emit("writeFile", {
                data: editorContent,
                pathToFileOrFolder: activeFileTab.path
            })
        }, 2000);
        
    }

    // Receive changes made in other tabs of the same project.
    useEffect(() => {
        if (!editorSocket) return;

        const handleFileChanged = ({ path, data }) => {
            // Only update the editor if this file is currently active.
            if (activeFileTab?.path !== path) {
                return;
            }

            // Cancel any pending save of stale local content.
            clearTimeout(timerRef.current);
            applyingRemoteChangeRef.current = true;
            // Update Monaco immediately.
            const editor = editorRef.current;

            if (editor && editor.getValue() !== data) {
                editor.setValue(data);
            }

            // Update the Zustand active-file state too.
            setActiveFileTab( path, data,
                activeFileTab.extension
            );

            applyingRemoteChangeRef.current = false;
        };
        editorSocket.on("fileChanged", handleFileChanged);
        return () => {
            editorSocket.off("fileChanged", handleFileChanged);
        };
    }, [editorSocket, activeFileTab, setActiveFileTab, ]);

    useEffect(() => {
        downloadTheme();
    }, []);

    return (
        <>
            {   editorState.theme &&
                <Editor 
                    height={'100vh'}
                    width={'100%'}
                    defaultLanguage='javascript'
                    defaultValue='// Welcome to the playground'
                    options={{
                        fontSize: 18,
                        fontFamily: 'monospace'
                    }}
                    language={extensionToFileType(activeFileTab?.extension)}
                    onChange={handleChange}

                    value={activeFileTab?.value ? activeFileTab.value : '// Welcome to the playground'}
                    onMount={handleEditorTheme}
                />
            }
        </>
    )
}