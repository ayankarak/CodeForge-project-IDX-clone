import fs from "fs/promises";
import path from "path";
import { getContainerPort } from "../containers/handleContainerCreate.js"

export const handleEditorSocketEvents = (socket, editorNamespace) => {
    socket.on("writeFile", async ({ data, pathToFileOrFolder }) => {
        try {
            const response = await fs.writeFile(pathToFileOrFolder, data);
            editorNamespace.emit("writeFileSuccess", {
                data: "File written successfully",
                path: pathToFileOrFolder,
            })
        } catch(error) {
            console.log("Error writing the file", error);
            socket.emit("error", {
                data: "Error writing the file",
            });
        }
    });

    socket.on("createFile", async ({ pathToFileOrFolder }) => {
        try {
            await fs.stat(pathToFileOrFolder);

            socket.emit("error", {
                data: "File already exists",
            });

            return;

        } catch (error) {
            if (error.code !== "ENOENT") {
                console.log("Error checking file:", error);

                socket.emit("error", {
                    data: "Error checking file",
                });

                return;
            }
        }

        try {
            await fs.writeFile(pathToFileOrFolder, "");

            socket.emit("createFileSuccess", {
                data: "File created successfully",
            });

        } catch (error) {
            console.log("Error creating the file", error);

            socket.emit("error", {
                data: "Error creating the file",
            });
        }
    });


    socket.on("readFile", async ({ pathToFileOrFolder }) => {
        try {
            const response = await fs.readFile(pathToFileOrFolder);
            console.log(response.toString());
            socket.emit("readFileSuccess", {
                value: response.toString(),
                path: pathToFileOrFolder,
            })
        } catch(error) {
            console.log("Error reading the file", error);
            socket.emit("error", {
                data: "Error reading the file",
            });
        }
    });

    socket.on("deleteFile", async ({ pathToFileOrFolder }) => {
        try {
            const response = await fs.unlink(pathToFileOrFolder);
            socket.emit("deleteFileSuccess", {
                data: "File deleted successfully",
            });
        } catch(error) {
            console.log("Error deleting the file", error);
            socket.emit("error", {
                data: "Error deleting the file",
            });
        }
    });

    socket.on("createFolder", async ({ pathToFileOrFolder}) => {
        try {
            const response = await fs.mkdir(pathToFileOrFolder);
            socket.emit("createFolderSuccess", {
                data: "Folder created successfully",
            });
        } catch(error) {
            console.log("Error creating the folder", error);
            socket.emit("error", {
                data: "Error creating the folder",
            });
        }
    });

    socket.on("deleteFolder", async ({ pathToFileOrFolder }) => {
        try {
            const response = await fs.rm(pathToFileOrFolder, { recursive: true, force: true });
            socket.emit("deleteFolderSuccess", {
                data: "Folder deleted successfully",
            });
        } catch(error) {
            console.log("Error deleting the folder", error);
            socket.emit("error", {
                data: "Error deleting the folder",
            });
        }
    });

    socket.on("getPort", async ({ containerName }) => {
        const port = await getContainerPort(containerName);
        console.log("port data", port);
        socket.emit("getPortSuccess", {
            port: port,
        })
    })

    socket.on("renameFolder", async ({ oldPathToFileOrFolder, newPathToFileOrFolder }) => {
        try {
            const response = await fs.rename(oldPathToFileOrFolder, newPathToFileOrFolder);
            socket.emit("renameFolderSuccess", {
                data: "Folder renamed successfully",
            });
        } catch(error) {
            console.log("Error renaming the folder", error);
            socket.emit("error", {
                data: "Error renaming the folder",
            });
        }
    });

    socket.on("copyPath", async ({ sourcePath, targetDirectory }) => {
        try {
            const sourceName = path.basename(sourcePath);
            const destinationPath = path.join(
                targetDirectory,
                sourceName
            );
            // Prevent copying a path onto itself
            if (path.resolve(sourcePath) === path.resolve(destinationPath)) {
                socket.emit("error", {
                    data: "Source and destination are the same",
                });
                return;
            }
            // Don't overwrite an existing file/folder
            try {
                await fs.access(destinationPath);
                socket.emit("error", {
                    data: "A file or folder with this name already exists",
                });
                return;
            } catch (error) {
                if (error.code !== "ENOENT") throw error;
            }
            await fs.cp(sourcePath, destinationPath, {
                errorOnExist: true,
                force: false,
            });
            socket.emit("copyPathSuccess", {
                data: "Copied successfully",
                path: destinationPath,
            });
        } catch (error) {
            console.error("Copy error:", error);

            socket.emit("error", {
                data: "Unable to copy file or folder",
            });
        }
    }
);


}