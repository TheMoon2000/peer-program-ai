"use client";

import { useEffect } from "react"
import { DyteProvider, useDyteClient, useDyteMeeting } from '@dytesdk/react-web-core';
import { DyteMeeting } from '@dytesdk/react-ui-kit';

export default function TestPage() {
    const [meeting, initMeeting] = useDyteClient()

    useEffect(() => {
        initMeeting({
            authToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6ImI1Y2Q5MjY2LWRkZWQtNDI4OC05ZDE5LTE3MWRkNzg0YmIxOCIsIm1lZXRpbmdJZCI6ImJiYjBkNTBiLWVlOWQtNGI4MC1iZTUyLTQwZWZhNWM4YjAyZSIsInBhcnRpY2lwYW50SWQiOiJhYWExYzIzOS02MDZjLTQwZmMtYTg2OS05OTIzNjAxMzI0N2UiLCJwcmVzZXRJZCI6IjQwMDg3YzIzLWJjYTAtNGIxYS1iYzc2LWNmODY1MzAwY2YxMyIsImlhdCI6MTcxMzEyNjcxOCwiZXhwIjoxNzIxNzY2NzE4fQ.qnbWCmg331QJgA5lqASOeaZcYdwYbJmtzi4FWwZhD5TqW2-vWiYCFw-I9CWOsOrMMWcYYc_wkzTAl6t0M6MH3ubRB3ypcUFcjqCIehOS-U_SQCkmGbUIb0AdJeLR4-2F3T_qjQpXF2syYt6Ol5szlF1WFxXW3t0ktzAn9A6jSdi_mHogdwk7l8Kub7HJGpwPKpLdDDrrPGD8ZlaO1uglKOL_f8sJ2RzEgwBwOsLsilrLDHs7WsAyLwV-j64LBMSqc1gsRCq5dnYCfazhk9mrBBj4E5aAckbLqLcOVJjjBt3u2kjODsnsokGHbhEi78g9lNqk_GXrL3xHJWBDCtgOxA",
            defaults: {
                audio: false,
                video: true
            }
        }).then(m => {
            console.log('meeting', meeting)
        })//.then((m) => m?.joinRoom())
    }, [])

    return <DyteProvider value={meeting}>
        <View />
        {/* <DyteMeeting mode="fill" meeting={meeting} showSetupScreen={false}/> */}
    </DyteProvider>
}

function View() {
    const { meeting } = useDyteMeeting();
    return <div style={{height: "100vh", width: "100vw"}}>
        <DyteMeeting mode="fill" meeting={meeting} style={{height: "100%"}} />
    </div>
}