"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
//import formValidator from '../../../services/validation';
import { useRouter } from "next/navigation";
import formValidator from "@/services/validation";
import formatAsCurrency from "@/services/formatAsCurrency";

const AddProductPrice = () =>{
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const [formData, setFormData] = useState({
    brandId: "",
    productId: "",
    unitPrice: "",
    promoPrice: "",
    anyPromo: false,
    promoText: "",
    validFrom: "",
    validTill: "",
    vatInclusive: false,
    vatRate: ""
  })
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    if(!formData.anyPromo){
      setFormData(prevState =>({
        ...prevState,
        promoPrice: "",
        promoText: "",
        validFrom: "",
        validTill: ""
      }))
    }
  }, [formData.anyPromo])

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

  const productsQuery = useQuery({
    queryKey: ["allProducts" ],
    queryFn:  ()=> apiGet({ url: "/product?isActive=true"})
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

  const listBrandOptions = () =>{
    if(brandsQuery?.data?.length){
      return brandsQuery.data.map(brand =>
        <option key={brand.id} value={brand.id}>{brand.name}</option>
      )
    }
  }

  const listProductOptions = () =>{
    let products = productsQuery.data;
    if(formData.brandId){
      products = products.filter( product => product.brandId === formData.brandId)
    }
    if(products.length){
      return products.map(product =>
        <option key={product.id} value={product.id}>{product.name}</option>
      )
    }
  }

  const handleChange = (prop) => (event) => {
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    if((prop === "unitPrice" || prop === "promoPrice") && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }


  const queryClient = useQueryClient();
  const {isLoading, mutate} = useMutation({
    mutationFn: ()=>apiPost({ url: "/priceMaster", data: formData})
    .then( res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      queryClient.invalidateQueries(["allProductPrices"])
      router.push(`/priceMaster`)
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData)
    let errors = formValidator(["brandId", "productId", "unitPrice"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Price Master</h4>
        <span className="breadcrumb-item ms-3"><a href="/priceMaster"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>
      

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4" style={{maxWidth: "700px"}}>
                <h5 className="card-title fw-semibold mb-4 opacity-75">Add Product Price</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="brandId" className="form-label">Brand (<span className='fst-italic text-warning'>required</span>)</label>
                    <select className="form-select" id="brandId" onChange={handleChange("brandId")} value={formData.brandId} aria-label="Default select example">
                      <option value="">Select Brand</option>
                      {!brandsQuery.isLoading && listBrandOptions()}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.brandId}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productId" className="form-label">Product (<span className='fst-italic text-warning'>required</span>)</label>
                    <select className="form-select" id="productId" onChange={handleChange("productId")} value={formData.productId} aria-label="Default select example">
                      <option value="">Select Product</option>
                      {!productsQuery.isLoading && listProductOptions()}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.productId}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unitPrice" className="form-label">Unit Price (<span className='fst-italic text-warning'>required</span>) 
                    <span className='ms-3 fw-bold'>{formatAsCurrency(formData.unitPrice)}</span></label>
                    <input type="text" className="form-control" id="unitPrice" value={formData.unitPrice} onChange={handleChange("unitPrice")}  />
                    <span className='text-danger font-monospace small'>{errors.unitPrice}</span>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" checked={formData.vatInclusive} onChange={(e) => setFormData(prevState => ({
                      ...prevState,
                      vatInclusive: !prevState.vatInclusive
                    }))} id="vatInclusive" />
                    <label className="form-check-label" htmlFor="vatInclusive">Vat Inclusive?</label>
                  </div>

                  {formData.vatInclusive &&
                  <div className="mb-3">
                    <label htmlFor="vatRate" className="form-label">VAT Rate</label>
                    <input type="text" className="form-control shadow-none" value={formData.vatRate} onChange={handleChange("vatRate")} id="vatRate" placeholder="VAT Rate" />
                  </div>} 

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" checked={formData.anyPromo} onChange={(e) => setFormData(prevState => ({
                      ...prevState,
                      anyPromo: !prevState.anyPromo
                    }))} id="anyPromo" />
                    <label className="form-check-label" htmlFor="anyPromo">Any Promo?</label>
                  </div>

                {formData.anyPromo &&
                  <>
                    <div className="mb-3">
                      <label htmlFor="promoPrice" className="form-label">Promo Price <span className='ms-3 fw-bold'>{formatAsCurrency(formData.promoPrice)}</span></label>
                      <input type="text" className="form-control" id="promoPrice" value={formData.promoPrice} onChange={handleChange("promoPrice")} />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="promoText" className="form-label">Promo Text</label>
                      <textarea className="form-control" id="promoText" value={formData.promoText} onChange={handleChange("promoText")}></textarea>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="validFrom" className="form-label">Valid From</label>
                      <input type="datetime-local" className="form-control" id="validFrom" value={formData.validFrom} onChange={handleChange("validFrom")} />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="validTill" className="form-label">Valid Till</label>
                      <input type="datetime-local" className="form-control" id="validTill" value={formData.validTill} onChange={handleChange("validTill")} />
                    </div>
                  </>}

                  <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AddProductPrice