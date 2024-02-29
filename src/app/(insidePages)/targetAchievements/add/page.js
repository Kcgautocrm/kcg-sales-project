"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
import { useRouter } from "next/navigation";
import formValidator from "@/services/validation";

const AddMonthlyTarget = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    target: "",
  })

  const [errors, setErrors] = useState({});

  const handleChange = (prop) => (event) => {
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    if((prop === "target") && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

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

  const listEmployees = () =>{
    return employeeQuery?.data.map(employee =>
      <option key={employee.id} value={employee.id}>{employee.firstName} {employee.middleName[0]} {employee.lastName}</option>
    )
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/monthlyTarget", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allMonthlyTargets"])
        //router.push("/targetAchievements")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    // return console.log(formData);
    let errors = formValidator(["month", "target", "employeeId"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Monthly Target</h4>
        <span className="breadcrumb-item ms-3"><a href="/targetAchievements"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Monthly Target</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="employeeId" className="form-label">Employee</label>
                  <select className="form-select shadow-none" id="employeeId" value={formData.employeeId} onChange={handleChange("employeeId")} aria-label="Default select example">
                    <option value="">Select Employee</option>
                    {!employeeQuery.isLoading && listEmployees()}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="month" className="form-label">Month (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="month" className="form-control" id="month" value={formData.month} onChange={handleChange("month")} />
                  <span className="text-danger font-monospace small">{errors?.month}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="target" className="form-label">Monthly Target (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" id="target" value={formData.target} onChange={handleChange("target")} />
                  <span className="text-danger font-monospace small">{errors?.target}</span>
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

export default AddMonthlyTarget