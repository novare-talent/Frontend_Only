// "use client";

// import React, { ReactNode, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/utils/supabase/client";
// import { Navbar } from "@/components/Sig-Hire/navbar";

// const Layout = ({ children }: { children: ReactNode }) => {
//   const [loading, setLoading] = useState(true);
//     const router = useRouter();
//     const supabase = createClient();
  
//     useEffect(() => {
//       const checkUser = async () => {
//         const { data: { user }, error } = await supabase.auth.getUser();
        
//         if (error || !user) {
//           router.push("/sign-in");
//         } else {
//           const { data: profile } = await supabase
//             .from('profiles')
//             .select('role')
//             .eq('id', user.id)
//             .single();
  
//           if (profile?.role !== 'client') {
//             if (profile?.role === 'user') {
//               router.push('/Dashboard');
//             } else {
//               router.push('/');
//             }
//             return;
//           }
          
//           setLoading(false);
//         }
//       };
//       checkUser();
//     }, [router, supabase]);
  
//     if (loading) {
//       return <div>Loading...</div>;
//     }

//   return (
//     <html lang="en">
//       <body>
//         <Navbar />
//         <main>{children}</main>
//       </body>
//     </html>
    
//   );
// };

// export default Layout;

import { Navbar } from "@/components/Sig-Hire/navbar";

export default function SigHireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
