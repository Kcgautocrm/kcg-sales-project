export function prohibitedRoutes(){
  return {
    salesPerson: ["/companies", "/branches", "/brands", "/employees"],
    supervisor: ["/companies", "/branches", "/brands", "/employees"],
    admin: []
  }
}

export function viewOnlyRoutes(){
  return {
    salesPerson: ["priceMaster", "targetAchievements", "products"],
    supervisor: ["priceMaster", "targetAchievements", "products"],
    admin: ["customers", "invoiceRequests", "marketingActivities", "pfiRequests", "visits" ]
  }
}


export function backendProhibitedRoutes(){
  return {
    salesPerson: ["/company", "/branch", "/brand", "/employee"],
    supervisor: ["/company", "/branch", "/brand", "/employee"],
    admin: []
  }
}
