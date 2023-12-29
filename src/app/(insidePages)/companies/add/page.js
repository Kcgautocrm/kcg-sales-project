"use client"

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
import { useRouter } from "next/navigation";
import formValidator from "@/services/validation";

const AddCompany = () =>{
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    address: "",
    logo: "",
    brands: []
  })
  const [errors, setErrors] = useState({});

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
    let brands = formData.brands
    let brandExists = brands.includes(brand);
    if(brandExists){
      brands = brands.filter( item => item !== brand)
      setFormData( prevState => ({
        ...prevState,
        brands 
      }))
    }else{
      brands.push(brand);
      setFormData( prevState => ({
        ...prevState,
        brands 
      }))
    }
  }

  const isChecked = (prop) =>{
    let checked = false;
    formData.brands.forEach( item =>{
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
  const [imageUrl, setImageUrl] = useState("");
  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);

  const createImageUrl = () =>{
    const file = inputFileRef.current.files[0];
    if(file){
      setImageUrl(URL.createObjectURL(file));
    }else{
      setImageUrl("")
    }
  }


  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }


  const queryClient = useQueryClient();
  const {isLoading, mutate} = useMutation({
    mutationFn: (data)=>apiPost({ url: "/company", data})
    .then( res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      queryClient.invalidateQueries(["allCompanies"])
      router.push(`/companies`)
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    }),
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = formValidator(["name"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    if (!inputFileRef.current?.files.length) {
      return dispatchMessage({ severity: "error", message: "No Image Selected" });
    }
    
    console.log(inputFileRef.current?.files)
    const file = inputFileRef.current.files[0];
    setIsSendingImage(true)
    const image = await postImage(file.name, file)
    setIsSendingImage(false)
    let data = {...formData};
    data.logo = image;
    console.log(data)
    mutate(data);
  }

  const postImage = async (filename, file) =>{
    const response = await fetch(
      `/api/v1/uploadImages?filename=${filename}`,
      {
        method: 'POST',
        body: file,
      },
    );
    const newBlob = await response.json();
    console.log(newBlob.url);
    return newBlob.url
  }
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Company</h4>
        <span className="breadcrumb-item ms-3"><a href="/companies"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>
      

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4" style={{maxWidth: "700px"}}>
                <h5 className="card-title fw-semibold mb-4 opacity-75">Add Company</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Company Name(<span className='fst-italic text-warning'>required</span>)</label>
                    <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")}/>
                    <span className="text-danger font-monospace small">{errors?.name}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Company Code</label>
                    <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")}  />
                    <span className="text-danger font-monospace small">{errors?.code}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control"  id="email" value={formData.email} onChange={handleChange("email")}  />
                    <span className="text-danger font-monospace small">{errors?.email}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea className="form-control" id="address" rows={4} value={formData.address} onChange={handleChange("address")}></textarea>
                    <span className="text-danger font-monospace small">{errors?.address}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="companyLogo" className="form-label">Company Logo <span className='fst-italic text-warning ms-4'>required (less than 4mb)</span></label>
                    <input className="form-control" id="companyLogo" accept="image/*" onChange={createImageUrl} ref={inputFileRef} type="file"/>
                    <span className="text-danger font-monospace small">{errors?.logo}</span>
                    {/* <span className='text-danger font-monospace small'>{errors.logo}</span> */}
                    {imageUrl &&
                      <div>
                        <h6 className='small fw-bold mt-3'>Logo Preview</h6>
                        <img src={imageUrl} alt="Logo Preview" className='border rounded' width="100px" />
                      </div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="brands" className="form-label">Brands</label>
                    {!brandsQuery.isLoading && !brandsQuery.isError &&
                      <div className='d-flex'> {listBrands()} </div>}
                      {/* <span className='text-danger font-monospace small'>{errors.brands}</span> */}
                  </div>

                  <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={(isSendingImage || isLoading)} onClick={handleSubmit}>{(isSendingImage || isLoading) ? "Loading..." : "Submit"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AddCompany