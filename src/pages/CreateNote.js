import { useNavigate, useParams } from "react-router-dom"
export default function CreateNote() {
    const { note_id } = useParams();
    const navigate = useNavigate();
    return (
        <div>
            <p>{note_id}</p>
            <form>
                <input type="text" placeholder="Enter note title" />
                <textarea placeholder="Enter note content" />
                <button type="submit">Create Note</button>
            </form>
            <button onClick={() => navigate("/")}>Back to Notes</button>
        </div>
    )
}