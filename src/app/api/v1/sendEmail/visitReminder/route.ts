import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import { sendVisitReminderEmail } from "@/services/sendEmail";


export async function POST(request: Request) {
  try {
    const json = await request.json();

    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    let {customerName, contactPersonName, email, employeeName, visitDate, message } = json;
    const info = await sendVisitReminderEmail({customerName, contactPersonName, email, employeeName, visitDate, message})

    return new NextResponse(JSON.stringify({ message: `Email Reminder Sent successfully`, data: null }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
} 
