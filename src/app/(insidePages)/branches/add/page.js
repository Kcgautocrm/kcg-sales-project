"use client"

import { useEffect, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import NaijaStates from 'naija-state-local-government';
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import formValidator from "@/services/validation";

const AddBranch = () =>{
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId")
  const [formData, setFormData] = useState({
    name: "",
    companyId: "",
    code: "",
    state: "",
    lga: "",
    email: "",
    isHeadOffice: false,
    phoneNumber: "",
    address: "",
  })
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    setFormData( prevState =>({
      ...prevState,
      companyId: companyId
    }))
  }, [])

  const companyQuery = useQuery({
    queryKey: ["allCompanies"],
    queryFn: () => apiGet({url: "/company"})
    .then( (res) => res.data)
    .catch(error =>{
      dispatchMessage({ severity: "error", message: error.message})
      return []
    }),
    staleTime: Infinity,
    retry: 3
  })

  const listStateOptions = () => {
    return NaijaStates.states().map(state =>{
      return <option key={state} value={state}>{state}</option>
    }
    )
  }

  const listLgaOptions = (state) =>{
    if(state){
      return NaijaStates.lgas(state).lgas.map(lga =>
        <option key={lga} value={lga}>{lga}</option>
      )
    }
  }


  const listCompanyOptions = () =>{
    if(companyQuery?.data?.length){
      return companyQuery.data.map(company =>
        <option key={company.id} value={company.id}>{company.name}</option>
      )
    }
  }

  const handleCheck = () =>{
    setFormData( prevState => ({
      ...prevState,
      isHeadOffice: !prevState.isHeadOffice
    }))
  }



  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const queryClient = useQueryClient();
  const {isLoading, mutate} = useMutation({
    mutationFn: ()=>apiPost({ url: "/branch", data: formData})
    .then( res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      queryClient.invalidateQueries(["allBranches"])
      if(companyId){
        router.push(`/companies/${companyId}`)
      }else{
        router.push("/branches")
      }
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData)
    let errors = formValidator(["companyId", "name"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Branch</h4>
        <span className="breadcrumb-item ms-3"><a href="/branches"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>
      

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4" style={{maxWidth: "700px"}}>
                <h5 className="card-title fw-semibold mb-4 opacity-75">Add Branch</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="companyId" className="form-label">Company (<span className='fst-italic text-warning'>required</span>)</label>
                    <select className="form-select shadow-none" id="companyId" onChange={handleChange("companyId")} value={formData.companyId} aria-label="Default select example">
                      <option value="">Select Company</option>
                      {!companyQuery.isLoading && listCompanyOptions()}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.companyId}</span>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Branch Name (<span className='fst-italic text-warning'>required</span>)</label>
                    <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")}/>
                    <span className='text-danger font-monospace small'>{errors.name}</span>
                  </div>


                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Branch Code</label>
                    <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")}  />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control"  id="email" value={formData.email} onChange={handleChange("email")}  />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea className="form-control" id="address" rows={4} value={formData.address} onChange={handleChange("address")}></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" id="phone" value={formData.phoneNumber} onChange={handleChange("phoneNumber")}/>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="state" className="form-label">State </label>
                    <select className="form-select shadow-none" value={formData.state} onChange={handleChange("state")} id="state" aria-label="Default select example">
                      <option value="">Select State</option>
                      {listStateOptions()}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="lgaId" className="form-label">Local Govt Area</label>
                    <select className="form-select shadow-none" value={formData.lga} onChange={handleChange("lga")} id="lga" aria-label="Default select example">
                      <option value="">Select LGA</option>
                      {listLgaOptions(formData.state)}
                    </select>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={formData.isHeadOffice} onChange={handleCheck} id="isHeadOffice" />
                    <label className="form-check-label fw-bold" htmlFor="isHeadOffice" >
                      Head Office <br />
                      <div className="form-text">check this box if this is the Head Office Branch</div>
                    </label>
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

export default AddBranch