import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const App = () => {
  return <>
  
   <BrowserRouter>
     <Routes>
        <Route path='/' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dash' element={<Dashboard/>}/>
     </Routes>
   </BrowserRouter>
  
  
  </>
}

export default App