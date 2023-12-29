"use client"


import { useMutation } from "@tanstack/react-query";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useState } from "react";
import { apiPost } from "@/services/apiService";

const ForgotPasswordTemplate = () =>{
  const dispatchMessage = useDispatchMessage();
  const [formData, setFormData] = useState({
    email: "",
  })

  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/auth/forgotPassword", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    //return console.log(formData)
    mutate()
  }


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
                <h3 className="mb-5 text-center">Forgot Password</h3>
                <form>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" aria-describedby="emailHelp" onChange={handleChange("email")} />
                  </div>
                  <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
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

export default ForgotPasswordTemplate;