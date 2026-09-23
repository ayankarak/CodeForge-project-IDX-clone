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