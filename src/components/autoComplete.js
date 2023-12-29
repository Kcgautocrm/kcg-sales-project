import { useState, useEffect } from "react";
import { ClickAwayListener } from "@mui/material";

const tempOptions = ["david", "daniel", "dicta", "daddy", "mummy", "aunty cc", "aunty labe", "bro chibueze", "de earnest", "aunt pricilla", "amara", "mrs chile", "koosi", "kamsi",]

const styles = {
  dropdownMenu: {
    maxHeight: "200px",
    overflowY: "auto",
    position: "relative",
  },
  inputCloseButton: {
    position: "relative", 
    left: "-10px", 
    top: "2px", 
    marginLeft: "-40px"
  }
}
const AppAutoComplete = ({options=[], handleClickOption, initialValue="", placeholder = ""}) => {
  const [input, setInput] = useState("") 
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)

  useEffect(()=>{
    console.log(initialValue)
    setInput(initialValue)
  },[initialValue])

  const listOptions = () =>{
    let eligibleOptions = options.filter( item => item?.label.toLowerCase().includes(input.toLowerCase()));
    return eligibleOptions.map( item => <li className="dropdown-item" key={item.id} onClick={()=>{
      setInput(item.label);
      handleClickOption(item.id);
      setShowDropdownMenu(false);
    }}> {item.label} </li>)
  }

  return (
    <ClickAwayListener onClickAway={()=>setShowDropdownMenu(false)} >
      <div className="nav-item dropdown">
      <div className="d-flex align-items-center">
        <input className="form-control me-2"  type="search" placeholder={placeholder} aria-label="Search" value={input} onChange={(e) => {
          console.log("changed")
          setInput(e.target.value);
          handleClickOption("")
          }}  onFocus={()=>setShowDropdownMenu(true)} />
        <i className="fa-solid fa-xmark p-2 bg-white" style={styles.inputCloseButton} onClick={(e)=>{
          setInput("")
          handleClickOption("")
          }}></i>
      </div>
      {showDropdownMenu && 
      <ul className="dropdown-menu list-unstyled w-100 shadow show" style={styles.dropdownMenu}>

        {options.length > 0 && listOptions()}
      </ul>}
    </div>
    </ClickAwayListener>
    
  )
}

export default AppAutoComplete;