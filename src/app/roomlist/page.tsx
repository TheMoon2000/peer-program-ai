// "use client";

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
import { getRooms, getUsers } from "@/db/queries";

export default async function LandingPage() {
  // const agree = useBoolean(false);

  const rooms = await getRooms();
  const users = await getUsers();

  // Event handler for adding a new todo
  // const handleAdd = async () => {
  //   createTodo(input);
  //   setInput("");
  // };

  return (
    <>
      <h1 className="text-3xl font-bold underline">This is a Landing page.</h1>
      <h1 className="text-2xl font-bold underline">{JSON.stringify(rooms)}</h1>
      <h1 className="text-2xl font-bold underline">{JSON.stringify(users)}</h1>

      {/* <Box sx={{ display: "flex", flexDirection: "column", height: 1 }}>
        <Box
          component="main"
          style={{ backgroundColor: "#7070e0", flexGrow: 1 }}
        >
          <Dialog open={true} maxWidth="sm" fullWidth>
            <DialogTitle>Welcome to Pear Program</DialogTitle>
            <DialogContent sx={{ overflow: "visible" }}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                content=""
              />
              
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                variant="contained"
                sx={{ width: 100 }}
                onClick={() => addRoom("test", "test", "test")}
              >
                Enter
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box> */}
    </>
  );
}
