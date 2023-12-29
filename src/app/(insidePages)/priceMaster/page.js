"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter } from "next/navigation";
import clipLongText from "@/services/clipLongText";
import formatAsCurrency from "@/services/formatAsCurrency";
import { getDecodedToken } from "@/services/localStorageService";
import { useSelector } from "react-redux";
import moment from "moment";
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
      </tr>
    </>
    
  );
}


const PriceMaster = () =>{  
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  // const tokenData = getDecodedToken();
  const {userData} = useGetUserData();



  const {data, isFetching} = useQuery({
    queryKey: ["allProductPrices" ],
    queryFn:  ()=>apiGet({ url: "/priceMaster"})
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

  const deriveProductStatus = (unitPrice, promoPrice, validTill, anyPromo)=>{
    let validTillString = new Date(validTill).getTime();
    let currentDateString = new Date().getTime();
    let result = {};
    if(!anyPromo){
      result.price = unitPrice
      result.promoActive = false;
    }else if(currentDateString >= validTillString){
      result.price = unitPrice
      result.promoActive = false;
    }else if(currentDateString < validTillString){
      result.price = promoPrice
      result.promoActive = true;
    }

    return result
  }

  const listProductPrices = () =>{
    return data.map( (item, index) => {
      const {id, product, brand, unitPrice, promoPrice, anyPromo, promoText, validFrom, validTill, vatInclusive, vatRate} = item;
      return( 
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0 link-style" onClick={()=>{
            router.push(`/priceMaster/${id}`)
          }}>
            <h6 className="fw-semibold mb-1 text-primary">{product.name}</h6>
            <p className="mb-0 fw-normal">{brand.name}</p>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold m-0">{formatAsCurrency(deriveProductStatus(unitPrice, promoPrice, validTill, anyPromo).price)}</h6>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold m-0">{vatInclusive ? `Yes - ${vatRate}` : "No"}</h6>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1">{deriveProductStatus(unitPrice, promoPrice, validTill, anyPromo).promoActive ? "Yes" : "No"}</h6>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0">{(validFrom && deriveProductStatus(unitPrice, promoPrice, validTill, anyPromo).promoActive) ? `${moment(new Date(validFrom)).format('lll')}` : "---"}</p>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0">{(validTill && deriveProductStatus(unitPrice, promoPrice, validTill, anyPromo).promoActive) ? `${moment(new Date(validTill)).format('lll')}` : "---"}</p>
          </td>
          <td className="border-bottom-0">
            <p className="small mb-0">{product?.isActive ? "Yes" : "No"}</p>
          </td>
          <td className="border-bottom-0">
            <p className="fw-semibold mb-1" >{promoText ? clipLongText(promoText) : "---"}</p>
          </td>
          {userData?.staffCadre?.includes("admin") &&
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/priceMaster/${id}/edit`}>Edit</a>
          </td>}
        </tr>
    )
    })
  }

  const allPriceMasterQuery = useQuery({
    queryKey: ["allPriceMaster-excel" ],
    queryFn:  ()=>apiGet({ url: `/priceMaster`})
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
    XLSX.writeFile(workbook, "PriceMaster-DataSheet.xlsx");
  };


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Price Master</h4>
        <a className="btn btn-link text-primary ms-auto" href="/priceMaster/add">Add</a>
        {userData?.staffCadre?.includes("admin") &&
          <button type="button" className="btn btn-secondary px-5 py-2 ms-3" disabled={allPriceMasterQuery?.isFetching} onClick={() => allPriceMasterQuery.refetch()}>
            {allPriceMasterQuery?.isFetching ? "Fetching..." : "Download As Excel"}
          </button>}
      </header>

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-semibold mb-4 opacity-75">All Product Prices</h5>
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <thead className="text-dark fs-4">
                      <tr>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">#</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Product</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Unit Price</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Vat Inclusive?</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Any Promo?</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Valid From</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Valid Till</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">is Active?</h6>
                        </th>
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Promo Text</h6>
                        </th>
                        {userData?.staffCadre?.includes("admin") &&
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Actions</h6>
                        </th>}
                      </tr>
                    </thead>
                    <tbody>
                        {data ? listProductPrices() : <LoadingFallBack />}                 
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default PriceMaster