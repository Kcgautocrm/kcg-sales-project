import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Invoice Request Form"
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
    
    const employeeId = searchParams.get('employeeId');
    const customerId = searchParams.get('customerId');
    const contactPersonId = searchParams.get('contactPersonId');
    const brandId = searchParams.get('brandId');
    const productId = searchParams.get('productId');
    let approved: any = searchParams.get('approved');

    if(approved === "approved"){
      approved = true
    }else if(approved === "unApproved"){
      approved = false
    }else{
      approved === null
    }
  
    let myCursor = "";
    const data = await prisma.invoiceRequestForm.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(customerId && { customerId }),
        ...(contactPersonId && { contactPersonId }),
        ...(brandId && { brandId }),
        ...(productId && { productId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        employee: true,
        product: true,
        brand: true
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
    const totalCount = await prisma.invoiceRequestForm.count({
      where: {
        ...(employeeId && { employeeId }),
        ...(customerId && { customerId }),
        ...(contactPersonId && { contactPersonId }),
        ...(brandId && { brandId }),
        ...(productId && { productId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
      },
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
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const json = await request.json();
    // validate data here
    let {pfiRequestFormId} = json;
    let pfiExists = await prisma.invoiceRequestForm.findFirst({ where: {pfiRequestFormId}})
    if(pfiExists){
      return new NextResponse(JSON.stringify({ message: `Invoice request with pfi request already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }

    const data = await prisma.invoiceRequestForm.create({
      data: json,
    });
    await prisma.notification.create({
      data: {staffCadre: "admin", resourceUrl: `/invoiceRequests/${data.id}`, message: "New Invoice Request created (pending approval)" }
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
} 
