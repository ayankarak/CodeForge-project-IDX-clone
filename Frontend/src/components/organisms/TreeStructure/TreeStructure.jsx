import { useTreeStructureStore } from "../../../store/treeStructureStore"
import { useEffect } from "react";
import { TreeNode } from "../../molecules/TreeNode/TreeNode";
import { FileContextMenu } from "../../molecules/ContextMenu/FileContextMenu";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { FolderContextMenu } from "../../molecules/ContextMenu/FolderContextMenu";
import { useFolderContextMenuStore } from "../../../store/folderContextMenuStore";

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