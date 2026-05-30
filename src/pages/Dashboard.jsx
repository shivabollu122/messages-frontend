import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom';
import image from "../assets/heading.jpg";
import axios from 'axios';
import { FaMessage, FaUser } from 'react-icons/fa6';
import { MdSend } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const api_url = "https://message-backend-edjz.onrender.com/mgs";

const Dashboard = () => {
    const loc = useLocation();
    const user_id = loc.state.id;
    const email = loc.state.email;

    const [sample, setsample] = useState(true);
    const [users, setusers] = useState([]);
    const [particular, setparticular] = useState({});
    const [messages, setmessages] = useState([]);
    const [mgs, setmgs] = useState({ message: "" });
    const [search, setsearch] = useState("");

    // Track unread counts per user id
    const [unreadCounts, setUnreadCounts] = useState({});
    // Track the currently open chat partner id
    const currentChatId = useRef(null);
    // Previous message counts per user for detecting new messages
    const prevMsgCounts = useRef({});

    // Ref for auto-scrolling to latest message
    const messagesEndRef = useRef(null);

    const handle = (e) => setmgs({ ...mgs, [e.target.name]: e.target.value });

    const navigate = useNavigate();

    const fetchApi = async () => {
        try {
            const res = await axios.get(api_url);
            setusers(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSignout = () => {
        setTimeout(() => {
            navigate("/", { replace: true });
        }, 500);
    };

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Poll ALL conversations in background to detect new incoming messages
    const pollAllConversations = async (usersList) => {
        for (const u of usersList) {
            if (u._id === user_id) continue;
            try {
                const res = await axios.get(`${api_url}/conversation/${user_id}/${u._id}`);
                const fetchedMessages = res.data;
                const newCount = fetchedMessages.filter(m => m.type === "received").length;
                const prevCount = prevMsgCounts.current[u._id] || 0;

                // If new received messages arrived and this is NOT the open chat, increment badge
                if (newCount > prevCount && currentChatId.current !== u._id) {
                    const diff = newCount - prevCount;
                    setUnreadCounts(prev => ({
                        ...prev,
                        [u._id]: (prev[u._id] || 0) + diff
                    }));
                }
                prevMsgCounts.current[u._id] = newCount;
            } catch (err) {
                // Silently ignore errors for background polling
            }
        }
    };

    useEffect(() => {
        fetchApi();
        const interval = setInterval(() => fetchApi(), 5000);

        return () => {
            clearInterval(interval);
            if (window.convoInterval) clearInterval(window.convoInterval);
            if (window.bgPollInterval) clearInterval(window.bgPollInterval);
        };
    }, []);

    // Once we have the users list, start background polling for notifications
    useEffect(() => {
        if (users.length === 0) return;
        if (window.bgPollInterval) clearInterval(window.bgPollInterval);
        window.bgPollInterval = setInterval(() => pollAllConversations(users), 5000);
        return () => clearInterval(window.bgPollInterval);
    }, [users]);

    const handleSpecific = async (user) => {
        setsample(false);
        currentChatId.current = user._id;

        // Clear unread badge for this user
        setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));

        if (window.convoInterval) clearInterval(window.convoInterval);

        try {
            const [particularRes, convoRes] = await Promise.all([
                axios.get(`${api_url}/${user._id}`),
                axios.get(`${api_url}/conversation/${user_id}/${user._id}`)
            ]);
            setparticular(particularRes.data);
            setmessages(convoRes.data);

            // Sync prevMsgCounts so we don't re-badge messages we already read
            const receivedCount = convoRes.data.filter(m => m.type === "received").length;
            prevMsgCounts.current[user._id] = receivedCount;

            const otherId = user._id;

            window.convoInterval = setInterval(async () => {
                try {
                    const res = await axios.get(`${api_url}/conversation/${user_id}/${otherId}`);
                    setmessages(res.data);
                    // Keep prevMsgCounts in sync for the open chat (no badge needed)
                    const rc = res.data.filter(m => m.type === "received").length;
                    prevMsgCounts.current[otherId] = rc;
                } catch (err) {
                    console.log(err);
                }
            }, 3000);

        } catch (err) {
            console.log(err);
        }
    };

    const handlebutton = async () => {
        if (mgs.message.trim() === "") {
            alert("Empty message");
            return;
        }
        try {
            const obj = {
                senderId: user_id,
                senderEmail: email,
                receiverId: particular._id,
                receiverEmail: particular.email,
                message: mgs.message
            };

            const res = await axios.put(api_url, obj);

            if (res.data.success) {
                setmessages(prev => [
                    ...prev,
                    { type: "sent", mgs: mgs.message, time: new Date() }
                ]);
                setmgs({ message: "" });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handledelete = () => {
        alert("Unable to Delete the User");
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div id="main_msgs_container">
            <nav id="navbar">
                <img src={image} width="15%" />
                <input
                    type="text"
                    placeholder='Search Friends or Messages..'
                    id='input_dash'
                    value={search}
                    onChange={(e) => setsearch(e.target.value)}
                />
                <div id="name_con">
                    <span className='name_options'>🟢</span>
                    <span className='name_options'>Hello,</span>
                    <span className='name_options'>{loc.state.name}</span>
                </div>
                <button id='signout' onClick={handleSignout}>SignOut</button>
            </nav>
            <div id="messages_div">
                <div id="first_div">
                    <h3 style={{ color: "white" }}>All Profiles</h3>
                    {filteredUsers.map(res => (
                        <div className="each_div" key={res._id}>
                            <FaUser style={{ color: "white" }} />
                            <span className='users'>{res.username}</span>
                            {res._id === user_id
                                ? <><div id="spot"></div><div id="another"></div></>
                                : (
                                    // Badge wrapper — position relative so the badge sits on the icon
                                    <div
                                        style={{ position: "relative", display: "inline-flex", cursor: "pointer" }}
                                        onClick={() => handleSpecific(res)}
                                    >
                                        <FaMessage style={{ color: "white" }} />
                                        {unreadCounts[res._id] > 0 && (
                                            <span style={{
                                                position: "absolute",
                                                top: "-8px",
                                                right: "-8px",
                                                background: "#e53935",
                                                color: "white",
                                                borderRadius: "50%",
                                                fontSize: "10px",
                                                fontWeight: "bold",
                                                minWidth: "16px",
                                                height: "16px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "0 3px",
                                                lineHeight: 1,
                                                boxShadow: "0 0 4px rgba(0,0,0,0.4)"
                                            }}>
                                                {unreadCounts[res._id] > 99 ? "99+" : unreadCounts[res._id]}
                                            </span>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    ))}
                </div>
                <div id="second_div">
                    <div id="sample_div" style={{ display: sample ? "flex" : "none" }}>
                        <div id="animation_con">
                            <span className="letters">S</span>
                            <span className="letters">T</span>
                            <span className="letters">A</span>
                            <span className="letters">R</span>
                            <span className="letters">T</span>
                            <span className="letters design">M</span>
                            <span className="letters design">E</span>
                            <span className="letters design">S</span>
                            <span className="letters design">S</span>
                            <span className="letters design">A</span>
                            <span className="letters design">G</span>
                            <span className="letters design">I</span>
                            <span className="letters design">N</span>
                            <span className="letters design">G</span>
                        </div>
                        <span style={{ color: "white", fontSize: "1.5vw" }}>Explore the Memories, Thoughts, Content.</span>
                    </div>
                    <div id='entire_msgs_div' style={{ display: sample ? "none" : "flex" }}>
                        <nav id="nav_bar_dash">
                            <div id="each_profile_div">
                                <FaUser style={{ fontSize: "2vw", color: "white" }} />
                                <h3 style={{ color: "white" }}>{particular.username}</h3>
                            </div>
                            <button id='delete_user' onClick={handledelete}>Delete User</button>
                        </nav>
                        <div id="entire_msgs_div_each">
                            <div id="mgs_visible_div">
                                {messages.map((m, i) => (
                                    <span
                                        key={i}
                                        className={m.type === "sent" ? "send_div_msg" : "receive_div_msg"}
                                    >
                                        {m.mgs}
                                    </span>
                                ))}
                                {/* Invisible anchor element — scrolled into view on new messages */}
                                <div ref={messagesEndRef} />
                            </div>
                            <div id="mgs_sender_div">
                                <input
                                    type="text"
                                    name="message"
                                    placeholder='Enter the Message...'
                                    id='mgs_input'
                                    onChange={handle}
                                    value={mgs.message}
                                    onKeyDown={(e) => e.key === "Enter" && handlebutton()}
                                />
                                <button id='send_btn' onClick={handlebutton}>
                                    <MdSend style={{ fontSize: "2vw", color: "white" }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
