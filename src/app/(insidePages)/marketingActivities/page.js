"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import clipLongText from "@/services/clipLongText";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { getDecodedToken } from "@/services/localStorageService";
import useGetUserData from "@/hooks/useGetUserData";
import ListOfSubordinates from "@/components/listOfSubordinates";
import formatAsCurrency from "@/services/formatAsCurrency";
import * as XLSX from 'xlsx';


const LoadingFallBack = () => {
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


const MarketingActivity = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [showFilters, setShowFilters] = useState(false);
  const { userData } = useGetUserData();
  // const tokenData = getDecodedToken();
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    employeeId: "",
    approved: "",
  })

  const [listMetaData, setListMetaData] = useState({
    currentPage: 1,
    totalCount: 0,
    take: 0
  })


  const setNextPage = () => {
    let { currentPage, take, totalCount } = listMetaData;
    if ((currentPage * take) < totalCount) {
      setPage(prevState => prevState + 1)
    }
  }

  const setPrevPage = () => {
    let { currentPage } = listMetaData;
    if (currentPage > 1) {
      setPage(prevState => prevState - 1)
    }
  }


  const handleChange = (props) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [props]: event.target.value
    }))
  }

  useEffect(() => {
    if (userData?.staffCadre?.includes("salesPerson")) {
      setFormData(prevState => ({
        ...prevState,
        employeeId: userData.id
      }))
    }
  }, [])

  const generateQueryString = (data) => {
    let queryString = ""
    let dataKeys = Object.keys(data);
    dataKeys.forEach(key => {
      if (data[key]) {
        if (queryString === "") {
          queryString += `${key}=${data[key]}`
        } else {
          queryString += `&${key}=${data[key]}`
        }
      }
    })
    return queryString
  }

  const employeeQuery = useQuery({
    queryKey: ["allEmployees"],
    queryFn: () => apiGet({ url: `/employee?isActive=true` })
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

  const listEmployeeOptions = () => {
    if (employeeQuery?.data?.length) {
      return employeeQuery.data.map(employee =>
        <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>
      )
    }
  }

  const [isLoading, setIsLoading] = useState(false);
  const [allMarketingActivities, setAllMarketingActivities] = useState([]);

  const fetchAllMarketingActivities = (queryString) =>{
    setIsLoading(true)
    apiGet({ url: `/marketingActivity?${queryString}&page=${page}&take=${20}` })
    .then(res => {
      console.log(res)
      setListMetaData(prevState => ({
        ...prevState,
        totalCount: res.totalCount,
        currentPage: res.page,
        take: res.take
      }))
      setAllMarketingActivities(res.data)
      setIsLoading(false)
    })
    .catch(error => {
      console.log(error)
      dispatchMessage({ severity: "error", message: error.message })
      setIsLoading(false)
    })
  }

  useEffect(()=>{
    if(userData?.id){
      let data = {...formData};
      if(userData?.staffCadre?.includes("salesPerson")){
        data.employeeId = employeeId || userData?.id
        setFormData(data);
      }
      let queryString = generateQueryString(data)
      fetchAllMarketingActivities(queryString);
    }
  }, [userData, page])

  const handleSubmit = (e) => {
    e.preventDefault()
    if(userData?.id){
      let data = {...formData};
      if(userData?.staffCadre?.includes("salesPerson")){
        data.employeeId = employeeId || userData?.id
      }
      let queryString = generateQueryString(data)
      fetchAllMarketingActivities(queryString);
    }
  }

  const listMarketingActivities = () => {
    return allMarketingActivities.map((item, index) => {
      const { id, employee, activityName, activityDate, location, costIncurred } = item;
      return (
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          {userData?.staffCadre?.includes("admin") && 
          <td className="border-bottom-0 link-style" onClick={() => {
            router.push(`/marketingActivities/${id}`)
          }}>
            <h6 className="fw-semibold mb-1 text-primary">{`${employee.firstName} ${employee.lastName}`}</h6>
          </td>}
          <td className="border-bottom-0 link-style" onClick={() => {
            router.push(`/marketingActivities/${id}`)
          }}>
            <h6 className="fw-semibold mb-1 text-primary">{activityName}</h6>
          </td>
          <td className="border-bottom-0">
            <p className="fw-semibold m-0">{new Date(activityDate).toDateString()}</p>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0 d-flex flex-wrap" style={{ maxWidth: "200px" }}>{clipLongText(location)}</p>
          </td>
          <td className="border-bottom-0">
            <p className="fw-semibold m-0">{formatAsCurrency(costIncurred)}</p>
          </td>
          {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor") && 
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/marketingActivities/${id}/edit`}>Edit</a>
          </td>}
        </tr>
      )
    })
  }

  const allMarketingActivitiesQuery = useQuery({
    queryKey: ["allMarketingActivities-excel" ],
    queryFn:  ()=>apiGet({ url: `/marketingActivity`})
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
    XLSX.writeFile(workbook, "MarketingActivities-DataSheet.xlsx");
  };


  const canShowTable = () => {
    let result = false;
    if(userData?.staffCadre?.includes("admin")){
      result = true
    }else if(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor"){
      result = true
    }else if (userData?.accountType === "Supervisor" && employeeId) {
      result = true
    }
    return result
  }

  return (
    <>
      {(userData?.accountType === "Supervisor" && !employeeId) && <ListOfSubordinates title="Marketing Activities" pathname={pathname} />}
      {canShowTable() &&
        <div className="container-fluid">
          <header className="d-flex align-items-center mb-4">
            <h4 className="m-0">Marketing Activity</h4>
            <button className="btn btn-link text-primary ms-auto border border-primary" onClick={() => setShowFilters(prevState => !prevState)}><i className="fa-solid fa-arrow-down-short-wide"></i></button>
            {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor" ) && 
              <a className="btn btn-link text-primary ms-3" href="/marketingActivities/add">Add</a>
            }
          </header>

          {showFilters &&
            <div className="container-fluid card p-3">
              <form className="row">
                <h6 className="col-12 mb-3 text-muted">Filter Marketing Activities List</h6>
                {(userData?.staffCadre?.includes("admin")) &&
                  <div className="mb-3 col-lg-6">
                    <label htmlFor="employeeId" className="form-label">Employee</label>
                    <select className="form-select shadow-none" value={formData.employeeId} onChange={handleChange("employeeId")} id="employeeId" aria-label="Default select example">
                      <option value="">Select Employee</option>
                      {listEmployeeOptions()}
                    </select>
                  </div>
                }

                <div className="mb-3 col-lg-6">
                  <label htmlFor="approved" className="form-label">Approved</label>
                  <select className="form-select shadow-none" value={formData.approved} onChange={handleChange("approved")} id="approved" aria-label="Default select example">
                    <option value="">All</option>
                    <option value="approved"> Approved</option>
                    <option value="unApproved">Not Approved</option>
                  </select>
                </div>


                <div className="gap-2 d-md-flex col-12 align-items-center mt-5">
                  <button type="submit" className="btn btn-primary px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Filtering..." : "Filter"}</button>
                  <a className="btn btn-outline-primary px-5 py-2 ms-3" onClick={() => setShowFilters(false)}>Cancel</a>
                  {userData?.staffCadre?.includes("admin") &&
                    <button type="button" className="btn btn-secondary px-5 py-2 ms-auto mt-3 mt-md-0" disabled={allMarketingActivitiesQuery?.isFetching} onClick={() => allMarketingActivitiesQuery.refetch()}>
                      {allMarketingActivitiesQuery?.isFetching ? "Fetching..." : "Download As Excel"}
                    </button>}
                </div>
              </form>
            </div>
          }

          <div className="row">
            <div className="col-12 d-flex align-items-stretch">
              <div className="card w-100">
                <div className="card-body p-4">
                  <h5 className="card-title fw-semibold mb-4 opacity-75">All Marketing Activities</h5>
                  <div className="table-responsive">
                    <table className="table text-nowrap mb-0 align-middle">
                      <caption className='p-3'><span className="fw-bold">Current Page: </span>{listMetaData.currentPage}  <span className="fw-bold ms-2">Total Pages: </span>{Math.ceil(listMetaData.totalCount / listMetaData.take)} <span className="fw-bold ms-2"> Total Count: </span> {listMetaData.totalCount}</caption>
                      <thead className="text-dark fs-4">
                        <tr>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">#</h6>
                          </th>
                          {userData?.staffCadre?.includes("admin") &&
                            <th className="border-bottom-0">
                              <h6 className="fw-semibold mb-0">Employee</h6>
                            </th>}
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Activity Name</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Activity Date</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Location</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Cost Incurred</h6>
                          </th>
                          {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor") &&
                            <th className="border-bottom-0">
                              <h6 className="fw-semibold mb-0">Actions</h6>
                            </th>}
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? <LoadingFallBack /> :  listMarketingActivities()}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-3">
                    <button className="btn btn-outline-primary py-1 px-2" disabled={isLoading} type="button" onClick={setPrevPage}>
                      <i className="fa-solid fa-angle-left text-primary"></i>
                    </button>
                    <button className="btn btn-outline-primary py-1 px-2 ms-3" disabled={isLoading} type="button" onClick={setNextPage}>
                      <i className="fa-solid fa-angle-right text-primary"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
    
  )
}

export default MarketingActivity