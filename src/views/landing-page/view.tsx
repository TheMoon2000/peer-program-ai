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

export default function LandingPage() {
  const agree = useBoolean(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: 1 }}>
      <Box component="main" style={{ backgroundColor: "#7070e0", flexGrow: 1 }}>
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle>Welcome to Pear Program</DialogTitle>
          <DialogContent sx={{overflow: "visible"}}>
            <TextField label="Email address" type="email" fullWidth />
            <FormControl>
              <FormControlLabel
                label="I understand that PeerProgram is a research project by Stanford University"
                sx={{ color: "#606060", mt: 2 }}
                control={
                  <Checkbox
                    checked={agree.value}
                    onChange={(e) => agree.setValue(e.target.checked)}
                  />
                }
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="contained" sx={{width: 100}}>
              Enter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
