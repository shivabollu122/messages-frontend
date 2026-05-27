import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {

   let [scale,setscale] = useState(false);

   let [logdata,setlogdata] = useState({email:"",password:""});

   let handle=(e)=>{
    setlogdata({...logdata,[e.target.name]:e.target.value});
   }

  let api_url = "https://message-backend-edjz.onrender.com/mgs";

  let nav = useNavigate();


   let handlelogin=async(e)=>{
      e.preventDefault();

      await axios.get(api_url).then(res=>{
        let one = res.data;

        let existed = one.find(u=>u.email === logdata.email && u.password === logdata.password);

        if(existed){
          alert("Login SuccessFull");
          setTimeout(()=>{
            nav("/dash",{
              state:{
                email:existed.email,
                name:existed.username,
                id:existed._id,
                sent:existed.sent,
                receive:existed.receive
              }
            })
          },500)
        }else{
          alert("invalid Credentials")
        }
      })

   }
   
   useEffect(()=>{
    setTimeout(()=>{
        setscale(true);
    },500)
   },[])



  return <>
  
  <div id="main_login_con">
    <form id="login_form" style={{transform:scale ? "scale(1)" : "scale(0)"}} onSubmit={handlelogin}>
        <h1 style={{color:"white"}}>Login⚡</h1>
        <span style={{color:"gray"}}>Login to <span id='grads_head'>WEB MGZ</span> Share the Content,Messages,Memories.</span>
        <input type="email" name="email" placeholder='Enter the Email' className='inputs_sign' onChange={handle} value={logdata.email}/>
        <input type="password" name="password" placeholder='Enter the Password' className='inputs_sign' onChange={handle} value={logdata.password}/>
        <input type="submit" value="Login" id='signup_btn'/>
    </form>
  </div>

  
  </>
}

export default Login