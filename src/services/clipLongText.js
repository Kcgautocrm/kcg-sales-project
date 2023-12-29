const clipLongText = (text) =>{
  let result = text.substring(0, 30)
  if(text.length > 30){
    return `${result} ...`
  }
  return text
}

export default clipLongText;