import * as React from "react";
import "../style.css";
import {getUserChannels, getUserTeam} from "../backend/Queries/getUserFields.jsx";

//temp page to show channels, uses team CSS styling for assets
function ChannelList() {
    const [channels, setChannels] = React.useState([]);

    React.useEffect(() => {
        const getChannelNames = async () => {
            const userChannels = await getUserChannels();
            const teamID = await getUserTeam();
            const channelList = [];

            for (const userChannel of userChannels) {
                if (userChannel.includes(teamID)) {
                    const channelName = userChannel.replace(teamID, "");
                    channelList.push({ name: channelName, id: userChannel });
                }
            }

            setChannels(channelList);
        };

        getChannelNames();
    }, []);


    return (
        <div className="wrapper"> {/*use wrapper styling from css file*/}
            <h1>Channels</h1>
            <div id="list" style={{ width: "max(80%, 500px)" }}>
            <ul className="team-list">
                    {channels.map((channel) => (
                        <li key={channel.id} className="team-item">
                            <span className="team-name">{channel.name}</span> {/*use team-name class css styling*/}
                            <button className="open-button">Open</button> {/*needs onClick function to connect to channel (Sprint 2)*/}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChannelList;
