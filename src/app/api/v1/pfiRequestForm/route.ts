import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Pfi Request Form"
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
    const pfiReferenceNumber = searchParams.get('pfiReferenceNumber');
    const locked = searchParams.get('locked');
    let approved: any = searchParams.get('approved');

    if(approved === "approved"){
      approved = true
    }else if(approved === "unApproved"){
      approved = false
    }else{
      approved === null
    }
    
  
    let myCursor = "";
    const data = await prisma.pfiRequestForm.findMany({
      where: {
        ...(locked && {locked: true}),
        ...(employeeId && { employeeId }),
        ...(customerId && { customerId }),
        ...(contactPersonId && { contactPersonId }),
        ...(brandId && { brandId }),
        ...(productId && { productId }),
        ...(pfiReferenceNumber && { pfiReferenceNumber: { contains: pfiReferenceNumber, mode: 'insensitive' } }),
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
        brand: true,
        product: true,
        customer: true,
        contactPerson: true
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
    const totalCount = await prisma.pfiRequestForm.count({
      where: {
        ...(locked && {locked: true}),
        ...(employeeId && { employeeId }),
        ...(customerId && { customerId }),
        ...(contactPersonId && { contactPersonId }),
        ...(brandId && { brandId }),
        ...(productId && { productId }),
        ...(pfiReferenceNumber && { pfiReferenceNumber }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
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
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const json = await request.json();
    // validate data here
    let customerId, contactPersonId;
    if(json.customerType === "new customer"){
      let {employeeId, companyName, companyAddress, contactPersonName, phoneNumber, emailAddress} = json;
      let newCustomer = await prisma.customer.create({ data: {employeeId, companyName, address: companyAddress}});
      customerId = newCustomer.id;
      if(newCustomer){
        let newContactPerson = await prisma.contactPerson.create({ data: {employeeId, customerId: newCustomer.id, name: contactPersonName, phoneNumber, email: emailAddress}})
        contactPersonId = newContactPerson.id
      }
    }
    if(customerId && contactPersonId){
      json.customerId = customerId
      json.contactPersonId = contactPersonId
    }
    
    const data = await prisma.pfiRequestForm.create({
      data: json,
    });
    await prisma.notification.create({
      data: {staffCadre: "admin", resourceUrl: `/pfiRequests/${data.id}`, message: "New Pfi Request created (pending approval)" }
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
