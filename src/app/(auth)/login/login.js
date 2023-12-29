"use client"
import { useState } from "react"
import { IconButton } from "@mui/material"

const LoginTemplate = ({handleChange, handleSubmit, formData, isLoading}) =>{
  const [passwordVisible, setPasswordVisible] = useState(false)


  return(
    <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
    data-sidebar-position="fixed" data-header-position="fixed">
    <div
      className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
      <div className="d-flex align-items-center justify-content-center w-100">
        <div className="row justify-content-center w-100">
          <div className="col-md-8 col-lg-6 col-xxl-3">
            <div className="card mb-0">
              <div className="card-body">
                <h3 className="mb-5 text-center">Login</h3>
                <form>
                  <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" value={formData.email} onChange={handleChange("email")} aria-describedby="emailHelp" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="exampleInputPassword1" className="form-label d-flex align-items-center mb-0">
                      <span>Password</span>
                      <IconButton className="ms-auto" onClick={()=>setPasswordVisible( prevState => !prevState)}>{passwordVisible ? <i className="fa-regular fa-eye" style={{fontSize: "16px"}}></i> : <i className="fa-regular fa-eye-slash small" style={{fontSize: "16px"}}></i> }</IconButton>
                    </label>

                    <input type={passwordVisible ? "text" : "password"} className="form-control"  value={formData.password} onChange={handleChange("password")} id="exampleInputPassword1" />
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="form-check">
                      <input className="form-check-input primary" type="checkbox" value="" id="flexCheckChecked" />
                      <label className="form-check-label text-dark" htmlFor="flexCheckChecked">
                        Remeber Me
                      </label>
                    </div>
                    <a className="text-primary fw-bold" href="/forgotPassword">Forgot Password ?</a>
                  </div>
                  <button type="button" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Log In"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default LoginTemplate