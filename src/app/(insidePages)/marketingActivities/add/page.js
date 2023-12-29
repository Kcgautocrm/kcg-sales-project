"use client"

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Compress from "react-image-file-resizer";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import useGetUserData from "@/hooks/useGetUserData";
import generateRandomId from "@/services/generateRandomId";
import formValidator from "@/services/validation";
import formatAsCurrency from "@/services/formatAsCurrency";


const AddMarketingActivity = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const {userData} = useGetUserData();
  const [formData, setFormData] = useState({
    employeeId: "",
    activityName: "",
    activityDate: "",
    participants: "",
    location: "",
    objective: "",
    targetResult: "",
    briefReport: "",
    images: [],
    documents: [],
    costIncurred: "",
    pdfDetails: ""
  })

  const [errors, setErrors] = useState({});

  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);
  const documentFileRef = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);


  useEffect(()=>{
    setFormData( prevState =>({
      ...prevState,
      employeeId: userData.id
    }))
  },[userData])

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
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    if((prop === "costIncurred") && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }


  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: (data) => apiPost({ url: "/marketingActivity", data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allMarketingActivities"])
        router.push("/marketingActivities")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = formValidator(["activityName", "activityDate", "participants"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    if (!inputFileRef.current?.files.length) {
      return dispatchMessage({ severity: "error", message: "No Images Selected" });
    }
    console.log(inputFileRef.current?.files);
    const files = inputFileRef.current.files;
    const filesArray = Array.from(files);
    setIsSendingImage(true)
    const allImages = await Promise.all(
      filesArray.map( async file => await postImage(file.name.replaceAll(" ", "-"), file))
    )

    let allFiles = []
    if (documentFileRef.current?.files.length) {
      const files = documentFileRef.current.files;
      const filesArray = Array.from(files);
      allFiles = await Promise.all(
        filesArray.map( async file => await postImage(file.name.replaceAll(" ", "-"), file))
      )
    }
    
    setIsSendingImage(false)
    let data = {...formData};
    data.images = allImages;
    data.documents = allFiles;
    console.log(data);
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
        <h4 className="m-0">Marketing Activity</h4>
        <span className="breadcrumb-item ms-3"><a href="/marketingActivities"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Marketing Activity</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="activityName" className="form-label">Activity Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" id="activityName" value={formData.activityName} onChange={handleChange("activityName")} />
                  <span className='text-danger font-monospace small'>{errors.activityName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="activityDate" className="form-label">Activity Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control" id="activityDate" value={formData.activityDate} onChange={handleChange("activityDate")} />
                  <span className='text-danger font-monospace small'>{errors.activityDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="participants" className="form-label">Participants (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea rows={4} className="form-control" id="participants" value={formData.participants} onChange={handleChange("participants")}></textarea>
                  <span className='text-danger font-monospace small'>{errors.participants}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <textarea rows={4} className="form-control" id="location" value={formData.location} onChange={handleChange("location")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="objective" className="form-label">Objective</label>
                  <textarea rows={4} className="form-control" id="objective" value={formData.objective} onChange={handleChange("objective")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="targetResult" className="form-label">Target Result</label>
                  <textarea rows={4} className="form-control" id="targetResult" value={formData.targetResult} onChange={handleChange("targetResult")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="briefReport" className="form-label">Brief Report</label>
                  <textarea rows={4} className="form-control" id="briefReport" value={formData.briefReport} onChange={handleChange("briefReport")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="costIncurred" className="form-label">Cost Incurred <span className='ms-3 fw-bold'>{formatAsCurrency(formData.costIncurred)}</span></label>
                  <input type="text" className="form-control" id="costIncurred" value={formData.costIncurred} onChange={handleChange("costIncurred")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="images" className="form-label"> Images <span className='fst-italic text-warning ms-4'>required (less than 4mb each)</span></label>
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
                  <label htmlFor="documents" className="form-label">Documents <span className='fst-italic text-warning ms-4'>(less than 4mb each)</span></label>
                  <input className="form-control" id="brochures" accept=".pdf, .xlsx, .docx"  ref={documentFileRef} type="file" multiple/>
                </div>

                <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isSendingImage || isLoading} onClick={handleSubmit}>{(isSendingImage || isLoading) ? "Loading..." : "Submit"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMarketingActivity