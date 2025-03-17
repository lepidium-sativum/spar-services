const AzureTTS = require("./AzureTTS.js");
const { sendMessageToRoom } = require("../socket/socketHandler.js");

// futrue use for JALI
const no_lips = {
  1: 23,
  2: 24,
  4: 26,
  5: 27,
  6: 28,
  9: 31,
  11: 33,
  12: 34,
  13: 35,
  14: 36,
  17: 39,
  19: 40,
  20: 41,
};
const no_jaw = {
  3: 25,
  7: 29,
  8: 30,
  10: 32,
  15: 37,
  16: 38,
};
const heavy_lips = [3, 7, 8, 10, 15, 16];
const bilabials = [21];
const labiodentals = [18];
const normal_visemes = [1, 2, 4, 5, 6, 9, 11, 12, 13, 14, 17, 19, 20];
const tongue_only = [14, 20];

class TTS {
  // constructor(sessionId, io, socket, provider = "azure") {
  constructor(provider = "azure") {
    this._provider = provider;
    this._counter = 0;
    this._replyIndex = 0;
    this._roomId = 0;
    this._emotion = null;
    this._currentMarks = [];
    this._audioBuffer = Buffer.alloc(0);
    this._synthesizer = null;
    this.init();
  }

  init() {
    if (this._provider === "azure") {
      this._synthesizer = new AzureTTS(this.stream);
    }
  }

  incrementCounter = () => (this._counter += 1);
  getCounter = () => this._counter;
  getCurrentMarks = () => this._currentMarks;
  setCurrentMarks = (marks) => (this._currentMarks = marks);
  getAudioBuffer = () => this._audioBuffer;
  resetAudioBuffer = (buffer) =>
    (this._audioBuffer = buffer ? buffer : Buffer.alloc(0));

  speak = async (
    roomId,
    text,
    language,
    voice,
    emotion = null,
    pitch = 0,
    rate = 0,
    index = 0
  ) => {
    // console.log(`1: ${text}`);
    this._counter = 0;
    this._replyIndex = index;
    this._emotion = emotion;
    this._roomId = roomId;
    await this._synthesizer.speak(
      roomId,
      text,
      language,
      voice,
      emotion,
      pitch,
      rate
    );
    // console.log(`2: ${language}`);
    this.stream(Buffer.alloc(0), [], true);
    return true;
  };

  sendEmotion = async (roomId, emotion) => {
    const event = "server_message";
    const data = {
      type: "response",
      emotion,
    };
    console.log(`emotion: ${emotion}`);

    await sendMessageToRoom(roomId, event, data);
    return true;
  };

  stream = (audioData, visemes, isFlush = false) => {
    // remove wav header if encoding is not raw
    // if (audioData.byteLength > 44) {
    //   audioData = audioData.slice(44)
    // }

    // console.log(`3: ${visemes}`);

    // if we got visemes
    if (visemes.length || isFlush) {
      let counterNow = this.getCounter();
      let chunkIndex = this._replyIndex * 10 + counterNow;
      // each sentence my have multiple chunks
      if (this.getCurrentMarks().length) {
        // send previous buffer
        const marks = this._processVisemes(this.getCurrentMarks());
        const currentAudioData = this.getAudioBuffer();
        this.incrementCounter();

        console.log(`emotion: ${this._emotion}`);
        const event = "server_message";
        const data = {
          type: "response",
          audio: currentAudioData,
          viseme: marks,
          index: chunkIndex,
          emotion: this._emotion,
        };

        // socket.emit(event, data);
        // io.to(roomName).emit(event, data);
        sendMessageToRoom(this._roomId, event, data);
      }
      // set new data
      this.setCurrentMarks(visemes);
      this.resetAudioBuffer(audioData);
    } else {
      // append audio data
      this.appendAudioBuffers(audioData);
    }
  };

  appendAudioBuffers = (buffer) => {
    // Create a new ArrayBuffer with a size that can fit both buffers
    const combinedBuffer = new ArrayBuffer(
      this._audioBuffer.byteLength + buffer.byteLength
    );

    // Create a view to manipulate the combined ArrayBuffer
    const combinedView = new Uint8Array(combinedBuffer);

    // Copy the contents of the first buffer into the combined buffer
    combinedView.set(new Uint8Array(this._audioBuffer), 0);

    // Copy the contents of the second buffer into the combined buffer, after the first buffer
    combinedView.set(new Uint8Array(buffer), this._audioBuffer.byteLength);

    this._audioBuffer = combinedView;
  };

