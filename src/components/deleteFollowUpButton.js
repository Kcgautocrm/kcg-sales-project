import ConfirmationModal from '@/components/confirmationModal';


const DeleteFollowUpButton = ({isLoading, deleteFunc, id}) =>{

  return (
    <>
      <button className="btn btn-link text-danger ms-auto"  data-bs-toggle="modal" data-bs-target={`#followUpVisit-${id}`}>Delete</button>

      <ConfirmationModal title="Delete Follow Up Visit" message="Are you sure you want to delete this follow up visit?" isLoading={isLoading} onSubmit={deleteFunc} id={`followUpVisit-${id}`} btnColor='danger' />
    </>
  )
}

export default DeleteFollowUpButton;