"use client";
import { User, Session } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

interface ContextFunctions {
  getUsername: () => string;
  getBirthday: () => Date;
  getFirstName: () => string;
  getLastName: () => string;
  getFullName: () => string;
  getInitials: () => string;
  hasMounted: boolean;
}

export const UserContext = createContext<ContextFunctions>({
  getUsername: () => "",
  getBirthday: () => new Date(),
  getFirstName: () => "",
  getLastName: () => "",
  getFullName: () => "",
  getInitials: () => "",
  hasMounted: false,
});

interface UserI {
  username: string;
  birthday: Date;
  first_name: string;
  last_name: string;
}

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserI | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    //get session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log(error);
      } else {
        setSession(data.session);
      }
    };

    //get User
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log(error);
      } else {
        setUser(data.user);
      }
      return data.user;
    };

    //get user data
    const getUserData = async (user: User) => {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", user?.email)
        .single();
      if (error) {
        console.log(error);
      } else {
        setUserData(data);
      }
    };
    
    const Initialize = async () => {
      console.log("initalizing");
      await getSession();
      const user = await getUser();
      await getUserData(user!);
      setHasMounted(true);
    };

    Initialize();
  }, []);

  const getUsername = () => {
    return userData?.username!;
  };

  const getBirthday = () => {
    return userData?.birthday!;
  };

  const getFirstName = () => {
    return userData?.first_name!;
  };

  const getLastName = () => {
    return userData?.last_name!;
  };

  const getFullName = () => {
    return `${userData?.first_name!} ${userData?.last_name!}`;
  };

  const getInitials = () => {
    return `${userData?.first_name[0]!}${userData?.last_name[0]!}`;
  };


  const context = {
    getUsername,
    getBirthday,
    getFirstName,
    getLastName,
    getFullName,
    getInitials,
    hasMounted
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
}
