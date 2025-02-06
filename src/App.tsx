import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import JoinTeam from "./components/JoinTeam";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App(){
    return (
        // set the possible navigation routes across pages in the website
        <Router>
            <Routes>
                <Route path="/" element={<SignUp/>} />
                <Route path="/LogIn" element={<LogIn/>} />
                <Route path="/JoinTeam" element={<JoinTeam/>} />
            </Routes>
        </Router>
    )
}

export default App;
