"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter } from "next/navigation";
import clipLongText from "@/services/clipLongText";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
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
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
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
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
    
  );
}


const Companies = () =>{  
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const { userData } = useGetUserData();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    isActive: true
  })

  const [listMetaData, setListMetaData] = useState({
    currentPage: 1,
    totalCount: 0,
    take: 0
  })

  const clearState = () =>{
    setFormData( prevState =>({
      ...prevState,
      code: "",
      name: "",
    }))
  }

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

  const {data, isFetching, refetch} = useQuery({
    queryKey: ["allCompanies" ],
    queryFn:  ()=>apiGet({ url: `/company?${queryUrlString}&page=${page}&take=${20}`})
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

  const listCompanies = () =>{
    return data.map( (item, index) => {
      const {id, name, code, address, logo, email, _count, isActive} = item;
      return( 
        <tr key={id} className="hover" >
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0">
            <img src={logo} height={40} alt="Company Logo" />
          </td>
          <td className="border-bottom-0 link-style" onClick={()=>{
            router.push(`/companies/${id}`)
          }}>
            <h6 className="fw-semibold mb-1 text-primary">{name}</h6>
            <span className="fw-normal">{_count.branches} Branch(es)</span>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{code}</p>
          </td>
          <td className="border-bottom-0">
            <div className="d-flex align-items-center gap-2">
              <p className="fw-semibold m-0">{email}</p>
            </div>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0 d-flex flex-wrap" style={{maxWidth: "200px"}}>{clipLongText(address)}</p>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0">{isActive ? "Yes" : "No"}</p>
          </td>
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/companies/${id}/edit`}>Edit</a>
          </td>
        </tr>
    )
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let queryString = generateQueryString()
    setQueryUrlString(queryString)
    //return console.log(formData, queryString)
  }

  const allCompaniesQuery = useQuery({
    queryKey: ["allCompanies-excel" ],
    queryFn:  ()=>apiGet({ url: `/company`})
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
    XLSX.writeFile(workbook, "Company-DataSheet.xlsx");
  };

  useEffect(()=>{
    console.log(queryUrlString, page)
    refetch()
  }, [queryUrlString, page])

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Company</h4>
        <button className="btn btn-link text-primary ms-auto border border-primary" onClick={() => setShowFilters(prevState => !prevState)}><i className="fa-solid fa-arrow-down-short-wide"></i></button>
        <a className="btn btn-link text-primary ms-3" href="/companies/add">Add</a>
      </header>

      {showFilters &&
        <div className="container-fluid card p-3">
          <form className="row">
            <h6 className="col-12 mb-3 text-muted">Filter Company List</h6>

            <div className="mb-3 col-lg-6">
              <label htmlFor="code" className="form-label">Company Code</label>
              <input type="text" className="form-control shadow-none" id="code" value={formData.code} onChange={handleChange("code")}/>
            </div>

            <div className="mb-3 col-lg-6">
              <label htmlFor="name" className="form-label">Company Name</label>
              <input type="text" className="form-control shadow-none" id="name" value={formData.name} onChange={handleChange("name")}/>
            </div>

            {(userData?.staffCadre?.includes("admin")) &&
              <div className="form-check m-3">
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
              <button type="button" className="btn btn-secondary px-5 py-2 ms-auto mt-3 mt-md-0" disabled={allCompaniesQuery?.isFetching} onClick={()=>allCompaniesQuery.refetch()}>
                {allCompaniesQuery?.isFetching ? "Fetching..." : "Download As Excel"}
              </button>}
            </div>
          </form>
        </div>
      }

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-semibold mb-4 opacity-75">All Companies</h5>
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <caption className='p-3'><span className="fw-bold">Current Page: </span>{listMetaData.currentPage}  <span className="fw-bold ms-2">Total Pages: </span>{Math.ceil(listMetaData.totalCount / listMetaData.take)} <span className="fw-bold ms-2"> Total Count: </span> {listMetaData.totalCount}</caption>
                    <thead className="text-dark fs-4">
                      <tr>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">#</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Logo</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Name</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Code</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Email</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Address</h6>
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
                        {data ? listCompanies() : <LoadingFallBack />}                 
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

export default Companies