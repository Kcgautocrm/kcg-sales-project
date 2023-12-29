"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";

const AddContactPerson = ({ employeeId, customerId, onClose, refetchCustomer }) => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const [formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    name: "",
    designation: "",
    email: "",
    phoneNumber: ""
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      employeeId, customerId
    }))
  }, [])

  const handleChange = (props) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [props]: event.target.value
    }))
    setErrors(prevState => ({
      ...prevState,
      [props]: ""
    }))
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/contactPerson", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        refetchCustomer()
        onClose()
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    // return console.log(formData)
    mutate()
  }
  return (
    <div className="container-fluid">

      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold opacity-75 m-0">Add Contact Person</h5>
                <i className="fa-solid fa-xmark btn ms-auto" onClick={onClose}></i>
              </header>
              
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Contact Person Name</label>
                  <input type="text" className="form-control shadow-none" id="companyWebsite" value={formData.name} onChange={handleChange("name")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="designation" className="form-label">Designation</label>
                  <input type="text" className="form-control shadow-none" id="designation" value={formData.designation} onChange={handleChange("designation")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control shadow-none" id="email" value={formData.email} onChange={handleChange("email")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input type="tel" className="form-control shadow-none" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} />
                </div>


                <div className="mt-5">
                  <button type="submit" className="btn btn-primary px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
                  <a className="btn btn-outline-primary px-5 py-2 ms-3" onClick={onClose}>Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddContactPerson