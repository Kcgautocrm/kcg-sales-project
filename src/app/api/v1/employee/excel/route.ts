
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import reOrderObject from "@/services/reorderObjectKeys";


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

    let data = await prisma.employee.findMany({
      where: {
        ...(isActive && {isActive: true}),
        ...(companyId && { companyId }),
        ...(branchId && { branchId }),
        ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' } }),
        ...(lastName && { lastName: { contains: lastName, mode: 'insensitive' } }),
        ...(staffCadre && {staffCadre})
      },
        include: {
            company: {
                select: {
                    name: true
                }
            },
            branch: {
                select: {
                    name: true,
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
    let filteredData : any[]  = [...data];
    let result = await Promise.all(filteredData.map( async (item) =>{
        item.companyName = item?.company?.name;
        item.branchName = item?.branch?.name;
        item.staffCadre = item?.staffCadre[0];
        item.brandsAssigned = item.brandsAssigned.join(", ");
        let supervisor = await prisma.employee.findFirst({
          where: {id: item.supervisorId}
        });
        item.supervisor = `${supervisor?.firstName || ""} ${supervisor?.lastName || ""}`

        delete item?.company
        delete item?.branch
        delete item?.companyId
        delete item?.branchId
        delete item?.extraData
        delete item?.password
        delete item?.supervisorId

        let orderedObject = reOrderObject(item, ["id", "firstName", "middleName", "lastName", "companyName", "branchName", "staffCadre", "email", "supervisor", "employmentDate", "brandsAssigned", "isActive", "createdAt", "updatedAt" ]);
        return orderedObject
    }))
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: result }), {
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