import './App.css'
import { useState, useEffect } from 'react'

function App() {
  useEffect(() => {
    pingApi();
  }, [])
  return (
    <>
      Hello world
    </>
  )
}

export default App
