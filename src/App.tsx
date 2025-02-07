import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import JoinTeam from "./components/JoinTeam";
import CreateTeam from "./components/CreateTeam";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TeamPage from "./components/TeamPage"; 

function App() {
    return (
        // Set the possible navigation routes across pages in the website
        <Router>
            <Routes>
                <Route path="/" element={<SignUp />} />
                <Route path="/LogIn" element={<LogIn />} />
                <Route path="/JoinTeam" element={<JoinTeam />} />
                <Route path="/CreateTeam" element={<CreateTeam />} />
                <Route path="/TeamPage" element={<TeamPage />} />
            </Routes> {/* Ensure the Routes tag is properly closed */}
        </Router>
    );
}

export default App;