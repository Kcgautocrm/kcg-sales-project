
const generateDeleteResourceMsg = (delCountObj) =>{
  let msg = "";
  let deletedModels = Object.keys(delCountObj);
  deletedModels.forEach( item =>{
    if(delCountObj[item]){
      msg += `${delCountObj[item]} ${item}, `
    }
  })
  return msg
}

export default generateDeleteResourceMsg;