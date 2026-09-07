import utils from 'util';
import child_process from 'child_process';
import fs from 'fs/promises';
import uuid4 from 'uuid4';

const execPromisified = utils.promisify(child_process.exec);

export const createProjectController = async (req, res) => {
    const projectId = uuid4();
    console.log("new project id is: ", projectId);
    await fs.mkdir(`./projects/${projectId}`);
    // after this the npm create vite command in the newly created directory and then return a success message to the client.
    const response= await execPromisified('npm create vite@latest sandbox -- --template react', { 
        cwd: `./projects/${projectId}`
    });
    
    return res.json({ message: 'Project created successfully' });
}