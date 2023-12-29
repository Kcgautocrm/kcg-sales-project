"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
import PasswordInput from "@/components/passwordInput";
import { useRouter } from "next/navigation";
import formValidator from "@/services/validation";

const AddEmployee = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyId: "",
    branchId: "",
    supervisorId: "",
    staffCadre: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "password1234",
    employmentDate: "",
    brandsAssigned: []
  })
  const [errors, setErrors] = useState({});


  useEffect(()=>{
    if(formData.staffCadre === "salesPerson"){
      setFormData( prevState =>({
        ...prevState,
        staffCadre: ["salesPerson"]
      }))
    }else if(formData.staffCadre === "supervisor"){
      setFormData( prevState =>({
        ...prevState,
        staffCadre: ["supervisor", "salesPerson"],
        supervisorId: ""
      }))
    }else if(formData.staffCadre === "admin"){
      setFormData( prevState =>({
        ...prevState,
        staffCadre: ["admin"],
        supervisorId: ""
      }))
    }
  }, [formData.staffCadre])

  const companyQuery = useQuery({
    queryKey: ["allCompanies"],
    queryFn: () => apiGet({ url: "/company?isActive=true" })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3
  })

  const employeeQuery = useQuery({
    queryKey: ["allEmployees"],
    queryFn: () => apiGet({ url: "/employee?isActive=true" })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3
  })

  const branchQuery = useQuery({
    queryKey: ["allBranches"],
    queryFn: () => apiGet({ url: "/branch?isActive=true" })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3
  })


  const listCompanyOptions = () =>{
    if(companyQuery.data.length > 0){
      return companyQuery.data.map(company =>
        <option key={company.id} value={company.id}>{company.name}</option>
      )
    }
  }

  const listSupervisors = () =>{
    let eligibleEmployees = employeeQuery.data.filter( employee => employee?.staffCadre.includes("supervisor"));
    if(eligibleEmployees.length > 0){
      return eligibleEmployees.map(employee =>
        <option key={employee.id} value={employee.id}>{employee.firstName} {employee.middleName[0]} {employee.lastName}</option>
      )
    }
  }

  const listBranchOptions = () =>{ 
    let branches = branchQuery.data;
    if(formData.companyId){
      branches = branches.filter( branch => branch.companyId === formData.companyId)
    }
    if(branches.length > 0){
      return branches.map(branch =>
        <option key={branch.id} value={branch.id}>{branch.name}</option>
      )
    }
  }

  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const brandsQuery = useQuery({
    queryKey: ["allBrands" ],
    queryFn:  ()=> apiGet({ url: "/brand?isActive=true"})
    .then(res => {
      console.log(res)
      return res.data
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return []
    }),
    staleTime: Infinity,
    retry: 3
  })

  const handleCheck = (brand) =>(event) =>{
    if(event.target.checked){
      let brandData;
      brandsQuery.data.forEach( item =>{
        if(item.name === brand){
          brandData = item.name;
        }
      })
      let state = formData;
      state.brandsAssigned.push(brandData);
      setFormData(prevState =>({
        ...prevState,
        ...state
      }))
    }else{
      let state = formData;
      state.brandsAssigned = state.brandsAssigned.filter( function(item){ return item !== brand })
      setFormData(prevState =>({
        ...prevState,
        ...state
      }))
    }
  }

  const isChecked = (prop) =>{
    let checked = false;
    formData.brandsAssigned.forEach( item =>{
      if(item === prop){
        checked = true
      }
    })
    return checked;
  }

  const listBrands = () =>{
    return brandsQuery.data.map(brand =>
      <div className="form-check ms-3" key={brand.id}>
        <input className="form-check-input" type="checkbox" checked={isChecked(brand.name)} onChange={handleCheck(brand.name)} value={brand.name} id={brand.id} />
        <label className="form-check-label fw-bold" htmlFor={brand.id}>
          {brand.name}
        </label>
      </div>
    )
  }


  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/employee", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allEmployees"])
        router.push("/employees")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
    let errors = formValidator(["companyId", "branchId", "staffCadre", "firstName", "lastName", "email"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Employee</h4>
        <span className="breadcrumb-item ms-3"><a href="/employees"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Employee</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="company" className="form-label">Company (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="company" onChange={handleChange("companyId")} value={formData.companyId} aria-label="Default select example">
                    <option value="">Select Company</option>
                    {!companyQuery.isLoading && listCompanyOptions()}
                  </select>
                  <span className='text-danger font-monospace small'>{errors.companyId}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="branch" className="form-label">Branch (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="branch" onChange={handleChange("branchId")} value={formData.branchId} aria-label="Default select example">
                    <option value="">Select Branch</option>
                    {!branchQuery.isLoading && listBranchOptions()}
                  </select>
                  <span className='text-danger font-monospace small'>{errors.branchId}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="staffCadre" className="form-label">Staff Cadre (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="staffCadre" onChange={handleChange("staffCadre")} value={formData.staffCadre[0]} aria-label="Default select example">
                    <option value="">Select Staff Cadre</option>
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="salesPerson">Sales Representative</option>
                  </select>
                  <span className='text-danger font-monospace small'>{errors.staffCadre}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="firstname" className="form-label">First Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" id="firstname" onChange={handleChange("firstName")} value={formData.firstName} placeholder="Employee First Name" />
                  <span className='text-danger font-monospace small'>{errors.firstName}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="middlename" className="form-label">Middle Name</label>
                  <input type="text" className="form-control shadow-none" id="middlename" onChange={handleChange("middleName")} value={formData.middleName} placeholder="Employee Middle Name" />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastname" className="form-label">Last Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" id="lastname" onChange={handleChange("lastName")} value={formData.lastName} placeholder="Employee Last Name" />
                  <span className='text-danger font-monospace small'>{errors.lastName}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="email" className="form-control shadow-none" id="email" onChange={handleChange("email")} value={formData.email} placeholder="Enter your email address" />
                  <span className='text-danger font-monospace small'>{errors.email}</span>
                </div>

                <PasswordInput defaultValue={formData.password} disabled={true} />

                {formData.staffCadre[0] === "salesPerson" &&
                  <div className="mb-3">
                    <label htmlFor="supervisorId" className="form-label">Supervisor</label>
                    <select className="form-select shadow-none" id="supervisorId" value={formData.supervisorId} onChange={handleChange("supervisorId")} aria-label="Default select example">
                      <option value="">Select Supervisor</option>
                      {!employeeQuery.isLoading && listSupervisors()}
                    </select>
                  </div>
                }
                
                <div className="mb-3">
                  <label htmlFor="employmentDate" className="form-label">Employment Date</label>
                  <input type="date" className="form-control shadow-none" id="employmentDate" onChange={handleChange("employmentDate")} value={formData.employmentDate} placeholder="Enter Employee Employment Date" />
                </div>

                <div className="mb-3">
                  <label htmlFor="brands" className="form-label">Brands Assigned </label>
                  {!brandsQuery.isLoading && !brandsQuery.isError &&
                    <div className='d-flex'> {listBrands()} </div>}
                </div>
                <div className="d-flex mt-5">
                  <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddEmployee