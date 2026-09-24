import "./FolderContextMenu.css";

import { useFolderContextMenuStore } from "../../../store/folderContextMenuStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";

export const FolderContextMenu = ({ x, y, path }) => {

    const { setIsOpen } = useFolderContextMenuStore();

    const { editorSocket } = useEditorSocketStore();

    function handleFolderDelete(e) {
        e.preventDefault();

        console.log("Deleting folder at", path);

        editorSocket.emit("deleteFolder", {
            pathToFileOrFolder: path
        });

        setIsOpen(false);
    }

    function handleCreateFile(e) {
        e.preventDefault();

        const fileName = prompt("Enter file name:");

        if (!fileName) { 
            return;
        }

        const newFilePath = `${path}/${fileName}`;

        console.log("Creating file at", newFilePath);
        editorSocket.emit("createFile", {
            pathToFileOrFolder: newFilePath
        });

        setIsOpen(false);
    }

    function handleCreateFolder(e) {
        e.preventDefault();

        const folderName = prompt("Enter folder name:");

        if (!folderName) {
            return;
        }

        const newFolderPath = `${path}/${folderName}`;

        console.log("Creating folder at", newFolderPath);
        editorSocket.emit("createFolder", {
            pathToFileOrFolder: newFolderPath
        });
        
        setIsOpen(false);
    }

    return (
        <div
            onMouseLeave={() => {
                setIsOpen(false);
            }}
            className="folderContextOptionsWrapper"
            style={{
                left: x,
                top: y,
            }}
        >

            <button
                className="folderContextButton"
                onClick={handleCreateFile}
            >
                New File
            </button>


            {/* Create Folder */}
            <button
                className="folderContextButton"
                onClick={handleCreateFolder}
            >
                New Folder
            </button>
            
            <button
                className="folderContextButton"
                onClick={handleFolderDelete}
            >
                Delete Folder
            </button>

            <button
                className="folderContextButton"
            >
                Rename Folder
            </button>
        </div>
    );
};