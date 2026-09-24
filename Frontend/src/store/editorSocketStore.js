import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";

export const useEditorSocketStore = create((set) => ({
    editorSocket: null,
    setEditorSocket: (incomingSocket) => {

        const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
        const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure;


        incomingSocket?.on("readFileSuccess", (data) => {
            console.log("Read file success", data);
            const fileExtension = data.path.split('.').pop();
            activeFileTabSetter(data.path, data.value, fileExtension);
        });

        incomingSocket?.on("writeFileSuccess", (data) => {
            console.log("Write file success", data);
            // incomingSocket.emit("readFile", {
            //     pathToFileOrFolder: data.path
            // })
        });

        incomingSocket?.on("deleteFileSuccess", () => {
            projectTreeStructureSetter();
        });

        incomingSocket?.on("deleteFolderSuccess", () => {
            //console.log("Folder deleted successfully");
            projectTreeStructureSetter();

        });

        incomingSocket?.on("createFileSuccess", () => {
            console.log("File created successfully");
            projectTreeStructureSetter();
        });

        incomingSocket?.on("createFolderSuccess", () => {
            console.log("Folder created successfully");
            projectTreeStructureSetter();
        });

        set({
            editorSocket: incomingSocket
        });
    }
}));