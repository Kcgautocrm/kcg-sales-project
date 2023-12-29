"use client"

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiPatch, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import Compress from "react-image-file-resizer";
import formValidator from "@/services/validation";

const EditBrand = () =>{
  const params = useParams();
  const {id} = params;
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    logo: ""
  })
  const [errors, setErrors] = useState({});

  const [ imageUrl, setImageUrl] = useState("");
  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);

  const {data, isFetching} = useQuery({
    queryKey: ["allBrands", id],
    queryFn: () => apiGet({ url: `/brand/${id}`})
    .then(res =>{
      console.log(res.data)
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
      let {name, code, description, logo} = data;
      setFormData( prevState =>({
        ...prevState,
        name, code, description, logo
      }))
    }
  }, [data])


/*   const uploadImage = (event) => {
    const file = event.target.files[0];
    if(file){
      Compress.imageFileResizer(
        file, // the file from input
        120, // width
        120, // height
        "PNG", // compress format WEBP, JPEG, PNG
        80, // quality
        0, // rotation
        (uri) => {
          setBase64Image(uri)
        },
        "base64" // blob or base64 default base64
      );
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  } */
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
    mutationFn: (data)=>apiPatch({ url: `/brand/${id}`, data})
    .then( res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      queryClient.invalidateQueries(["allBrands"])
      router.push(`/brands/${id}`)
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
      return mutate(formData);
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
        <h4 className="m-0">Brand</h4>
        <span className="breadcrumb-item ms-3"><a href="/brands"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>
      

      <div className="row">
          <div className="col-12 d-flex align-items-stretch">
            <div className="card w-100">
              <div className="card-body p-4" style={{maxWidth: "700px"}}>
                <h5 className="card-title fw-semibold mb-4 opacity-75">Add Brand</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Brand Name</label>
                    <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange("name")}/>
                    <span className='text-danger font-monospace small'>{errors.name}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Brand Code</label>
                    <input type="text" className="form-control" id="code" value={formData.code} onChange={handleChange("code")}  />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" id="description" rows={4} value={formData.description} onChange={handleChange("description")}></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="logo" className="form-label">Brand Logo <span className='fst-italic text-warning ms-4'>required (less than 4mb)</span></label>
                    <input className="form-control" id="logo" accept="image/*" onChange={createImageUrl} ref={inputFileRef} type="file"/>
                    <span className='text-danger font-monospace small'>{errors.logo}</span>
                    {(imageUrl || formData.logo) &&
                      <div>
                        <h6 className='small fw-bold mt-3'>Logo Preview</h6>
                        <img src={imageUrl || formData.logo} alt="Logo Preview" className='border rounded' width="100px" />
                      </div>}
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

export default EditBrand