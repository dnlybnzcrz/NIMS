import React, { useState } from 'react';
import "./Input.css";

const Input = ({onSubmit}) => {
    const [input,setInput] = useState("")

    const handleSubmit = () => {
        if(!input) return

        onSubmit(input)

        setInput("");
    }
  return (
    <div className='containerss'>
    <input className='inp' type='text'  value={input} onChange={(e)=> setInput(e.target.value)}/>
    <button className="but" onClick={handleSubmit}>Add</button>

    </div>
  )
}

export default Input;
