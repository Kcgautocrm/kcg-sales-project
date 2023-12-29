import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authService from "@/services/authService";
import { sendAccountCreationEmail } from "@/services/sendEmail";


let routeName = "Employee"
export async function GET(request: Request) {
  try {

    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || "1");
    const take = parseInt(searchParams.get('take') || "");
  
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    let staffCadre : any = searchParams.get('staffCadre');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const isActive = searchParams.get("isActive");
    

    if(staffCadre === "admin"){
      staffCadre = {equals: ["admin"]}
    }else if (staffCadre === "supervisor,salesPerson"){
      staffCadre = {equals: ["supervisor", "salesPerson"]}
    }else if(staffCadre === "salesPerson") {
      staffCadre = {equals: ["salesPerson"]}
    }
  
    let myCursor = "";
    const data = await prisma.employee.findMany({
      where: {
        ...(isActive && {isActive: true}),
        ...(companyId && { companyId }),
        ...(branchId && { branchId }),
        ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' } }),
        ...(lastName && { lastName: { contains: lastName, mode: 'insensitive' } }),
        ...(staffCadre && {staffCadre})
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        company: true,
        branch: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const totalCount = await prisma.employee.count({
      where: {
        ...(isActive && {isActive: true}),
        ...(companyId && { companyId }),
        ...(branchId && { branchId }),
        ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' } }),
        ...(lastName && { lastName: { contains: lastName, mode: 'insensitive' } }),
        ...(staffCadre && {staffCadre})
      }
    })
    const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    myCursor = lastItemInData?.id // Example: 29
  
    return new NextResponse(JSON.stringify({page, take, totalCount, message: `${routeName} list fetched successfully`, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}

export async function POST(request: Request) {
  try {
    const authToken = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(authToken, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const data = await request.json();
    // encrypt password
    let encryptedPassword;
    if(typeof data.password === "string") encryptedPassword = await bcrypt.hash(data.password, 10);
    if(typeof encryptedPassword === "string") data.password = encryptedPassword;
    
    // create user in database
    let {email} = data;
    let emailExists = await prisma.employee.findFirst({ where: {email}})
    if(emailExists){
      return new NextResponse(JSON.stringify({ message: `Employee with email "${email}" already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }
    const user = await prisma.employee.create({
      data,
    }) ;
    // create user token
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.TOKEN_KEY as string,
      {
        expiresIn: "2h",
      }
    );
    let payload = {...user, token}

    //send email
    let info = await sendAccountCreationEmail({firstName: data.firstName, lastName: data.lastName, middleName: data?.middleName, email: data.email})
    // return new user
    return new NextResponse(JSON.stringify({message: `Account Created Successfully. Email sent to employee`, data: payload}), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    // error response if user with email already exists
    if (error.code === "P2002") {
      return new NextResponse(JSON.stringify({message: `${routeName} with email already exists`}), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 
