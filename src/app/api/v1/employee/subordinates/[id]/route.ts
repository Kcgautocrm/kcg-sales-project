import { prisma } from "@/lib/prisma";
import { UUID } from "crypto";
import { NextResponse } from "next/server";
import authService from "@/services/authService";

let modelName = "Subordinates"
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin", "supervisor"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const id = params.id;
    const data = await prisma.employee.findMany({
      where: {
        supervisorId: id,
        isActive: true,
      },
      include: {
        company: true,
        branch: true,
      }
    });
  
    if (!data) {
      return new NextResponse(JSON.stringify({message: `${modelName} of Employee with ID Not Found!`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
  
    return new NextResponse(JSON.stringify({message: `${modelName} fetched successfully`, data: data }), {
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