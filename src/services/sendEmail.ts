import * as Nodemailer from 'nodemailer';
import { env } from 'process';
import {accountCreationTemp, resetPasswordTemp, customerMeetingReminderTemp} from "@/utils/emailTemlates";

type AccountCreationEmailParams = {
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
}

type ResetPasswordEmailParams = {
  firstName: string,
  middleName: string | null,
  lastName: string,
  email: string,
  token: string
}

type VisitReminderEmailParams = {
  customerName: string,
  contactPersonName: string 
  employeeName: string,
  visitDate: string,
  message?: string,
  email: string
}

let transporter = Nodemailer.createTransport({
  name: "www.banjnetdigital.com",  //www.agronigeria.ng
  host: "mail.banjnetdigital.com",  //mail.agronigeria.ng
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "noreply@banjnetdigital.com", //no-reply@agronigeria.ng
    pass: "Noreply.202317", //AgroNigA!!en90
  },
});

export async function sendAccountCreationEmail({ firstName, middleName = "", lastName, email }: AccountCreationEmailParams): Promise<any> {
  let mailDetails = {
    from: 'noreply@banjnetdigital.com',
    to: `${email}`,
    subject: `Account Creation Email`,
    text: 'Follow the instructions below',
    html: accountCreationTemp({firstName, middleName, lastName, email})
  };
  let info = await transporter.sendMail(mailDetails);
  if (info) {
    return {
      success: true,
      message: `An email has been sent to employee`
    }
  }
}

export async function sendResetPasswordEmail({ firstName, middleName, lastName, email, token }: ResetPasswordEmailParams): Promise<any> {
  let mailDetails = {
    from: 'noreply@banjnetdigital.com',
    to: `${email}`,
    subject: `Reset Password Email`,
    text: 'Follow the instructions below',
    html: resetPasswordTemp({firstName, middleName, lastName, token})
  };
  let info = await transporter.sendMail(mailDetails);
  if (info) {
    return {
      success: true,
      message: `An email has been sent to employee`
    }
  }
}

export async function sendVisitReminderEmail({ customerName, contactPersonName, email, employeeName, visitDate, message }: VisitReminderEmailParams): Promise<any> {
  let mailDetails = {
    from: 'noreply@banjnetdigital.com',
    to: `${email}`,
    subject: `Visit Reminder Email`,
    text: '',
    html: customerMeetingReminderTemp({customerName, contactPersonName, employeeName, visitDate, message})
  };
  let info = await transporter.sendMail(mailDetails);
  if (info) {
    return {
      success: true,
      message: `An email has been sent to customer`
    }
  }
}