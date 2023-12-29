"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import NaijaStates from 'naija-state-local-government';
import { useRouter } from "next/navigation";
import formValidator from "@/services/validation";

const EditBranch = () => {
  const params = useParams();
  const { id } = params;
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ["allBranches", id],
    queryFn: () => apiGet({ url: `/branch/${id}` })
      .then(res => {
        console.log(res.data)
        return res.data
      })
      .catch(error => {
        console.log(error.message)
        dispatchMessage({ severity: "error", message: error.message })
        return {}
      }),
      staleTime: Infinity,
      retry: 3
  })

  const companyQuery = useQuery({
    queryKey: ["allCompanies"],
    queryFn: () => apiGet({url: "/company?isActive=true"})
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
      if(state === "Federal Capital Territory"){
        return <option key="Abuja" value={`Abuja`}>Abuja</option>
      }
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


  useEffect(() => {
    if (data) {
      let { name, companyId, code, state, lga, email, isHeadOffice, phoneNumber, address } = data;
      setFormData(prevState => ({
        ...prevState,
        name, companyId, code, state, lga, email, isHeadOffice, phoneNumber, address
      }))
    }
  }, [data])


  const [formData, setFormData] = useState({
    name: "",
    companyId: "",
    code: "",
    state: "",
    lga: "",
    email: "",
    isHeadOffice: "",
    phoneNumber: "",
    address: "",
  })

  const [errors, setErrors] = useState({});

  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }
  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPatch({ url: `/branch/${id}`, data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allBranches", id])
        router.push(`/branches/${id}`)
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
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
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Edit Branch Details</h5>
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
                  <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")} />
                  <span className='text-danger font-monospace small'>{errors.name}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="code" className="form-label">Branch Code</label>
                  <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange("email")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea className="form-control" id="address" rows={4} value={formData.address} onChange={handleChange("address")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" id="phone" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="state" className="form-label">State </label>
                  <select className="form-select shadow-none" value={formData.state} onChange={handleChange("state")} id="state" aria-label="Default select example">
                    <option value="">Select State</option>
                    {listStateOptions()}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="lgaId" className="form-label">Local Govt Area </label>
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

export default EditBranch