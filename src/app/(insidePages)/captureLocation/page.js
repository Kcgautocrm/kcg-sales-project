"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";
import useGetUserData from "@/hooks/useGetUserData";
import formValidator from "@/services/validation";
import AppAutoComplete from "@/components/autoComplete";
import moment from "moment";




const CaptureLocation = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const { userData } = useGetUserData();
  const [formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    longitude: "",
    lattitude: "",
    description: "",
    timeStamp: "",
    extraData: {}
  })

  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");

  const handleChangeSearch = (event) =>{
    setCustomerSearch(event.target.value);
  }

 
  const listOptions = () => {
    let eligibleOptions = customerOptions.filter(item => item.companyName.toLowerCase().includes(customerSearch.toLowerCase()));

    return eligibleOptions.map((item, index) => {
      const { id, companyName, state } = item;
      return (
        <tr key={id} className="hover" >
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0 fw-bold text-black">
            {companyName}
          </td>
          <td className="border-bottom-0">
            {state}
          </td>
          <td className="border-bottom-0">
            <button className="btn btn-sm btn-success ms-auto" onClick={()=>setFormData( prevState => ({
              ...prevState,
              customerId: id
            }))}>Select</button>
          </td>
        </tr>
      )
    })
  }

  const [errors, setErrors] = useState({})

  


  const customerQuery = useQuery({
    queryKey: ["allCustomers"],
    queryFn: () => apiGet({ url: `/customer?employeeId=${userData?.id}` })
      .then(res => {
        generateCustomerOptions(res.data)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      enabled: false
  })

  const getCustomerName = ()=>{
    let result = "";
    if(formData?.customerId){
      customerQuery.data.forEach( item =>{
        if(item?.id === formData?.customerId){
          result = item?.companyName
        }
      })
    }
    return result;
  }

  const getLocationDescription = ()=>{
    let result = "";

  }

  useEffect(()=>{
    if(userData?.id){
      customerQuery.refetch();
      setFormData( prevState =>({
        ...prevState, 
        employeeId: userData?.id
      }))
      getCurrentLocation()
    }
  }, [userData?.id])


  const generateCustomerOptions = (data = []) =>{
    let options = []
    if(data.length > 0){
      console.log(data)
      data.forEach( customer =>{

        options.push({id: customer.id, companyName: customer.companyName, state: customer.state})
      })
    } 
    console.log(options)
    setCustomerOptions(options)
  }

  const getPfiRequestData = () => {
    let id = formData.pfiRequestFormId
    let data = {}
    if (!pfiRequestQuery.isLoading) {
      pfiRequestQuery.data.forEach(pfiRequest => {
        if (pfiRequest.id === id) {
          data = pfiRequest
        }
      })
    }
    return data
  }

  const getCurrentLocation = () =>{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          console.log(position)
          setFormData( prevState =>({
            ...prevState,
            longitude: longitude.toString(), lattitude: latitude.toString(),
            timeStamp: position?.timestamp.toString()
          }))
          // Pass these coordinates to Google Maps API
        },
        (error) => {
          console.error('Error fetching location:', error.message);
          dispatchMessage({severity: "error", message: `Error fetching location: ${error.message}`})
        }
      );
    } else {
      dispatchMessage({severity: "error", message: 'Geolocation is not supported by this browser.'});
    }
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/verifiedLocation", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allVerifiedLocations"])
        router.push("/verifiedLocations")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    //return console.log(formData);
    let errors = formValidator([ "employeeId", "longitude", "lattitude", "timeStamp", ], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are missing" })
      return setErrors(errors);
    }
    mutate()
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Capture Location</h4>
        <span className="breadcrumb-item ms-3"><a href="/companies"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Capture Current Location</h5>
              <form>

                {!formData?.customerId &&
                <section className="my-3">
                  <div className="mb-3">
                    <label className="form-label">Search Customers ({customerOptions.length})</label>
                    <input type="text" value={customerSearch} onChange={handleChangeSearch} className="form-control shadow-none fw-bold" />
                  </div>

          

                  <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <thead className="text-dark fs-4">
                      <tr>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">#</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Company Name</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">State</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Actions</h6>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOptions.length > 0 && listOptions()}              
                    </tbody>
                  </table>
                </div>
                </section>}



                {formData?.customerId &&
                  <section className="border p-4 mt-5">
                    <div className="mb-3">
                      <label className="form-label">Customer Name</label>
                      <input type="text" readOnly className="form-control shadow-none fw-bold" defaultValue={getCustomerName()} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Current Location</label>
                      <textarea readOnly className="form-control shadow-none" value={`Longitude: ${formData?.longitude}, Lattitude: ${formData?.lattitude}`}></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Time of Capture</label>
                      <input type="text" readOnly className="form-control shadow-none fw-bold" 
                      value={moment(parseFloat(formData?.timeStamp)).format('LLLL')} />
                    </div>
                    
                    <div className="d-flex">
                      <button type="submit" className="btn btn-success mt-3 px-5 py-2 ms-auto" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Capture Coordinates"}</button>
                    </div>
                    
                  </section>
                }
                

                
              </form>


            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaptureLocation