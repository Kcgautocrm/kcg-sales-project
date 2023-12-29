"use client"

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
//import formValidator from '../../../services/validation';
import { useRouter } from "next/navigation";
import generateRandomId from "@/services/generateRandomId";
import formValidator from "@/services/validation";

const AddProduct = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    brandId: "",
    description: "",
    specifications: "",
    images: [],
    brochures: [],
    /* vatInclusive: false,
    vatRate: "" */
  })
  const [errors, setErrors] = useState({});

  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);
  const brochureFileRef = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);

  const brandsQuery = useQuery({
    queryKey: ["allBrands"],
    queryFn: () => apiGet({ url: "/brand?isActive=true" })
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

  const listBrandOptions = () => {
    if (brandsQuery?.data?.length) {
      return brandsQuery.data.map(brand =>
        <option key={brand.id} value={brand.id}>{brand.name}</option>
      )
    }
  }

  const createImageUrls = () =>{
    const files = inputFileRef.current.files;
    if(files.length){
      const filesArray = Array.from(files);
      let urls = [];
      filesArray.forEach( file =>{
        urls.push({ id: generateRandomId(24), url: URL.createObjectURL(file) })
        setImageUrls(urls);
      })
    }else{
      setImageUrls([])
    }
  }

  const listImages = () => {
    if (imageUrls.length > 0) {
      return imageUrls.map((img) => <li key={img.id} className='m-2 d-flex align-items-start'>
        <img src={img.url} alt="Product Image" width="200px" />
      </li>)
    }
  }

  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }


  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: (data) => apiPost({ url: "/product", data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allProducts"])
        router.push("/products")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = formValidator(["name", "brandId"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    if (!inputFileRef.current?.files.length) {
      return dispatchMessage({ severity: "error", message: "No Images Selected" });
    }
    console.log(inputFileRef.current?.files)
    const files = inputFileRef.current.files;
    const filesArray = Array.from(files);
    setIsSendingImage(true)
    const allImages = await Promise.all(
      filesArray.map( async file => await postImage(file.name, file))
    )
    let allFiles = []
    if (brochureFileRef.current?.files.length) {
      const files = brochureFileRef.current.files;
      const filesArray = Array.from(files);
      allFiles = await Promise.all(
        filesArray.map( async file => await postImage(file.name, file))
      )
    }
    
    setIsSendingImage(false)
    let data = {...formData};
    data.images = allImages
    data.brochures = allFiles;
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
        <h4 className="m-0">Product</h4>
        <span className="breadcrumb-item ms-3"><a href="/products"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Product</h5>
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
                  <label htmlFor="name" className="form-label">Product Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")} />
                  <span className='text-danger font-monospace small'>{errors.name}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="code" className="form-label">Product Code</label>
                  <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea className="form-control" rows={4} id="description" value={formData.description} onChange={handleChange("description")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="specifications" className="form-label">Specifications</label>
                  <textarea className="form-control" id="specifications" rows={4} value={formData.specifications} onChange={handleChange("specifications")}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Product Images <span className='fst-italic text-warning ms-4'>required (less than 4mb)</span></label>
                  <input className="form-control" id="images" accept="image/*" onChange={createImageUrls} ref={inputFileRef} type="file" multiple/>
                  <span className='text-danger font-monospace small'>{errors.images}</span>
                  {imageUrls.length > 0 &&
                    <div>
                      <h6 className='small fw-bold mt-3'>Images</h6>
                      <div className="d-flex">
                        {listImages()}
                      </div>
                    </div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="brochures" className="form-label">Brochures <span className='fst-italic text-warning ms-4'>(less than 4mb)</span></label>
                  <input className="form-control" id="brochures" accept="application/pdf,application/vnd.ms-excel"  ref={brochureFileRef} type="file" multiple/>
                </div>

                <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading || isSendingImage} onClick={handleSubmit}>{(isLoading || isSendingImage) ? "Loading..." : "Submit"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduct