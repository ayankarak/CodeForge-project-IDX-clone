import './App.css'
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import { CreateProject } from './pages/CreateProject.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateProject />} />
    </Routes>
  )
}

export default App
