import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withRole =
  (allowedRoles = []) =>
  (WrappedComponent) => {
    const Wrapper = (props) => {
      const router = useRouter();
      const { data } = useSession();
      console.log({ data });
      useEffect(() => {
        // Check if the user has the required role
        // if (!allowedRoles.includes(userRole)) {
        // Redirect or handle unauthorized access
        //   router.push("/unauthorized");
        // }
      }, [data]);

      return <WrappedComponent {...props} />;
    };

    return Wrapper;
  };

export default withRole;
