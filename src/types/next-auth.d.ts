import { IRole } from "@/models/Role";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      firstname?: string;
      lastname?: string;
      role?: IRole;
    };
  }

  interface User {
    _id?: string;
    firstname?: string;
    lastname?: string;
    role?: IRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    firstname?: string;
    lastname?: string;
    role?: IRole;
  }
}