  _processVisemes = (visemesEvents) => {
    try {
      if (!visemesEvents || visemesEvents.length === 0) {
        return [];
      }
      let visemes = [...visemesEvents];
      visemes.sort((a, b) => a.t - b.t);

      // replace 0 with 22 (silence) in our app
      // You can test this to see if it is better looking for you
      // for (let i = 0; i < visemes.length; i++) {
      //   if (visemes[i].v === 0) {
      //     visemes[i].v = 22
      //   }
      // }

      // Some JALI rules
      // 1- mbp always closes the mouth => we need to increase its duration from neighbors
      for (let i = 0; i < visemes.length; i++) {
        if (bilabials.includes(visemes[i].v)) {
          if (i > 0) {
            visemes[i].t -= 30; // msec
          }
          if (i + 1 < visemes.length) {
            visemes[i + 1].t += 30;
          }
        }
      }

      // 1. Duplicated visemes are considered one viseme (e.g., /p/ and /m/ in ‘pop man’ are co-articulated into one long MMM viseme.);
      let tmpVisemes = [visemes[0]];
      for (let i = 1; i < visemes.length; i++) {
        if (visemes[i].v !== visemes[i - 1].v) {
          tmpVisemes.push(visemes[i]);
        }
      }
      visemes = tmpVisemes;

      // 2. Lip-heavy visemes ( UW OW OY w S Z J C ) start early (anticipation) and end late (hysteresis);
      // 3. Lip-heavy visemes replace the lip shape of neighbours that are not labiodentals (f,v) and bilabials (bmp);
      // 4. Lip-heavy visemes are simultaneously articulated with the lip shape of neighbours that are labiodentals and bilabials;

      // for (let i = 0; i < visemes.length - 1; i++) {
      //   if (visemes[i + 1].v === 22) continue;
      //   if (heavy_lips.includes(visemes[i].v) && normal_visemes.includes(visemes[i + 1].v)) {
      //     visemes[i + 1].v = no_lips[visemes[i + 1].v] + '#' + no_jaw[visemes[i].v]
      //   } else if (heavy_lips.includes(visemes[i].v) && (bilabials.includes(visemes[i + 1].v) || labiodentals.includes(visemes[i + 1].v))) {
      //     visemes[i + 1].v = visemes[i].v + '#' + visemes[i + 1].v
      //   }
      // }

      // 5. Tongue-only visemes ( l n t d g k N ) have no influence on the lips: the lips always take the shape of the visemes that surround them;
      // for (let i = 0; i < visemes.length - 1; i++) {
      //   if (visemes[i + 1].v === 22) continue;
      //   // heavy lips already processed before
      //   if (tongue_only.includes(visemes[i].v)) {
      //     visemes[i].v = visemes[i].v+ '#' + visemes[i + 1].v
      //   }
      // }

      // 6. Obstruents and Nasals ( D T d t g k f v p b m n N ) with no similar neighbours, that are less than one frame in length, have no effect on jaw (excluding Sibilants);
      // 7. Obstruents and Nasals of length greater than one frame, narrow the jaw as per their viseme rig definition;
      // 8. Targets for co-articulation look into the word for their shape, always anticipating, except that the last phoneme in a word looks back (e.g., both /d/ and /k/ in ‘duke’ take their lip-shape from the ‘u’.);
      // 9. Articulate the viseme (its tongue, jaw and lips) without coarticulation effects, if none of the above rules affect it.

      // extra rule: do not articulate any last viseme in a word (excpet 0) more than 50 msec
      // as we have 100 msec blend time to neutral
      for (let i = 0; i < visemes.length - 1; i++) {
        if (
          visemes[i + 1].t - visemes[i].t > 150 &&
          (visemes[i + 1].v === 22 || visemes[i + 1].v === 0) &&
          visemes[i].v !== 22 &&
          visemes[i].v !== 0 &&
          visemes[i].v
        ) {
          visemes[i + 1].t === visemes[i].t + 150;
        }
      }

      // Shift all visemes 100 msec back to blend in for a proper blendtime
      for (let i = 0; i < visemes.length; i++) {
        visemes[i].t = Math.max(0, visemes[i].t - 150);
      }

      return JSON.stringify(visemes);
    } catch (e) {
      console.log(e);
    }
  };

  close = () => {
    this._synthesizer.close();
  };
}

module.exports = TTS;
