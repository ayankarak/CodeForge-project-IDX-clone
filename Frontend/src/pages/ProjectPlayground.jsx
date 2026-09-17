import { useParams } from "react-router-dom";
import { EditorComponent } from "../components/molecules/EditorComponent";

export const ProjectPlayground = () => {
    const { projectId } = useParams();

    return (
        <>
            project ID:{projectId}
            <h1>Project Playground</h1>
            <p>Welcome to the Project Playground!</p>
            <EditorComponent />
        </>
    );
}