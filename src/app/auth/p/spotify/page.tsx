"use client"
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const SignInPage = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (!(status === "loading") && !session) void signIn("spotify");
        if (session) window.close();
    }, [session, status]);

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-[#121212]">
            Taking you to Spotify...
        </div>
    );
};

export default SignInPage;