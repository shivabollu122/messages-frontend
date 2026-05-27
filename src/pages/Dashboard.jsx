import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import image from "../assets/heading.jpg";
import axios from 'axios';
import { FaMessage, FaUser } from 'react-icons/fa6';
import { MdSend } from 'react-icons/md';

const Dashboard = () => {
    let loc = useLocation();

    let user_id = loc.state.id;

    let u_name = loc.state.name;

    
    let [email,setemail] = useState(loc.state.email);
        
    let [sample,setsample] = useState(true);
    
    let handle=(e)=>{
        setmgs({...mgs,[e.target.name]:e.target.value});
    }    
    
    let [users,setusers] = useState([]);
    let [particular,setparticular] = useState([]);
    
    let [receive,setreceive] = useState(particular.receive || []);
    let [sent,setsent] = useState(loc.state.sent || []);
    let[mgs,setmgs] = useState({message:""});

    
    let api_url = "https://message-backend-edjz.onrender.com/mgs";
    
    let fetchApi=async()=>{
        await axios.get(api_url).then(res=>setusers(res.data)).catch(err=>console.log(err));
    }

    useEffect(()=>{
        fetchApi();
         const handleKeyDown = (e) => {

        if (
         e.key === "F5" ||
         (e.ctrlKey && e.key === "r")
        ) {
         e.preventDefault();
        }

    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    },[])        

    let handleSpecific=async(id)=>{
        setsample(false);
        let res = await axios.get(`https://message-backend-edjz.onrender.com/mgs/${id}`).then(res=>setparticular(res.data)).catch(err=>console.log(err));
    }
    
let handlebutton = async () => {

    if (mgs.message.trim() === "") {
        alert("Empty message");
        return;
    }

    try {

    let obj = {

        senderId:user_id,
        senderEmail:email,

        receiverId:particular._id,
        receiverEmail:particular.email,

        message:mgs.message
    }

        let res = await axios.put(api_url,obj);

        if (res.data.success) {

            setsent((prev) => [
                ...prev,
                {
                    to: particular.email,
                    mgs: mgs.message
                }
            ]);

            setreceive((prev) => [
                ...prev,
                {
                    from: email,
                    mgs: mgs.message
                }
            ]);

            setmgs({
                message: ""
            });

        }

    } catch (err) {
        console.log(err);
    }

}

   
 let fl = sent.filter(u => u.to === particular.email);

 let al = users.find(u=>u._id === user_id);
 
 let s;

 if(al){
    s = al.receive.filter(u=>u.from === particular.email);
 }else{
    null;
 } 
    return <>
    <div id="main_msgs_container">
        <nav id="navbar">
            <img src={image} width="15%"/>
            <input type="text" placeholder='Search Friends or Messages..' id='input_dash'/>
            <div id="name_con">
                <span className='name_options'>🟢</span>
                <span className='name_options'>Hello,</span>
                <span className='name_options'>{loc.state.name}</span>
            </div>
            <button id='signout'>SignOut</button>
        </nav>
        <div id="messages_div">
            <div id="first_div">
                <h3 style={{color:"white"}}>All Profiles</h3>
                {
                    users.map(res=>{
                        return <div className="each_div" key={res._id}>
                            {
                                res._id===user_id ? <><FaUser style={{color:"white"}}/><span className='users'>{res.username}</span> <div id="spot"></div><div id="another"></div></> : <><FaUser style={{color:"white"}}/><span className='users'>{res.username}</span> <FaMessage style={{color:"white",cursor:"pointer"}} onClick={()=>handleSpecific(res._id)}/></>
                            }
                        </div>
                    })
                }
            </div>
            <div id="second_div">
                <div id="sample_div" style={{display:sample ? "flex" : "none"}}>
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
                    <span style={{color:"white",fontSize:"1.5vw"}}>Explore the Memories,Thoughts,Content.</span>
                </div>
                <div id='entire_msgs_div'  style={{display:sample ? "none" : "flex"}}>
                    <nav id="nav_bar_dash">
                        <div id="each_profile_div">
                            <FaUser style={{fontSize:"2vw",color:"white"}}/>
                        {
                            <h3 style={{color:"white"}}>{particular.username}</h3>
                        }
                        </div>
                        <button id='delete_user'>Delete User</button>
                    </nav>
                    <div id="entire_msgs_div_each">
                        <div id="mgs_visible_div">
                            <div className="messages_box" id='Receive'>
                                {
                                    s && s.map((res,index)=>{
                                        return <span key={index} className='receive_div_msg'>{res.mgs}</span>
                                    })
                                }
                            </div>
                            <div className="messages_box" id='send'>
                                {
                                   fl &&  fl.map((res,index)=>{
                                        return <span key={index} className='send_div_msg'>{res.mgs}</span>
                                    })
                                }
                            </div>
                        </div>
                        <div id="mgs_sender_div">
                            <input type="text" name="message" placeholder='Enter the Message...' id='mgs_input' onChange={handle} value={mgs.message}/>
                            <button id='send_btn' onClick={handlebutton}><MdSend style={{fontSize:"2vw",color:"white"}}/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
}

export default Dashboard