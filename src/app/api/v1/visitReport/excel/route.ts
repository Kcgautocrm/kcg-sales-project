
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import reOrderObject from "@/services/reorderObjectKeys";


let routeName = "Visit Report"
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

    let data = await prisma.visitReport.findMany({
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            customer: {
                select: {
                    companyName: true,
                }
            },
            contactPerson: {
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
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    let filteredData : any[]  = [...data];
    let result = filteredData.map( (item) =>{
      item.staffName = `${item?.employee?.firstName} ${item?.employee?.lastName}`;
      item.customer = item?.customer?.companyName;
      item.contactPerson = item?.contactPerson?.name;
      item.numOfFollowUpVisits = item?.followUpVisits?.length
      item.productsDiscussed = item.productsDiscussed.join(", ")
      delete item?.extraData
      delete item?.employee
      delete item?.employeeId
      delete item?.customerId
      delete item?.contactPersonId
      delete item?.followUpVisits

      let orderedObject = reOrderObject(item, ["id", "staffName", "customer", "contactPerson", "callType", "status", "productsDiscussed", "quantity", "durationOfMeeting", "meetingOutcome", "numOfFollowUpVisits", "visitDate", "nextVisitDate", "pfiRequest", "isActive", "createdAt", "updatedAt" ]);
        return orderedObject
    })
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