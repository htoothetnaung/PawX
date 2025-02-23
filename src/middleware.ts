import { NextResponse } from "next/server";

export const middleware = async (req: Request) => {
  // Add your custom authentication middleware logic here if needed
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
