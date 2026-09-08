import axios from '../config/axiosConfig';

export const createProjectApi = async ()=>{
    try{
        const response = await axios.post('/api/v1/projects', {
            // project data
        });
        console.log(response.data);
        return response.data;
    }catch(error){
        console.log('Error creating project:', error);
        throw error;
    }
}