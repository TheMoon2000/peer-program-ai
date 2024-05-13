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
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { useBoolean } from "src/hooks/use-boolean";
import Stack from "@mui/material/Stack";
import { addUserToRoom } from "@/actions/userActions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import Hero from "./Hero";
import Features from "./Features";
import { isDisabled } from "@/utils/helper";
import { axiosInstance, formatTimeInterval } from "@/Constants";
import { Link } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView";

export default function LandingPage() {
  const agree = useBoolean(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showTermDialog = useBoolean(false)
  const showErrorDialog = useBoolean(false)
  const [history, setHistory] = useState<{room_id: string, last_visited: string, partner: string | null}[]>()
  // const rooms = await getRooms();
  // const users = await getUsers();

  // Event handler for adding a new todo
  const handleAdd = async (e) => {
    e.preventDefault();
    localStorage.setItem("email", email);
    localStorage.setItem("name", name);
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

      const history = await axiosInstance.get(`/rooms/recent-activity?email=${email}`).then(r => r.data.history).catch(() => {
        showErrorDialog.setValue(true)
        return null
      })
      
      if (history === null) {
        return
      }
      
      if (history.length > 0) {
        setLoading(false)
        setHistory(history)
        return
      } else {
        const room = await addUserToRoom(email, name);
        router.push(`/rooms/${room}`);
      }
 
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
      {/* <Hero></Hero> */}
      {/* <Features></Features> */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join Code In Place's PearProgram.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
              Get paired up with a partner now! Be sure to enter the same email you used for Code in Place. You’ll need to allow video and audio permissions.
            </p>
            <form className="mx-auto mt-10 flex flex-col max-w-lg gap-x-4 gap-y-4">
              <div className="flex max-w-lg gap-x-4">
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
                  disabled={
                    isDisabled(agree, email, name)
                    // !agree.value || email.length === 0 || name.length === 0
                  }
                  style={{
                    opacity: isDisabled(agree, email, name) ? 0.5 : 1,
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
                    I agree to follow the Code In Place guidelines and accept the <span onClick={showTermDialog.onTrue} style={{color: "#c6f0ff", fontWeight: 600, cursor: "pointer"}} className="hover:underline">research conditions</span>.
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
      
      <Dialog open={showTermDialog.value} onClose={showTermDialog.onFalse} maxWidth="md" fullWidth >
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogContent style={{fontWeight: "unset"}}>
            
          <MarkdownTextView rawText={`
**Pear Program IS A RESEARCH PROJECT**

We are building Pear Program to learn about pair programming. The information we gather from your engagement with Pear Program enables our research team to understand how students learn coding and collaborative skills in CS contexts.. The knowledge we gain through Pear Program is available to inform students' decisions, teaching and administration at Stanford, and the accumulation of scientific knowledge about learning and collaboration generally.

Your contributions: By using Pear Program, you are volunteering for research. As you log in to Pear Program, a hash identifier is assigned to track your usage. We track, collect and aggregate information regarding your interactions with Pear Program including, among other things, the pages of the site you visit, the order and timing of your activities on Pear Program, search terms, pinning, and the hyperlinks you "click." We also may ask you to answer some simple survey questions. In the interest of research you may be exposed to some variation in the presentation of information available to you on the Pear Program portal. You may stop participating in this research at any time by no longer using Pear Program. Neither your academic progress nor program eligibility is contingent on your participation or non-participation in Pear Program.

We study the data we gather through Pear Program by linking it with other information about Stanford students collected through other University systems. The data will be coded so that your name will be removed and replaced with a unique identifying code. We will neither identify you by name in any discussions or publications, nor describe data in such a way that you can be identified.

While we cannot guarantee that you will receive any benefits from using Pear Program, the potential benefits include giving you more information about your learning and interactions with your coding partner. There is minimal risk associated with participating in this research.

Our commitments: We use our research findings to continually improve Pear Program and contribute to public discussion of educational improvement at Stanford and worldwide. In doing our work we consider and analyze data and report research findings at the aggregate level only.

You can read this message again any time from a link at the bottom of the landing page. If you have questions about this research please contact Pear Program team member Maxwell at Pear mbigman@stanford.edu. If you have concerns about this research and would like to speak with someone independent of the research team, you may contact the Stanford IRB at irb2-manager@lists.stanford.edu.
`}/>

        </DialogContent>
        <DialogActions>
          <Button variant="soft" color="primary" onClick={showTermDialog.onFalse}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showErrorDialog.value} onClose={showErrorDialog.onFalse}>
        <DialogTitle>Unable to Connect</DialogTitle>
        <DialogContent>We were unable to establish a connection to the server. Please check your network connection.</DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={showErrorDialog.onFalse}>Cancel</Button>
          <Button variant="soft" onClick={(e) => {
            showErrorDialog.onFalse()
            handleAdd(e)
          }}>Retry</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!history} onClose={() => setHistory(undefined)}>
        <DialogTitle>Recent Activity Found</DialogTitle>
        <DialogContent>
          <Typography>
            Our records indicate that you've been in the following session(s) for the past 24 hours. Would you like to return to one of them, or begin a new session?
          </Typography>
          <Stack direction="column" alignItems="stretch" py={2} rowGap={1}>
            {history?.map(h => <Link key={h.room_id} href={`/rooms/${h.room_id}`} underline="none" sx={{display: "inline-block", width: "100%"}}>
              <Button variant="soft" color="primary" fullWidth sx={{width: "100%", justifyContent: "flex-start"}}>
                <Stack alignItems="start">
                  <Typography fontWeight={500}>{`Partner: ${h.partner ?? "None"}`}</Typography>
                  <Typography variant="caption">{`Last visited: ${formatTimeInterval(Date.now() - Date.parse(h.last_visited))} ago`}</Typography>
                </Stack>
              </Button>
            </Link>)}
          </Stack>
        </DialogContent>
        <DialogActions>
        <Button variant="outlined" onClick={() => setHistory(undefined)}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={async () => {
          setLoading(true)
          const room = await addUserToRoom(email, name);
          router.push(`/rooms/${room}`);
        }}>Begin New Session</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
