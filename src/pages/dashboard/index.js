import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Index = () => {
  const session = useSession();
  const { status, data } = session;
  const router = useRouter();
  console.log(session);
  useEffect(() => {
    if (status == "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  if (status == "authenticated") return <div>Index</div>;
};

export default Index;
