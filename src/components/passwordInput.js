import { useState } from "react";


const PasswordInput = ({onChange, value, defaultValue, id="password", label="Password", disabled=false}) =>{
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <input type={showPassword ? "text" : "password"} onChange={onChange} value={value} disabled={disabled} defaultValue={defaultValue} className="form-control shadow-none border-end-0" id={id} placeholder="Set an 8-character password" />
        <span className="input-group-text bg-white border-start-0" id="basic-addon1"><i  onClick={()=>setShowPassword(prevState => !prevState)} className={`bi fs-4 ${showPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}`}></i></span>
      </div>
    </div>
  )
}

export default PasswordInput;