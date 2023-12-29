import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadImage } from "@/services/imageService";
import authService from "@/services/authService";
import generateDeleteResourceMsg from "@/services/generateDeleteResourceMsg";

let modelName = "Company"
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    const id = params.id;
    const data = await prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        branches: true
      }
    });

    if (!data) {
      return new NextResponse(JSON.stringify({ message: `${modelName} with ID Not Found!` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify({ message: `${modelName} fetched successfully`, data }), {
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    let json = await request.json();
    let result;

    if (json?.logo?.startsWith("data:image")) {
      console.log(json.logo)
      result = await uploadImage({ data: json.logo });
      console.log(result)
      json.logo = result.secure_url
    }

    const updatedData = await prisma.company.update({
      where: { id },
      data: json,
    });

    return new NextResponse(JSON.stringify({ message: `${modelName} updated successfully`, data: updatedData }), {
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    const data = await prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        _count: { 
          select: {
            branches: true,
            employees: true
          }
        }
      },
    });
    let errorMsg = generateDeleteResourceMsg(data?._count)
    if(errorMsg){
      return new NextResponse(JSON.stringify({ message: `${modelName} cannot be deleted. ${errorMsg} are assigned to this ${modelName}`, data: data }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }



    await prisma.company.delete({
      where: { id },
    });
    return new NextResponse(JSON.stringify({ message: `${modelName} deleted with Id: ${id}` }), {
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

