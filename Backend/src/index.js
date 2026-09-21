import express from 'express';
import cors from 'cors';
import { port }from './config/serverConfig.js';
import apiRouter from './routes/index.js';
import { Server } from 'socket.io';
import{ createServer } from 'node:http';
//import { Socket } from 'node:dgram';
import chokidar from 'chokidar';
//import path from 'node:path';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';
import queryString from 'query-string'

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

    handleEditorSocketEvents(socket);

    // socket.on("disconnect", async () => {
    //     await watcher.close();
    //     console.log("editor disconnected");

    // });

});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});