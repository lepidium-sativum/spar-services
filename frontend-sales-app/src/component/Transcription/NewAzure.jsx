import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import Button from "../Button/Button";
import { eye_hide, eye_show } from "../../utils/Icons";
import { useDispatch, useSelector } from "react-redux";
import { postTranscriptionData } from "../../../store/thunk/commonThunk";
import { unknownWords } from "../../utils/constant";
import config from "../../../config/config";
import _ from "lodash";

const AzureTranscription = forwardRef((props, ref) => {
  const { isUserSpeakingRef } = props;
  const dispatch = useDispatch();
  const [view, setView] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognizerRef = React.useRef(null); // Store recognizer reference
  const transcriptionBufferRef = useRef(""); // Use useRef for transcriptionBuffer

  useEffect(() => {
    console.log("mounting");
    if (props?.isAvatarLoaded && props?.sparData?.token) {
      initializeRecognizer(props?.sparData?.token);
    }
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close();
        recognizerRef.current = null;
      }
    };
  }, [props?.isAvatarLoaded, props?.sparData?.token]);

  const initializeRecognizer = (token) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
      token,
      config.AZURE_SERVICE_REGION
    );
    speechConfig.speechRecognitionLanguage = "en-US";
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;

    speechConfig.setProperty(
      SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
      "200"
    );
    const autoDetectSourceLanguageConfig =
      SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(["en-US"]);
    // var enLanguageConfig = SpeechSDK.SourceLanguageConfig.fromLanguage("en-US");
    // var frLanguageConfig = SpeechSDK.SourceLanguageConfig.fromLanguage(
    //   "fr-FR",
    //   "The Endpoint Id for custom model of fr-FR"
    // );
    // var autoDetectSourceLanguageConfig =
    //   SpeechSDK.AutoDetectSourceLanguageConfig.fromSourceLanguageConfigs([
    //     enLanguageConfig,
    //     frLanguageConfig,
    //   ]);
    // speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "100");
    // speechConfig.setProperty(SpeechSDK.PropertyId.Conversation_Initial_Silence_Timeout, "100");
    // speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "100");

    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig
    );
    // console.log("phrase list: ", props?.sparData?.stt_phrase_list);

    // Create Phrase List and add your custom phrases
    const phraseListGrammar =
      SpeechSDK.PhraseListGrammar.fromRecognizer(recognizer);
    // const phrases = ["Abbu", "Ammi", "Tanzeel"];
    props?.sparData?.stt_phrase_list &&
      _.size(props?.sparData?.stt_phrase_list) > 0 &&
      props?.sparData?.stt_phrase_list.forEach((phrase) => {
        phraseListGrammar.addPhrase(phrase); // Add phrases to the grammar
      });

    // Start continuous recognition
    recognizer.startContinuousRecognitionAsync(
      () => {
        // console.log("Azure recognition started.");
      },
      (err) => {
        console.error("Failed to start recognition: ", err);
      }
    );

    recognizer.recognizing = (s, e) => {
      // Continuously receive intermediate results, but only process when VAD is active
      if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
        if (isUserSpeakingRef.current) {
          // console.log("Interim result:", e.result.text);
          // Optionally, you can accumulate interim results here if needed
        }
      }
    };

    recognizer.recognized = (s, e) => {
      // Process final result if VAD is active
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        if (isUserSpeakingRef.current) {
          transcriptionBufferRef.current += " " + e.result.text;
        } else {
          transcriptionBufferRef.current += " " + e.result.text;
          // console.log(
          //   "VAD/Azure recognized else:",
          //   transcriptionBufferRef.current.trim()
          // );
          // console.log("called inside recognized");
          validateBeforCall();
        }
      }
    };

    recognizer.canceled = (s, e) => {
      // console.error(`Recognition canceled: ${e.errorDetails}`);
    };

    recognizerRef.current = recognizer;
  };

  const handleResult = (transcription) => {
    const currencySymbols = { $: "dollars", "€": "euros" };
    const modifiedTranscription = transcription.replace(
      /([$€])(\d+)/g,
      (match, p1, p2) => `${p2} ${currencySymbols[p1]}`
    );
    setTranscript(modifiedTranscription);
    const transcriptionText = transcription.toLowerCase().trim();
    const lowerCaseUnknownWords = unknownWords.map((word) =>
      word.toLowerCase()
    );
    const isExactMatch = lowerCaseUnknownWords.includes(transcriptionText);

    // console.log("handle result: ", modifiedTranscription);

    if (props?.isAvatarLoaded && !isExactMatch && !props.stopCommunication) {
      dispatch(
        postTranscriptionData({
          transcription: modifiedTranscription,
          sparId: props?.sparData?.spar?.id,
          userId: props?.data?.id,
        })
      );
    }
  };
  const validateBeforCall = () => {
    if (transcriptionBufferRef.current.trim() !== "") {
      // console.log("final Buffer in validate: ", transcriptionBufferRef.current);
      handleResult(transcriptionBufferRef.current.trim());
      transcriptionBufferRef.current = ""; // Clear the buffer
    }
  };
  const handleUserSpeechChange = (isUserSpeaking) => {
    // isProcessingRef.current = isSpeaking;
    isUserSpeakingRef.current = isUserSpeaking; // Ensure isUserSpeakingRef is updated
    if (!isUserSpeaking) {
      // console.log(
      //   "VAD/Azure recognized:",
      //   transcriptionBufferRef.current.trim()
      // );
      // console.log("called inside VAD");
      validateBeforCall();
    }
  };
  // Function to handle avatar speaking state change
  const handleAvatarSpeakingChange = (isAvatarSpeaking) => {
    // console.log("Avatar speaking status in Azure:", isAvatarSpeaking);
    if (!isAvatarSpeaking) {
      // console.log("called inside avatar ref");
      validateBeforCall();
    }
  };
  useImperativeHandle(ref, () => ({
    handleUserSpeechChange,
    handleAvatarSpeakingChange,
  }));
  // const startListening = () => {
  //   if (recognizerRef.current) {
  //     recognizerRef.current.startContinuousRecognitionAsync(
  //       () => {
  //         console.log("Azure Recognition started.");
  //       },
  //       (err) => {
  //         console.error("Failed to start recognition: ", err);
  //       }
  //     );
  //   }
  // };

  // const abortListening = () => {
  //   if (recognizerRef.current) {
  //     recognizerRef.current.stopContinuousRecognitionAsync(
  //       () => {
  //         console.log("Azure Recognition stopped.");
  //       },
  //       (err) => {
  //         console.error("Failed to stop recognition: ", err);
  //       }
  //     );
  //   }
  // };
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        console.log("Un mounting useEffect");
        recognizerRef.current.stopContinuousRecognitionAsync(() => {
          recognizerRef.current.close();
        });
      }
    };
  }, []);

  // const abortListening = () => {
  //   if (recognizerRef.current) {
  //     console.log("Un mounting abortListening");
  //     recognizerRef.current.stopContinuousRecognitionAsync(() => {
  //       recognizerRef.current.close();
  //     });
  //   }
  // };
  // useImperativeHandle(ref, () => ({
  //   abortListening,
  // }));

  const handleView = () => {
    setView(!view);
  };

  return (
    <div
      className={
        view
          ? "text-white bottom-0 flex items-center gap-8 px-6 py-8 mt-2 bg-dark800 opacity-85 rounded-3xl"
          : "text-white bottom-0 absolute"
      }
    >
      <Button
        onClick={handleView}
        className="btn medium btn-outline flex items-center gap-3 cursor-pointer transition-all duration-300 hover:bg-transparent hover:scale-110"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: view ? eye_hide : eye_show,
          }}
        ></span>
        <span className="whitespace-nowrap text-xs font-semibold">
          {view ? "Hide transcription" : "View live transcription"}
        </span>
      </Button>
      {view && (
        <div className="flex flex-col gap-2">
          <span>{transcript}</span>
        </div>
      )}
    </div>
  );
});

AzureTranscription.displayName = "AzureTranscription";

export default AzureTranscription;
