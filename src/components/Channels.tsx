import * as React from "react";
import "../style.css";

//temp page to show channels, uses team CSS styling for assets

const channels = [ //sample channels, to be replaced with fetch
    { name: "General", id: 143 },
    { name: "Announcements", id: 22 },
    { name: "Secret Project", id: 33 },
    { name: "Super Secret Project", id: 45 }
];

function ChannelList() {
    return (
        <div className="wrapper"> {/*use wrapper styling from css file*/}
            <h1>Channels</h1>
            <div id="list">
                <ul className="team-list">
                    {channels.map((channel) => (
                        <li key={channel.id} className="team-item">
                            <span className="team-name">{channel.name}</span> {/*use team-name class css styling*/}
                            <button className="join-button">Open</button> {/*needs onClick function to connect to channel (Sprint 2)*/}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChannelList;
