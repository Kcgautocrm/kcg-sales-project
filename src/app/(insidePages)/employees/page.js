"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useGetUserData from "@/hooks/useGetUserData";
import * as XLSX from 'xlsx';


const LoadingFallBack = () =>{
  return (
    <>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
    
  );
}


const Employees = () =>{  
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const { userData } = useGetUserData();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    companyId: "",
    branchId: "",
    staffCadre: "",
    firstName: "",
    lastName: "",
    isActive: true
  })

  const [listMetaData, setListMetaData] = useState({
    currentPage: 1,
    totalCount: 0,
    take: 0
  })

  const setNextPage = () =>{
    let {currentPage, take, totalCount} = listMetaData;
    if((currentPage * take) < totalCount){
      setPage( prevState => prevState + 1)
    }
  }

  const setPrevPage = () =>{
    let {currentPage} = listMetaData;
    if(currentPage > 1){
      setPage( prevState => prevState - 1)
    }
  }

  const [queryUrlString, setQueryUrlString] = useState("")

  const handleChange = (props) => (event) => {
    if (props === "isActive") {
      setFormData(prevState => ({
        ...prevState,
        [props]: !prevState[props]
      }))
      return
    }

    setFormData(prevState => ({
      ...prevState,
      [props]: event.target.value
    }))
  }

  const generateQueryString = () =>{
    let queryString = ""
    let data = formData;
    let dataKeys = Object.keys(data);
    dataKeys.forEach( key => {
      if(data[key]){
        if(queryString === ""){
          queryString += `${key}=${data[key]}`
        }else{
          queryString += `&${key}=${data[key]}`
        }
      }
    })
    return queryString
  }

  useEffect(() => {
    if (formData?.staffCadre === "salesPerson") {
      setFormData(prevState => ({
        ...prevState,
        staffCadre: ["salesPerson"]
      }))
    } else if (formData?.staffCadre === "supervisor") {
      setFormData(prevState => ({
        ...prevState,
        staffCadre: ["supervisor", "salesPerson"]
      }))
    }else if (formData?.staffCadre === "admin") {
      setFormData(prevState => ({
        ...prevState,
        staffCadre: ["admin"]
      }))
    }
  }, [formData.staffCadre])

  const companyQuery = useQuery({
    queryKey: ["allCompanies"],
    queryFn: () => apiGet({ url: `/company?isActive=true` })
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
    queryFn: () => apiGet({ url: `/branch?isActive=true` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      })
  })

  const listCompanyOptions = () => {
    if (companyQuery?.data?.length) {
      return companyQuery.data.map(company =>
        <option key={company.id} value={company.id}>{company.name}</option>
      )
    }
  }

  const listBranchOptions = () => {
    let branches = branchQuery?.data;
    if (formData.companyId) {
      branches = branches.filter(item => item.companyId === formData.companyId)
    }
    if (branches.length) {
      return branches.map(branch =>
        <option key={branch.id} value={branch.id}>{branch.name}</option>
      )
    }
  }



  const {data, isFetching, refetch} = useQuery({
    queryKey: ["allEmployees" ],
    queryFn:  ()=>apiGet({ url: `/employee?${queryUrlString}&page=${page}&take=${20}`})
    .then(res => {
      console.log(res)
      setListMetaData( prevState => ({
        ...prevState,
        totalCount: res.totalCount,
        currentPage: res.page,
        take: res.take
      }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    let queryString = generateQueryString()
    setQueryUrlString(queryString)
    console.log(formData, queryString)
  }

  useEffect(()=>{
    refetch()
  }, [queryUrlString, page])

  const listEmployees = () =>{
    return data.map( (item, index) => {
      const {id, company, branch, firstName, lastName, email, staffCadre, isActive} = item;
      return( 
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0 link-style" onClick={()=>{
            router.push(`/employees/${id}`)
          }}>
            <h6 className="fw-semibold mb-1 text-primary">{firstName} {lastName}</h6>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1">{company.name}</h6>
            <span className="fw-normal">{branch.name} </span>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{staffCadre[0]}</p>
          </td>
          <td className="border-bottom-0">
            <div className="d-flex align-items-center gap-2">
              <p className="fw-semibold m-0">{email}</p>
            </div>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0">{isActive ? "Yes" : "No"}</p>
          </td>
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/employees/${id}/edit`}>Edit</a>
          </td>
        </tr>
    )
    })
  }

  const allEmployeesQuery = useQuery({
    queryKey: ["allEmployees-excel" ],
    queryFn:  ()=>apiGet({ url: `/employee`})
    .then(res => {
      console.log(res)
      downloadExcel(res.data)
      return res.data
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return []
    }),
    enabled: false
  })


  const downloadExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "Employee-DataSheet.xlsx");
  };

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Employee</h4>
        <button className="btn btn-link text-primary ms-auto border border-primary" onClick={() => setShowFilters(prevState => !prevState)}><i className="fa-solid fa-arrow-down-short-wide"></i></button>
        <a className="btn btn-link text-primary ms-3" href="/employees/add">Add</a>
      </header>

      {showFilters &&
        <div className="container-fluid card p-3">
          <form className="row">
            <h6 className="col-12 mb-3 text-muted">Filter Employee List</h6>

            <div className="mb-3 col-6">
              <label htmlFor="companyId" className="form-label">Company</label>
              <select className="form-select shadow-none" value={formData.companyId} onChange={handleChange("companyId")} id="companyId" aria-label="Default select example">
                <option value="">Select Company</option>
                {listCompanyOptions()}
              </select>
            </div>

            <div className="mb-3 col-6">
              <label htmlFor="branchId" className="form-label">Branch</label>
              <select className="form-select shadow-none" value={formData.branchId} onChange={handleChange("branchId")} id="branchId" aria-label="Default select example">
                <option value="">Select Branch</option>
                {listBranchOptions()}
              </select>
            </div>

            <div className="mb-3 col-6">
              <label htmlFor="staffCadre" className="form-label">Staff Cadre</label>
              <select className="form-select shadow-none" value={formData?.staffCadre[0] || formData?.staffCadre} onChange={handleChange("staffCadre")} id="staffCadre" aria-label="Default select example">
                <option value="">Select Staff Cadre</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="salesPerson">Sales Person</option>
              </select>
            </div>

            <div className="mb-3 col-lg-6">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" className="form-control shadow-none" id="firstName" value={formData.firstName} onChange={handleChange("firstName")}/>
            </div>

            <div className="mb-3 col-lg-6">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" className="form-control shadow-none" id="lastName" value={formData.lastName} onChange={handleChange("lastName")}/>
            </div>
            {(userData?.staffCadre?.includes("admin")) &&
              <div className="form-check m-3 col-lg-6">
                <input className="form-check-input shadow-none" type="checkbox" checked={formData.isActive} onChange={handleChange("isActive")} id="isActive" />
                <label className="form-check-label h6" htmlFor="isActive">
                  Only Active
                </label>
              </div>
            }

            <div className="gap-2 d-md-flex col-12 align-items-center mt-5">
              <button type="submit" className="btn btn-primary px-5 py-2" disabled={isFetching} onClick={handleSubmit}>{isFetching ? "Filtering..." : "Filter"}</button>
              <a className="btn btn-outline-primary px-5 py-2 ms-3" onClick={() => setShowFilters(false)}>Cancel</a>
              {userData?.staffCadre?.includes("admin") && 
              <button type="button" className="btn btn-secondary px-5 py-2 ms-auto mt-3 mt-md-0" disabled={allEmployeesQuery?.isFetching} onClick={()=>allEmployeesQuery.refetch()}>
                {allEmployeesQuery?.isFetching ? "Fetching..." : "Download As Excel"}
              </button>}
            </div>
          </form>
        </div>
      }

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-semibold mb-4 opacity-75">All Employees</h5>
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <caption className='p-3'><span className="fw-bold">Current Page: </span>{listMetaData.currentPage}  <span className="fw-bold ms-2">Total Pages: </span>{Math.ceil(listMetaData.totalCount / listMetaData.take)} <span className="fw-bold ms-2"> Total Count: </span> {listMetaData.totalCount}</caption>
                    <thead className="text-dark fs-4">
                      <tr>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">#</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Employee Name</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Company</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Staff Cadre</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Email</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">is Active?</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Actions</h6>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                        {data ? listEmployees() : <LoadingFallBack />}                 
                    </tbody>
                  </table>
                </div>
                <div className="px-3">
                  <button className="btn btn-outline-primary py-1 px-2" disabled={isFetching} type="button" onClick={setPrevPage}>
                    <i className="fa-solid fa-angle-left text-primary"></i>
                  </button>
                  <button className="btn btn-outline-primary py-1 px-2 ms-3" disabled={isFetching} type="button" onClick={setNextPage}>
                    <i className="fa-solid fa-angle-right text-primary"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Employees