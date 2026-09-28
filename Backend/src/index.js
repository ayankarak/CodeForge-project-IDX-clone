import express from 'express';
import cors from 'cors';
import { port }from './config/serverConfig.js';
import apiRouter from './routes/index.js';
import { Server } from 'socket.io';
import{ createServer } from 'node:http';
import chokidar from 'chokidar';
//import path from 'node:path';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';
import queryString from 'query-string'
import { handleContainerCreate, listContainer } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';

const app = express();
const server = createServer(app);
const io=new Server(server,{
  cors: {
    origin:'*',
    method:['GET','POST'],
  }
});

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

io.on('connection',(Socket)=>{
  console.log('a user connected');
})

app.use ('/api', apiRouter);

app.get('/', (req, res) => {
  return res.json({'message': 'Hello, World!'});
});

const editorNamespace = io.of('/editor');

editorNamespace.on("connection", (socket) => {
    console.log("editor connected");

    // somehow we will get the projectId from frontend;
    let projectId = socket.handshake.query['projectId'];

    console.log("Project id received after connection", projectId);

    if(projectId) {
      var watcher = chokidar.watch(`./projects/${projectId}`, {
        ignored: (path) => path.includes("node_modules"),
        persistent: true, /** keeps the watcher in running state till the time app is running */
        awaitWriteFinish: {
          stabilityThreshold: 2000 /** Ensures stability of files before triggering event */
        },
        ignoreInitial: true /** Ignores the initial files in the directory */
      });

      watcher.on("all", (event, path) => {
        console.log(event, path);
      });
    }

    socket.on("getPort", () => {
        console.log("getPort event received");
        listContainer();
    })


    handleEditorSocketEvents(socket, editorNamespace);

});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("process.cwd()");
});

const webSocketForTerminal = new WebSocketServer({
    noServer: true
});

webSocketForTerminal.on("connection", (ws, req, container) => {
    console.log("Terminal connected", container);

    handleTerminalCreation(container, ws);

    ws.on("close", () => {
        container.remove({ force: true }, (err, data) => {
            if (err) {
                console.log("Error while removing container", err);
                return;
            }

            console.log("Container removed", data);
        });
    });
});

server.on("upgrade", (req, tcp, head) => {
    /**
     * req: Incoming http request
     * socket: TCP socket
     * head: Buffer containing the first packet of the upgraded stream
     */
    // This callback will be called when a client tries to connect to the server through websocket
    const isTerminal = req.url.includes("/terminal");

    if(isTerminal) {
        console.log("req url received", req.url);
        const projectId = req.url.split("=")[1];
        console.log("Project id received after connection", projectId);

        handleContainerCreate(projectId, webSocketForTerminal, req, tcp, head);
    }
});