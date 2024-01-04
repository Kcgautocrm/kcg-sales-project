import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";

let modelName = "Pfi Request Form"
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    const data = await prisma.pfiRequestForm.findUnique({
      where: {
        id,
      },
      include: {
        employee: true,
        brand: true,
        product: true,
        customer: true,
        contactPerson: true
      }
    });

    if (!data) {
      return new NextResponse(JSON.stringify({message: `${modelName} with ID Not Found!`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    return new NextResponse(JSON.stringify({message: `${modelName} fetched successfully`, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string }}
) {
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
    const action = searchParams.get('action') ;
    const id = params.id;
    let json = await request.json();

    const prevData = await prisma.pfiRequestForm.findUnique({
      where: {id}
    });

    const updatedData = await prisma.pfiRequestForm.update({
      where: { id },
      data: json,
    });

    const employeeDetails = await prisma.employee.findUnique({ where: {
      id: updatedData.employeeId
    }})
    if(prevData?.approved === false && json?.approved === true){
      // notify salesPerson
      await prisma.notification.create({
        data: { title: "Pfi Request", receiverId: updatedData.employeeId, resourceUrl: `/pfiRequests/${id}`, message: `Pfi with reference number: ${updatedData.pfiReferenceNumber} has been approved`}
      })
      // notify supervisor
      if(employeeDetails?.supervisorId){
        await prisma.notification.create({
          data: { title: "Pfi Request", receiverId: employeeDetails?.supervisorId, resourceUrl: `/pfiRequests/${updatedData.id}`, message: `${employeeDetails?.firstName} ${employeeDetails?.lastName}'s Pfi with reference number: ${updatedData.pfiReferenceNumber} has been approved` }
        })
      }

    }

    if(action === "lock"){
      // notify admin
      await prisma.notification.create({
        data: { title: "Pfi Request", staffCadre: "admin", resourceUrl: `/pfiRequests/${id}`, message: `${employeeDetails?.firstName} ${employeeDetails?.lastName} sent Pfi Request for approval`}
      })
    }

    if(action === "unlock"){
      // notify salesPerson
      await prisma.notification.create({
        data: { title: "Pfi Request", receiverId: updatedData?.employeeId, resourceUrl: `/pfiRequests/${id}`, message: `Your Pfi Request has been unlocked by admin`}
      })
    }

    if (!updatedData) {
      return new NextResponse(JSON.stringify({message: `${modelName} with ID not found`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    return new NextResponse(JSON.stringify({ message: `${modelName} updated successfully`, data: updatedData}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    await prisma.pfiRequestForm.delete({
      where: { id },
    });
    return new NextResponse(JSON.stringify({message: `${modelName} deleted with Id: ${id}`}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
} 

