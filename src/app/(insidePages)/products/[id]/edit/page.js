"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";
import generateRandomId from "@/services/generateRandomId";
import formValidator from "@/services/validation";

const EditProduct = () =>{
  const params = useParams();
  const {id} = params;
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    brandId: "",
    description: "",
    specifications: "",
    images: [],
    brochures: [],
  })
  const [errors, setErrors] = useState({});


  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);
  const brochureFileRef = useRef(null);
  const [ imageUrls, setImageUrls] = useState([]);

  const {data, isFetching} = useQuery({
    queryKey: ["allProducts", id],
    queryFn: () => apiGet({ url: `/product/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      return res.data
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      return {}
    }),
    staleTime: Infinity,
    retry: 3
  }) 
  
  useEffect(()=>{
    if(data){
      let {name, code, brandId, description, specifications, images, brochures, } = data;
      setFormData( prevState =>({
        ...prevState,
        name, code, brandId, description, specifications, images, brochures,
      }))
    }
  }, [data])


  

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

  const listBrandOptions = () =>{
    if(brandsQuery?.data?.length){
      return brandsQuery.data.map(brand =>
        <option key={brand.id} value={brand.id}>{brand.name}</option>
      )
    }
  }

  const deleteExistingImages = (image) => (e) =>{
    e.preventDefault();
    let existingImages = formData.images;
    existingImages = existingImages.filter(function(item){ return image !== item});
    setFormData(prevState => ({
      ...prevState,
      images: existingImages
    }));
  }


  const listExistingImages = ()=>{
    if(formData.images.length > 0){
      return formData.images.map( (img) => <li key={img} className='m-2 d-flex align-items-start'>
        <img src={img} alt="Product Image" height="150px" />
        <button onClick={deleteExistingImages(img)} style={{ width: "20px", height: "20px", borderRadius: "14px", background: "rgba(0, 0, 0, 0.693)", position: "relative", top: "-15px", left: "-8px"}} 
        className='btn d-flex align-items-center justify-content-center text-white'><i className="fa-solid fa-xmark"></i></button>
      </li>)
    }
  }

  const listExistingBrochures = ()=>{
    return formData.brochures.map( (file) => <li className="my-3" key={file}> <span>{file.slice(56, file.length).replaceAll("%20", "-")}</span> <br />
      <span> 
        <a className="btn btn-link px-0" href={file} target="_blank">download</a>
        <button className="btn btn-link text-danger ms-3" onClick={()=>deleteBrochure(file)}>delete</button>
      </span> 
    </li>)
  }

  const deleteBrochure = (file) =>{
    let data = {...formData};
    data.brochures = data.brochures.filter(function(item){ return file !== item});
    setFormData(data);
  }




  const listNewImages = ()=>{
    if(imageUrls.length > 0){
      return imageUrls.map( (img) => <li key={img.id} className='m-2 d-flex align-items-start'>
        <img src={img.url} alt="Product Image" height="150px" />
      </li>)
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


  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const queryClient = useQueryClient();
  const {isLoading, mutate} = useMutation({
    mutationFn: (data) =>apiPatch({ url: `/product/${id}`, data})
    .then( res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      queryClient.invalidateQueries(["allProducts", id])
      router.push(`/products/${id}`)
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    }),
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = formValidator(["name", "brandId", "images"], formData);
    if(Object.keys(errors).length){
      if(Object.keys(errors).length == 1 && errors.images && inputFileRef.current?.files.length){
        // do nothing
      }else{
        dispatchMessage({ severity: "error", message: "Some required fields are empty" })
        return setErrors(errors);
      }
    }
    let allImages = []
    if (inputFileRef.current?.files.length) {
      console.log(inputFileRef.current?.files)
      const files = inputFileRef.current.files;
      const filesArray = Array.from(files);
      setIsSendingImage(true)
      allImages = await Promise.all(
        filesArray.map( async file => await postImage(file.name, file))
      )
    }
    
    let allFiles = []
    if (brochureFileRef.current?.files.length) {
      console.log(brochureFileRef.current.files)
      const files = brochureFileRef.current.files;
      const filesArray = Array.from(files);
      allFiles = await Promise.all(
        filesArray.map( async file => await postImage(file.name, file))
      )
    }
    setIsSendingImage(false)
    let data = {...formData};
    data.images = [...data.images, ...allImages]
    data.brochures = [...data.brochures, ...allFiles]
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
              <div className="card-body p-4" style={{maxWidth: "700px"}}>
                <h5 className="card-title fw-semibold mb-4 opacity-75">Edit Product</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="brandId" className="form-label">Brand (<span className='fst-italic text-warning'>required</span>)</label>
                    <select className="form-select shadow-none" id="brandId" onChange={handleChange("brandId")} value={formData.brandId} aria-label="Default select example">
                      <option value="">Select Brand</option>
                      {!brandsQuery.isLoading && listBrandOptions()}
                    </select>
                    <span className='text-danger font-monospace small'>{errors.brandId}</span>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Product Name (<span className='fst-italic text-warning'>required</span>)</label>
                    <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")}/>
                    <span className='text-danger font-monospace small'>{errors.name}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Product Code</label>
                    <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")}  />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" rows={4}  id="description" value={formData.description} onChange={handleChange("description")}></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="specifications" className="form-label">Specifications</label>
                    <textarea className="form-control" id="specifications" rows={4} value={formData.specifications} onChange={handleChange("specifications")}></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="images" className="form-label">Product Images <span className='fst-italic text-warning ms-4'>(less than 4mb)</span></label>
                    <input className="form-control" id="images" accept="image/*" onChange={createImageUrls} ref={inputFileRef} type="file" multiple />
                    <span className='text-danger font-monospace small'>{errors.images}</span>
                    {(imageUrls.length > 0 || formData.images.length > 0) &&
                      <div>
                        <h6 className='small fw-bold mt-3'>Images</h6>
                        <div className="d-flex flex-wrap">
                          {listExistingImages()}
                          {listNewImages()}
                        </div>
                      </div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="images" className="form-label">Brochures <span className='fst-italic text-warning ms-4'>(less than 4mb)</span></label>
                    <input className="form-control" id="brochures" accept="application/pdf,application/vnd.ms-excel" ref={brochureFileRef} type="file" multiple />

                    {formData.brochures.length > 0 &&
                    <ul className="d-flex flex-wrap list-unstyled">
                      {listExistingBrochures()}
                    </ul>}
                    
                  </div>



                  <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading || isSendingImage} onClick={handleSubmit}>{(isLoading || isSendingImage)? "Loading..." : "Submit"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default EditProduct