import { Alert, Slide } from '@mui/material';
import React, { useState, useEffect } from 'react';

function SystemMessage({ messages }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [currentIndex, messages.length]);

    const currentMessage = messages[currentIndex] + currentIndex;
    return (
        <div className="relative flex justify-center items-center ">
            <Slide direction="down" in={true} className="fixed z-100">
                <Alert icon={false} severity="success" className="p-1">
                    {currentMessage}
                </Alert>
            </Slide>
        </div>
    );
}
export default SystemMessage;