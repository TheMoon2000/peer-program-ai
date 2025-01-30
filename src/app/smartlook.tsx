"use client";

import { useEffect } from "react";
import Smartlook from "smartlook-client";

export default function SmartlookInit() {
  useEffect(() => {
    Smartlook.init("9ad65756270eba0e96a02a168e9870247f896c94");
  }, []);

  return null;
}
