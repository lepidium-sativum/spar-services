const azursdk = require("microsoft-cognitiveservices-speech-sdk");
// import {
//   azureKey, azureRegion
// } from '../../config.js';

emotionsMapping = {
  neutral: "calm",
  satisfied: "friendly",
  happy: "cheerful",
  sad: "sad",
  concerned: "serious",
  angry: "angry",
  frustrated: "disgruntled",
};

class AzureTTS {
  constructor(streamCallback) {
    this._events = [];
    this._allEvents = [];
    this._speechConfig = azursdk.SpeechConfig.fromSubscription(
      process.env.AZURE_KEY,
      process.env.AZURE_REGION
    ); // fromSubscription(azureKey, azureRegion)
    this._speechConfig.speechSynthesisOutputFormat =
      azursdk.SpeechSynthesisOutputFormat.Raw44100Hz16BitMonoPcm;
    this._synthesizer = new azursdk.SpeechSynthesizer(this._speechConfig);
    this._streamCallback = streamCallback;

    this._synthesizer.visemeReceived = (s, e) => {
      const time = e.audioOffset / 10000;
      if (time > 0) {
        this.updateEvents({ t: e.audioOffset / 10000, v: e.visemeId });
      }
    };

    this._synthesizer.synthesizing = (s, e) => {
      if (e.result.reason === azursdk.ResultReason.SynthesizingAudio) {
        this._streamCallback(e.result.audioData, this.getEvents());
      }
    };
  }

  updateEvents = (v) => {
    this._events.push(v);
    this._allEvents.push(v);
  };

  getEvents = () => {
    let e = [...this._events];
    this._events = [];
    return e;
  };

  speak = async (
    roomId,
    text,
    language,
    voice,
    emotion = null,
    pitch = 0,
    rate = 0
  ) => {
    this._events = [];
    this._allEvents = [];
    if (!this._synthesizer) {
      console.warn("Not found a synthesizer");
      return;
    }

    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${language}">
    <voice name="${voice}"> 
    <mstts:viseme type="FacialExpression"/>`;
    if (emotion) {
      ssml += `
        <mstts:express-as style="${emotionsMapping[emotion]}" styledegree="1">`;
    }
    ssml += `
      <prosody pitch="${pitch}%" rate="${rate}%">
      ${text}
      </prosody>`;
    if (emotion) {
      ssml += `
        </mstts:express-as>`;
    }
    ssml += `
      </voice>
      </speak>`;

    // encode utf-8 to pronounce escaped characters
    ssml = Buffer.from(ssml, "utf-8").toString();
    console.log(ssml);
    return new Promise((resolve, reject) => {
      // speakTextAsync text
      this._synthesizer.speakSsmlAsync(
        ssml,
        function (result) {
          if (
            result.reason === azursdk.ResultReason.SynthesizingAudioCompleted
          ) {
            console.log(" synthesis finished.");
          } else {
            console.log(" Speech synthesis canceled, " + result.errorDetails);
          }
          resolve(true);
        },
        function (err) {
          console.log(" Speech synthesis error, ");
          console.log(err);
          reject(err);
        }
      );
    });
  };

  close = () => {
    this._synthesizer.close();
    this._synthesizer = null;
  };
}

module.exports = AzureTTS;
