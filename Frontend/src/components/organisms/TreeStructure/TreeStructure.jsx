import { useTreeStructureStore } from "../../../store/treeStructureStore"
import { useCallback,useEffect } from "react";
import { TreeNode } from "../../molecules/TreeNode/TreeNode";
import { FileContextMenu } from "../../molecules/ContextMenu/FileContextMenu";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { FolderContextMenu } from "../../molecules/ContextMenu/FolderContextMenu";
import { useFolderContextMenuStore } from "../../../store/folderContextMenuStore";
import { useClipboardStore } from "../../../store/clipboardStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";

export const TreeStructure = () => {

    const {treeStructure, setTreeStructure } = useTreeStructureStore();
    const { 
        file,
        isOpen: isFileContextOpen, 
        x: fileContextX, 
        y: fileContextY } = useFileContextMenuStore();

        const {
            folder,
            isOpen: isFolderContextOpen,
            x: folderContextX,
            y: folderContextY
        } = useFolderContextMenuStore();


    const handleKeyDown = useCallback((e) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;

        if (!isCtrlOrCmd) return;

        const {
            selectedPath,
            selectedType,
            copiedPath,
            copiedType,
            copyItem,
        } = useClipboardStore.getState();

        // Ctrl + C: Copy selected file/folder
        if (e.key.toLowerCase() === "c" && selectedPath) {
            // Don't intercept text copying inside the editor/input
            if (
                e.target instanceof HTMLElement &&
                (e.target.isContentEditable ||
                    ["INPUT", "TEXTAREA"].includes(e.target.tagName))
            ) {
                return;
            }

            e.preventDefault();
            copyItem();
            console.log("Copied:", selectedPath, selectedType);
        }

        // Ctrl + V: Paste into selected folder
        if (e.key.toLowerCase() === "v" && copiedPath) {
            if (
                e.target instanceof HTMLElement &&
                (e.target.isContentEditable ||
                    ["INPUT", "TEXTAREA"].includes(e.target.tagName))
            ) {
                return;
            }

            const current = useClipboardStore.getState();

            // A folder must be selected as the destination
            if (
                !current.selectedPath ||
                current.selectedType !== "folder"
            ) {
                console.log("Select a destination folder first");
                return;
            }

            e.preventDefault();

            // Don't paste a folder into itself
            if (
                copiedType === "folder" &&
                current.selectedPath === copiedPath
            ) {
                console.log("Cannot paste a folder into itself");
                return;
            }

            // Backend implementation comes in Step 4
            
    const { editorSocket } = useEditorSocketStore.getState();

    if (!editorSocket) {
        console.error("Editor socket is not connected");
        return;
    }

    editorSocket.emit("copyPath", {
        sourcePath: copiedPath,
        targetDirectory: current.selectedPath,
    });

        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        if(treeStructure) {
            console.log("tree:", treeStructure);
        } else {
            setTreeStructure();
        }
    }, [setTreeStructure, treeStructure]);

    return (
         <>
        {isFileContextOpen && fileContextX !== null&& fileContextY !== null&& (
            <FileContextMenu  
                x={fileContextX}
                y={fileContextY}
                path={file}
            />
        )}

        {isFolderContextOpen && folderContextX !== null && folderContextY !== null && (
            <FolderContextMenu
                x={folderContextX}
                y={folderContextY}
                path={folder}
            />
        )}
            <TreeNode
                fileFolderData={treeStructure}
            />
        </>
    )
}