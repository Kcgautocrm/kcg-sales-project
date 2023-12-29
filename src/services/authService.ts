import jwt from 'jsonwebtoken';
import {prisma} from "@/lib/prisma";

type TokenData = {
  id: string;
  email: string;
  staffCadre: ["admin"] | ["salesPerson"] | ["supervisor", "salesPerson" ];
  firstName: string;
  lastName: string;
  accountType: string;
  
}

const authService = async (token: string, staffCadreList: string[]) =>{
  let isAuthorized = false;
  if(!token){
    return {isAuthorized: false}
  }
  let decoded = jwt.decode(token) as TokenData;
  if(!decoded.staffCadre){
    return {isAuthorized: false}
  }
  const user = await prisma.employee.findUnique({
    where: {id: decoded?.id}
  })
  if(user?.isActive === false){
    return {isAuthorized: false}
  }
  if(staffCadreList.includes(decoded?.staffCadre[0])){
    isAuthorized = true
  }
  return {isAuthorized, staffCadre: decoded?.staffCadre[0]}
}

export default authService;