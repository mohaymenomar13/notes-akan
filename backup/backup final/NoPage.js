import { Link } from "react-router-dom";
export default function NoPage() {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/">Go back to home</Link>
        </div>
    )
}