import SignUp from "./components/SignUp.jsx";
import LogIn from "./components/LogIn.jsx";
import JoinTeam from "./components/JoinTeam";
import CreateTeam from "./components/CreateTeam.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Channels from "./components/Channels.tsx";
import TeamPage from "./components/TeamPage.jsx";

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
                <Route path="/Channels" element={<Channels />} />
            </Routes> {/* Ensure the Routes tag is properly closed */}
        </Router>
    );
}

export default App;