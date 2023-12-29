"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDecodedToken } from "@/services/localStorageService";
import useGetUserData from "@/hooks/useGetUserData";
import ListOfSubordinates from "@/components/listOfSubordinates";
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
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
    
  );
}


const InvoiceRequests = () =>{  
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const employeeId = searchParams.get("employeeId");
  const [showFilters, setShowFilters] = useState(false);
  const { userData } = useGetUserData();
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    contactPersonId: "",
    brandId: "",
    productId: "",
    approved: ""
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
    setFormData(prevState => ({
      ...prevState,
      [props]: event.target.value
    }))
  }

  useEffect(() => {
    if(userData?.staffCadre?.includes("salesPerson")){
      setFormData(prevState => ({
        ...prevState,
        employeeId: userData.id
      }))
    }
  }, [])





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

  const customerQuery = useQuery({
    queryKey: ["allCustomers"],
    queryFn: () => apiGet({ url: `/customer?approved=approved` })
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

  const contactPersonQuery = useQuery({
    queryKey: ["allContactPersons"],
    queryFn: () => apiGet({ url: `/contactPerson?isActive=true` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
      staleTime: Infinity,
      retry: 3
  })

  const brandQuery = useQuery({
    queryKey: ["allBrands"],
    queryFn: () => apiGet({ url: `/brand?isActive=true` })
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

  const productQuery = useQuery({
    queryKey: ["allProducts"],
    queryFn: () => apiGet({ url: `/product?isActive=true` })
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

  const listCustomerOptions = () => {
    let customers = customerQuery?.data;
    if (formData.employeeId) {
      customers = customers.filter(item => item.employeeId === formData.employeeId)
    }
    if (customers?.length) {
      return customers.map(customer =>
        <option key={customer.id} value={customer.id}>{customer.companyName}</option>
      )
    }
  }

  const listContactPersonOptions = () => {
    let contactPersons = contactPersonQuery?.data;
    if (formData.customerId) {
      contactPersons = contactPersons.filter(item => item.customerId === formData.customerId)
    }
    if (contactPersons?.length) {
      return contactPersons.map(contactPerson =>
        <option key={contactPerson.id} value={contactPerson.id}>{contactPerson.name}</option>
      )
    }
  }

  const listBrandOptions = () => {
    if (brandQuery?.data?.length) {
      return brandQuery.data.map(brand =>
        <option key={brand.id} value={brand.id}>{brand.name}</option>
      )
    }
  }

  const listProductOptions = () => {
    let products = productQuery?.data;
    if (formData.brandId) {
      products = products.filter(item => item.brandId === formData.brandId)
    }
    if (products?.length) {
      return products.map(product =>
        <option key={product.id} value={product.id}>{product.name}</option>
      )
    }
  }

  const [isLoading, setIsLoading] = useState(false);
  const [allInvoiceRequests, setAllInvoiceRequests] = useState([]);

  const fetchInvoiceRequests = (queryString) =>{
    setIsLoading(true)
    apiGet({ url: `/invoiceRequestForm?${queryString}&page=${page}&take=${20}` })
    .then(res => {
      console.log(res)
      setListMetaData(prevState => ({
        ...prevState,
        totalCount: res.totalCount,
        currentPage: res.page,
        take: res.take
      }))
      setAllInvoiceRequests(res.data)
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
        setFormData(data)
      }
      let queryString = generateQueryString(data)
      console.log(data, queryString);
      fetchInvoiceRequests(queryString);
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
      fetchInvoiceRequests(queryString);
    }
  }

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

  const listInvoiceRequests = () =>{
    return allInvoiceRequests.map( (item, index) => {
      const {id, employee, invoiceName, product, brand, quantity, approved, invoiceNumber, invoiceDate, delivery, payment} = item;
      return( 
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          {userData?.staffCadre?.includes("admin") &&
          <td className="border-bottom-0 link-style" onClick={()=>router.push(`/invoiceRequests/${id}`)}>
            <h6 className="fw-semibold mb-1 text-primary">{employee.firstName} {employee.lastName}</h6>
            <span className="fw-normal">{employee.email}</span>
          </td>}
          <td className="border-bottom-0 link-style" onClick={()=>router.push(`/invoiceRequests/${id}`)}>
            <p className="mb-0 fw-normal">{invoiceName}</p>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1">{brand.name}</h6>
            <span className="fw-normal">{product.name}</span>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{quantity}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{approved ? "Approved" : "Pending"}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{invoiceNumber}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{invoiceDate}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{delivery}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{payment}</p>
          </td>
          {userData?.id === item?.employeeId && (!item?.approved) &&
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/invoiceRequests/${id}/edit`}>Edit</a>
          </td>}
        </tr>
    )
    })
  }



  const allInvoiceRequestsQuery = useQuery({
    queryKey: ["allInvoiceRequests-excel" ],
    queryFn:  ()=>apiGet({ url: `/invoiceRequestForm`})
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
    XLSX.writeFile(workbook, "InvoiceRequest-DataSheet.xlsx");
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
    {(userData?.accountType === "Supervisor" && !employeeId) && <ListOfSubordinates title="Invoice Requests" pathname={pathname} />}

    {canShowTable() &&
        <div className="container-fluid">
          <header className="d-flex align-items-center mb-4">
            <h4 className="m-0">Invoice Requests</h4>
            <button className="btn btn-link text-primary ms-auto border border-primary" onClick={() => setShowFilters(prevState => !prevState)}><i className="fa-solid fa-arrow-down-short-wide"></i></button>
            {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor")&& <a className="btn btn-link text-primary ms-3" href="/invoiceRequests/add">Add</a>}
          </header>

          {showFilters &&
            <div className="container-fluid card p-3">
              <form className="row">
                <h6 className="col-12 mb-3 text-muted">Filter Pfi Request List</h6>
                {userData?.staffCadre?.includes("admin") &&
                  <div className="mb-3 col-6">
                    <label htmlFor="employeeId" className="form-label">Employee</label>
                    <select className="form-select shadow-none" value={formData.employeeId} onChange={handleChange("employeeId")} id="employeeId" aria-label="Default select example">
                      <option value="">Select Employee</option>
                      {listEmployeeOptions()}
                    </select>
                  </div>
                }

                <div className="mb-3 col-6">
                  <label htmlFor="customerId" className="form-label">Customer</label>
                  <select className="form-select shadow-none" value={formData.customerId} onChange={handleChange("customerId")} id="customerId" aria-label="Default select example">
                    <option value="">Select Customer</option>
                    {listCustomerOptions()}
                  </select>
                </div>

                <div className="mb-3 col-6">
                  <label htmlFor="contactPersonId" className="form-label">Contact Person</label>
                  <select className="form-select shadow-none" value={formData.contactPersonId} onChange={handleChange("contactPersonId")} id="contactPersonId" aria-label="Default select example">
                    <option value="">Select Contact Person</option>
                    {listContactPersonOptions()}
                  </select>
                </div>

                <div className="mb-3 col-6">
                  <label htmlFor="brandId" className="form-label">Brand</label>
                  <select className="form-select shadow-none" value={formData.brandId} onChange={handleChange("brandId")} id="brandId" aria-label="Default select example">
                    <option value="">Select Brand</option>
                    {listBrandOptions()}
                  </select>
                </div>

                <div className="mb-3 col-6">
                  <label htmlFor="productId" className="form-label">Product</label>
                  <select className="form-select shadow-none" value={formData.productId} onChange={handleChange("productId")} id="productId" aria-label="Default select example">
                    <option value="">Select Product</option>
                    {listProductOptions()}
                  </select>
                </div>

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
                    <button type="button" className="btn btn-secondary px-5 py-2 ms-auto mt-3 mt-md-0" disabled={allInvoiceRequestsQuery?.isFetching} onClick={() => allInvoiceRequestsQuery.refetch()}>
                      {allInvoiceRequestsQuery?.isFetching ? "Fetching..." : "Download As Excel"}
                    </button>}
                </div>
              </form>
            </div>
          }

          <div className="row">
            <div className="col-12 d-flex align-items-stretch">
              <div className="card w-100">
                <div className="card-body p-4">
                  <h5 className="card-title fw-semibold mb-4 opacity-75">All Invoice Requests</h5>
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
                              <h6 className="fw-semibold mb-0">Sales Rep</h6>
                            </th>}
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Invoice Name</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Model</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Qty</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Status</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Inv Number</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Inv Date</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Delivery</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Payment</h6>
                          </th>
                          {userData?.staffCadre?.includes("salesPerson") &&
                            <th className="border-bottom-0">
                              <h6 className="fw-semibold mb-0">Actions</h6>
                            </th>}
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? <LoadingFallBack /> : listInvoiceRequests()}
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

export default InvoiceRequests