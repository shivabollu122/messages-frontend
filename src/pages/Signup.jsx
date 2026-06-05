import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  let [scale, setscale] = useState(false);
  let nav = useNavigate();
  let [sign, setsign] = useState({ username: "", email: "", password: "" });

  let handle = (e) => {
    setsign({ ...sign, [e.target.name]: e.target.value });
  }

  let api_url = "https://message-backend-edjz.onrender.com/mgs";

  let handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const checkRes = await axios.post(`${api_url}/check-email`, { email: sign.email });
      if (checkRes.data.exists) {
        alert("User already existed");
        setsign({ username: "", email: "", password: "" });
      } else {
        await axios.post(api_url, sign);
        nav("/login");
        alert("SignUp Successful");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong. Please try again.");
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setscale(true);
    }, 900)
  }, [])

  let handleTravel = () => {
    setTimeout(() => {
      nav("/login");
    }, 300)
  }

  return <>
    <div id="main_con_signup">
      <div id="signup_form" style={{ transform: scale ? "scale(1)" : "scale(0)" }}>
        <form id='signup_form_signup' onSubmit={handlesubmit}>
          <h1 style={{ color: "white" }}>Create Your Account👋</h1>
          <span style={{ color: "gray" }}>Welcome to <span id='grads_head'>WEB MGZ</span>!Let's get you started.</span>
          <input type="text" name="username" placeholder='Enter the Full Name' className='inputs_sign' required onChange={handle} value={sign.username} />
          <input type="email" name="email" placeholder='Enter the Email' className='inputs_sign' required onChange={handle} value={sign.email} />
          <input type="password" name="password" placeholder='Enter the Password' className='inputs_sign' required onChange={handle} value={sign.password} />
          <input type="submit" value="Sign UP" id='signup_btn' />
        </form>
        <div id="OR_con">
          <div className="lines"></div>
          <span style={{ color: "gray" }}>OR</span>
          <div className="lines"></div>
        </div>
        <div id="login_con">
          <span style={{ color: "gray" }}>Already have an Account ? </span>
          <button id='login_btn' onClick={handleTravel}>Login</button>
        </div>
      </div>
    </div>
  </>
}

export default Signup;
