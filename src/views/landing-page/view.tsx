"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { useBoolean } from "src/hooks/use-boolean";
import TextField from "@mui/material/TextField";
import { addUser, addUserToRoom } from "@/actions/userActions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addRoom } from "@/actions/roomActions";
import { Loader } from "lucide-react";
import Hero from "./Hero";
import Features from "./Features";

export default function LandingPage() {
  const agree = useBoolean(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const rooms = await getRooms();
  // const users = await getUsers();

  // Event handler for adding a new todo
  const handleAdd = async (e) => {
    e.preventDefault();
    // Check to see if user Exists already?

    const newUser = await addUser(email);
    localStorage.setItem("userId", newUser);
    setEmail("");
    setLoading(true);
    // if mobile
    const userAgent = navigator.userAgent || navigator.vendor;

    if (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      )
    ) {
      // reroute to landing page
      router.push(`/mobile`);
    } else {
      // else
      const room = await addUserToRoom(email, name);
      router.push(`/rooms/${room}`);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }
  return (
    <>
      <Hero></Hero>
      <Features></Features>
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join Peer Programming.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
              Join us to explore new frontiers in coding and collaboration. Sign
              up to join a session now.
            </p>
            <form className="mx-auto mt-10 flex flex-col max-w-md gap-x-4 gap-y-4">
              <div className="flex max-w-md gap-x-4">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="name"
                  name="name"
                  type="name"
                  autoComplete="name"
                  required
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  disabled={!agree.value || email.length === 0}
                  style={{
                    opacity: !agree.value || email.length === 0 ? 0.5 : 1,
                  }}
                  onClick={(e) => handleAdd(e)}
                >
                  Enter
                </button>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="comments"
                    aria-describedby="comments-description"
                    name="comments"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    onChange={(e) => agree.setValue(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="comments" className="font-medium text-white">
                    Acknowledgement
                  </label>
                  <p id="comments-description" className="text-white">
                    I understand the terms of service.
                  </p>
                </div>
              </div>
              {/* <FormControlLabel
                label="I understand the terms of service."
                control={
                  <Checkbox
                    checked={agree.value}
                    onChange={(e) => agree.setValue(e.target.checked)}
                  />
                }
              /> */}
            </form>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient
                  id="759c1415-0410-454c-8f7c-9a820de03641"
                  cx={0}
                  cy={0}
                  r={1}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(512 512) rotate(90) scale(512)"
                >
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      {/* <h1 className="text-3xl font-bold underline">This is a Landing page.</h1> */}
      {/* <h1 className="text-2xl font-bold underline">{JSON.stringify(rooms)}</h1>
      <h1 className="text-2xl font-bold underline">{JSON.stringify(users)}</h1> */}
    </>
  );
}
