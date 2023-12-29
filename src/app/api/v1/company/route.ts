import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadImage } from "@/services/imageService";
import authService from "@/services/authService";


let routeName = "Company"
export async function GET(request: Request) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || "1");
    const take = parseInt(searchParams.get('take') || "");
    const isActive = searchParams.get("isActive");
    const code = searchParams.get('code');
    const name = searchParams.get('name');
    
    let myCursor = "";
    const data = await prisma.company.findMany({
      where: {
        ...(code && { code: { contains: code, mode: 'insensitive' } }),
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(isActive && {isActive: true})
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        _count: {
          select: {
            branches: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const totalCount = await prisma.company.count({
      where: {
        ...(code && { code: { contains: code, mode: 'insensitive' } }),
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(isActive && {isActive: true})
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
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    let result;
    const json = await request.json();
    // validate data here
    if(json?.logo?.startsWith("data:image")){
      console.log(json.logo)
      result = await uploadImage({ data: json.logo });
      console.log(result)
      json.logo = result.secure_url
    }
    let {code, name, email} = json;
    let codeExists = await prisma.company.findFirst({ where: {code}})
    if(codeExists){
      return new NextResponse(JSON.stringify({ message: `Company with code "${code}" already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }

    let nameExists = await prisma.company.findFirst({ where: {name}})
    if(nameExists){
      return new NextResponse(JSON.stringify({ message: `Company with name "${name}" already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }

    let emailExists = await prisma.company.findFirst({ where: {email}})
    if(emailExists){
      return new NextResponse(JSON.stringify({ message: `Company with email "${email}" already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }
    
    const data = await prisma.company.create({
      data: json,
    });
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
     });
  }
} 
