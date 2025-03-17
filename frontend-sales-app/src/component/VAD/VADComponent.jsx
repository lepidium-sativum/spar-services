import { useEffect, useRef, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";

const VADComponent = ({ onSpeechChange }) => {
  // const [isSpeaking, setIsSpeaking] = useState(false); // Manage the speaking state here
  const lastSpeakerState = useRef(null); // Track the last speaker state to prevent redundant state updates

  const vad = useMicVAD({
    startOnLoad: true,
    workletURL: "/vad.worklet.bundle.min.js", // Path to the worklet
    onnxModelURL: "/silero_vad.onnx", // Path to the ONNX model
    wasmRoot: "/onnxruntime/", // Path to the WASM files
    params: {
      aggressiveness: 3, // Lower aggressiveness means less sensitive to noise
    },
    onSpeechStart: () => {
      if (lastSpeakerState.current !== true) {
        lastSpeakerState.current = true;
        onSpeechChange(true); // Notify parent about speech start
      }
    },
    onSpeechEnd: () => {
      if (lastSpeakerState.current !== false) {
        lastSpeakerState.current = false;
        onSpeechChange(false); // Notify parent about speech end
      }
    },
  });

  // useEffect(() => {
  //   if (vad) {
  //     // console.log("VAD initialized");
  //   }
  // }, [vad]);

  return null; // No UI element required; just a background process
};

export default VADComponent;
