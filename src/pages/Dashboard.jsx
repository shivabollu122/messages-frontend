import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import image from "../assets/heading.jpg";
import axios from 'axios';
import { FaMessage, FaUser } from 'react-icons/fa6';
import { MdSend } from 'react-icons/md';

const api_url = "https://message-backend-edjz.onrender.com/mgs";

const Dashboard = () => {
    const loc = useLocation();
    const user_id = loc.state.id;
    const email = loc.state.email;

    const [sample, setsample] = useState(true);
    const [users, setusers] = useState([]);
    const [particular, setparticular] = useState({});  // ✅ changed from []
    const [messages, setmessages] = useState({ sent: [], received: [] }); // ✅ new
    const [mgs, setmgs] = useState({ message: "" });

    const handle = (e) => setmgs({ ...mgs, [e.target.name]: e.target.value });

    const fetchApi = async () => {
        try {
            const res = await axios.get(api_url);
            setusers(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchApi();
        // ✅ F5 block removed
    }, []);

    const handleSpecific = async (user) => {
        setsample(false);
        try {
            // ✅ fetch both in parallel
            const [particularRes, convoRes] = await Promise.all([
                axios.get(`${api_url}/${user._id}`),
                axios.get(`${api_url}/conversation/${user_id}/${user._id}`)
            ]);
            setparticular(particularRes.data);
            setmessages(convoRes.data); // { sent: [...], received: [...] }
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
                // ✅ optimistically update sent messages
                setmessages(prev => ({
                    ...prev,
                    sent: [...prev.sent, { from: "me", mgs: mgs.message }]
                }));
                setmgs({ message: "" });
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div id="main_msgs_container">
            <nav id="navbar">
                <img src={image} width="15%" />
                <input type="text" placeholder='Search Friends or Messages..' id='input_dash' />
                <div id="name_con">
                    <span className='name_options'>🟢</span>
                    <span className='name_options'>Hello,</span>
                    <span className='name_options'>{loc.state.name}</span>
                </div>
                <button id='signout'>SignOut</button>
            </nav>
            <div id="messages_div">
                <div id="first_div">
                    <h3 style={{ color: "white" }}>All Profiles</h3>
                    {users.map(res => (
                        <div className="each_div" key={res._id}>
                            <FaUser style={{ color: "white" }} />
                            <span className='users'>{res.username}</span>
                            {res._id === user_id
                                ? <div id="spot"></div>
                                : <FaMessage
                                    style={{ color: "white", cursor: "pointer" }}
                                    onClick={() => handleSpecific(res)} // ✅ pass full user
                                  />
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
                            <button id='delete_user'>Delete User</button>
                        </nav>
                        <div id="entire_msgs_div_each">
                            <div id="mgs_visible_div">
                                {/* ✅ sent and received now from fresh fetch */}
                                <div className="messages_box" id='send'>
                                    {messages.sent.map((m, i) => (
                                        <span key={i} className='send_div_msg'>{m.mgs}</span>
                                    ))}
                                </div>
                                <div className="messages_box" id='Receive'>
                                    {messages.received.map((m, i) => (
                                        <span key={i} className='receive_div_msg'>{m.mgs}</span>
                                    ))}
                                </div>
                            </div>
                            <div id="mgs_sender_div">
                                <input
                                    type="text"
                                    name="message"
                                    placeholder='Enter the Message...'
                                    id='mgs_input'
                                    onChange={handle}
                                    value={mgs.message}
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
