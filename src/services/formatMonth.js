const month= ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
const shortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMonth = (monthInt, format = "long")=>{
  monthInt = parseInt(monthInt)
  if(format === "short"){
    return shortMonth[monthInt]
  }else{
    return month[monthInt]
  }
}

export default formatMonth;