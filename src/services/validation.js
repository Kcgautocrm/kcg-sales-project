

export default function formValidator (arrayOfRequiredValues, formData){
  let errors = {}

  arrayOfRequiredValues.forEach( value =>{
    
    if(!formData[value]){
      errors[value] = `${convertToNormalText(value)} is required`;
    }else if(typeof(formData[value]) === "object"){
      if(formData[value].length === 0){
        errors[value] = `${convertToNormalText(value)} is required`;
      }else if(Object.keys(formData[value]).length === 0){
        errors[value] = `${convertToNormalText(value)} is required`;
      }
    }
  })

  return errors
}

function convertToNormalText (camelCaseText){
  return camelCaseText.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
}