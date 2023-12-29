"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import NaijaStates from 'naija-state-local-government';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import useGetUserData from "@/hooks/useGetUserData";
import formValidator from "@/services/validation";


const AddCustomer = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const {userData} = useGetUserData();
  const [formData, setFormData] = useState({
    employeeId: "",
    companyName: "",
    state: "",
    lga: "",
    city: "",
    address: "",
    companyWebsite: "",
    industry: "",
    customerType: "",
    enquirySource: "",
    name: "",
    designation: "",
    email: "",
    phoneNumber: ""
  })
  const [errors, setErrors] = useState({});


  useEffect(() => {
    console.log(userData);
    setFormData( prevState => ({
      ...prevState,
      employeeId: userData?.id
    }))
  }, [userData])

  const listStateOptions = () => {
    return NaijaStates.states().map(state =>{
      if(state === "Federal Capital Territory"){
        return <option key="Abuja" value={`Abuja`}>Abuja</option>
      }
      return <option key={state} value={state}>{state}</option>
    }
    )
  }
  
  const listLgaOptions = (state) => {
    if (state) {
      return NaijaStates.lgas(state).lgas.map(lga =>
        <option key={lga} value={lga}>{lga}</option>
      )
    }
  }

  const handleChange = (props) => (event) =>{
    if(props === "state"){
      setFormData(prevState => ({
        ...prevState,
        lga: "",
      }))
    }
    setFormData(prevState => ({
      ...prevState,
      [props]: event.target.value
    }))
    setErrors( prevState =>({
      ...prevState,
      [props]: ""
    }))
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/customer", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allCustomers"])
        router.push("/customers")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData)
    let errors = formValidator(["companyName", "industry", "customerType", "enquirySource"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Customer</h4>
        <span className="breadcrumb-item ms-3"><a href="/customers"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Customer</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="companyName" className="form-label">Company Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" value={formData.companyName} onChange={handleChange("companyName")} className="form-control shadow-none" id="companyName" placeholder="Company Name" />
                  <span className='text-danger font-monospace small'>{errors.companyName}</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="mb-3 me-3 w-50">
                    <label htmlFor="state" className="form-label">State </label>
                    <select className="form-select shadow-none" value={formData.state} onChange={handleChange("state")} id="state" aria-label="Default select example">
                      <option value="">Select State</option>
                      {listStateOptions()}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.state}</span>
                  </div>
                  <div className="mb-3 w-50">
                    <label htmlFor="lga" className="form-label">LGA </label>
                    <select className="form-select shadow-none" value={formData.lga} onChange={handleChange("lga")} id="lga" aria-label="Default select example">
                      <option value="">Select LGA</option>
                      {listLgaOptions(formData.state)}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.lga}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">City </label>
                  <input type="text" className="form-control shadow-none" id="companyWebsite" value={formData.city} onChange={handleChange("city")} placeholder="name of city" />
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea className="form-control shadow-none" id="address" value={formData.address} onChange={handleChange("address")} rows={3} placeholder="Building Name/Number/Street"></textarea>
                  <span className='text-danger font-monospace small'>{errors.address}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="companyWebsite" className="form-label">Company Website</label>
                  <input type="text" className="form-control shadow-none" id="companyWebsite" value={formData.companyWebsite} onChange={handleChange("companyWebsite")} placeholder="www.companywebsite.com" />
                </div>

                <div className="mb-3">
                  <label htmlFor="industry" className="form-label">Industry  (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none  me-2" id="industry" value={formData.industry} onChange={handleChange("industry")} aria-label="Default select example">
                      <option value="">Select Industry</option>
                      <option value="agric">Agric</option>
                      <option value="construction">Construction</option>
                      <option value="distribution">Distribution</option>
                      <option value="food and beverage">Food & Beverage</option>
                      <option value="government">Government</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="oil and gas">Oil & Gas</option>
                      <option value="transportation">Transportation</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.industry}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="customertype" className="form-label">Customer Type  (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none me-2 " id="customertype" value={formData.customerType} onChange={handleChange("customerType")} aria-label="Default select example">
                      <option value="">Select Customer Type</option>
                      <option value="Individual">Individual</option>
                      <option value="Agent">Agent</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.customerType}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="enquirySource" className="form-label">Enquiry Source (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none me-2 " id="enquirySource" value={formData.enquirySource} onChange={handleChange("enquirySource")} aria-label="Default select example">
                      <option value="">Select Enquiry Source</option>
                      <option value="Walk-In">Walk-In</option>
                      <option value="Repeat">Repeat</option>
                      <option value="Telephone">Telephone</option>
                      <option value="Field Enquiry">Field Enquiry</option>
                      <option value="Advert">Advert</option>
                      <option value="Referral">Referral</option>
                      <option value="Dealer">Dealer</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.enquirySource}</span>
                </div>

                <h5 className="card-title fw-semibold mb-4 opacity-75 mt-5"> Add Contact Person </h5>
                <div className="card-body p-4">
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
                </div>

                <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCustomer