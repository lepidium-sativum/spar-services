import assets from "../constants/assets";

export const sparDurationConversion = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const integerSeconds = Math.floor(seconds);
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = integerSeconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}m`;
};

export const moduleCompletedModalType = {
  success: "It seems to be a great success for you...",
  warning: "...but you're still having trouble the situation.",
  error: "Don’t worry, it’s by making mistakes that we learn.",
  desc: "Discover your strengths and weaknesses, and check whether the key objectives have been achieved.",
  btntext: "See results",
};
export const moduleCompletedModalType2 = {
  finished: {
    title: "Was the customer satisfied?",
    message:
      "You ended the Spar prematurely.<br> We hope everything went well. <br> Click below to get the feedback for your session.",
  },
  success: {
    title: "Congratulations 🎉",
    message:
      "You achieved the objectives of this Spar.<br> Click below to get the feedback for your session.",
  },
  error: {
    title: "Don’t worry, it’s by making mistakes that we learn.",
    message:
      "The good news is that we surely have many useful Feedback.<br>Follow this link to learn more about what you can improve.",
  },
  warning: {
    title: "...but you had some trouble",
    message:
      "You did well but you didn’t meet all the objectives.<br>Click below to see what you missed and learn more about <br> your strengths and areas of improvements.",
  },
  btntext: "See results",
};

export const mainObjectives = [
  {
    title: "Always be respectful and polite",
    check: true,
    icon: `<svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.886719 15.6464C0.886719 19.5712 2.44586 23.3353 5.22116 26.1106C7.99645 28.8859 11.7606 30.445 15.6854 30.445C19.6103 30.445 23.3744 28.8859 26.1497 26.1106C28.925 23.3353 30.4841 19.5712 30.4841 15.6464C30.4841 11.7215 28.925 7.95739 26.1497 5.18209C23.3744 2.4068 19.6103 0.847656 15.6854 0.847656C11.7606 0.847656 7.99645 2.4068 5.22116 5.18209C2.44586 7.95739 0.886719 11.7215 0.886719 15.6464ZM23.3807 12.9826C23.5945 12.6976 23.6982 12.3451 23.673 11.9898C23.6477 11.6344 23.4952 11.3001 23.2433 11.0482C22.9914 10.7963 22.6571 10.6438 22.3017 10.6185C21.9464 10.5933 21.5939 10.697 21.3089 10.9108L14.2055 18.0141L10.8018 14.6104C10.5169 14.3967 10.1643 14.2929 9.80902 14.3182C9.45369 14.3434 9.11939 14.496 8.8675 14.7479C8.61561 14.9998 8.46303 15.3341 8.43778 15.6894C8.41252 16.0448 8.51629 16.3973 8.73003 16.6823L13.1696 21.1219C13.7616 21.7138 14.6495 21.7138 15.2415 21.1219L23.3807 12.9826Z" fill="#95EBA3"/>
    </svg>`,
  },
  {
    title: "Do not accept to replace the bag",
    check: true,
    icon: `<svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.886719 15.6464C0.886719 19.5712 2.44586 23.3353 5.22116 26.1106C7.99645 28.8859 11.7606 30.445 15.6854 30.445C19.6103 30.445 23.3744 28.8859 26.1497 26.1106C28.925 23.3353 30.4841 19.5712 30.4841 15.6464C30.4841 11.7215 28.925 7.95739 26.1497 5.18209C23.3744 2.4068 19.6103 0.847656 15.6854 0.847656C11.7606 0.847656 7.99645 2.4068 5.22116 5.18209C2.44586 7.95739 0.886719 11.7215 0.886719 15.6464ZM23.3807 12.9826C23.5945 12.6976 23.6982 12.3451 23.673 11.9898C23.6477 11.6344 23.4952 11.3001 23.2433 11.0482C22.9914 10.7963 22.6571 10.6438 22.3017 10.6185C21.9464 10.5933 21.5939 10.697 21.3089 10.9108L14.2055 18.0141L10.8018 14.6104C10.5169 14.3967 10.1643 14.2929 9.80902 14.3182C9.45369 14.3434 9.11939 14.496 8.8675 14.7479C8.61561 14.9998 8.46303 15.3341 8.43778 15.6894C8.41252 16.0448 8.51629 16.3973 8.73003 16.6823L13.1696 21.1219C13.7616 21.7138 14.6495 21.7138 15.2415 21.1219L23.3807 12.9826Z" fill="#95EBA3"/>
    </svg>`,
  },
  {
    title: "Make sure Louisa understands why",
    check: false,
    icon: `<svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.886719 14.8346C0.886719 18.7594 2.44586 22.5235 5.22116 25.2988C7.99645 28.0741 11.7606 29.6333 15.6854 29.6333C19.6103 29.6333 23.3744 28.0741 26.1497 25.2988C28.925 22.5235 30.4841 18.7594 30.4841 14.8346C30.4841 10.9097 28.925 7.14562 26.1497 4.37033C23.3744 1.59503 19.6103 0.0358887 15.6854 0.0358887C11.7606 0.0358887 7.99645 1.59503 5.22116 4.37033C2.44586 7.14562 0.886719 10.9097 0.886719 14.8346ZM23.3807 12.1708C23.5945 11.8858 23.6982 11.5333 23.673 11.178C23.6477 10.8227 23.4952 10.4884 23.2433 10.2365C22.9914 9.98458 22.6571 9.832 22.3017 9.80675C21.9464 9.7815 21.5939 9.88527 21.3089 10.099L14.2055 17.2024L10.8018 13.7987C10.5169 13.5849 10.1643 13.4812 9.80902 13.5064C9.45369 13.5317 9.11939 13.6843 8.8675 13.9361C8.61561 14.188 8.46303 14.5223 8.43778 14.8777C8.41252 15.233 8.51629 15.5855 8.73003 15.8705L13.1696 20.3101C13.7616 20.902 14.6495 20.902 15.2415 20.3101L23.3807 12.1708Z" fill="#5C5F62"/>
    </svg>
    `,
  },
];

export const mainObjectives2 = [
  { title: "You are a salesperson in a Sephora shop" },
  { title: "You have to provide valuable advice to the client" },
];

export const jsonParseCoversion = (data) => {
  return JSON.parse(data);
};
// export const textAnalysisParseCoversion = (data) => {
//   const textParseAnalysis = JSON.parse(data);
//   return JSON.parse(textParseAnalysis);
// };
export const level = {
  orangeStart: 110,
  orangeEnd: 120,
  greenStart: 120,
  greenEnd: 160,
};

export const unknownWords = [
  "play",
  "play.",
  "BJP",
  "BJP.",
  "2",
  "2.",
  "replay",
  "replay.",
  "two bhk flat, 1000.",
  "two bhk flat, 1000",
];
export const currencySymbols = { $: "dollars", "€": "euros" };

export const configSatisfactionChart = {
  series: [
    {
      data: [],
      name: "Desktops",
    },
  ],
  options: {
    fill: {
      type: "gradient",
      gradient: {
        type: "horizontal",
        // colorStops: [
        //   {
        //     color: "#FF0000",
        //     offset: 0,
        //   },
        //   {
        //     color: "#FFD646",
        //     offset: 70,
        //   },
        //   {
        //     color: "#95EBA3",
        //     offset: 90,
        //   },
        // ],
      },
    },
    chart: {
      type: "line",
      zoom: {
        enabled: false,
      },
      height: 350,
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      categories: ["1", "2", "3", "4"],
    },
    yaxis: {
      max: 100,
      min: 0,
      labels: {
        show: false,
      },
      tickAmount: 3,
    },
    stroke: {
      curve: "straight",
      width: 10,
    },
    dataLabels: {
      enabled: false,
    },
  },
};

export const checkGradeLevelTextColor = (grade) => {
  if (grade >= 75) {
    return "text-[#95EBA3]";
  } else if (grade >= 50 && grade < 75) {
    return "text-[#FFD337]";
  } else {
    return "text-[#EBAF95]";
  }
};

export const feedBackGradeIcon = (grade) => {
  if (grade >= 75) {
    return assets.SuccessIcon;
  } else if (grade >= 50 && grade < 75) {
    return assets.WarningIcon;
  } else {
    return assets.errorIcon;
  }
};

export const feedBackStatus = (grade) => {
  if (grade >= 75) {
    return "Success";
  } else if (grade >= 50 && grade < 75) {
    return "Warning";
  } else {
    return "Failed";
  }
};
export const calculateStar = (val) => {
  // console.log("value: ", val);
  if (val === null || val === undefined || val < 0) {
    return 0;
  } else if (val >= 25 && val < 50) {
    return 1;
  } else if (val >= 50 && val < 75) {
    return 2;
  } else if (val >= 75 && val <= 100) {
    return 3;
  } else {
    return 0;
  }
};
export const checkGradeLevelText = (grade) => {
  if (grade >= 75 && grade <= 100) {
    return "Passed";
  } else if (grade >= 50 && grade < 75) {
    return "Passed";
  } else if (grade >= 25 && grade < 50) {
    return "Warning";
  }
  // else if (grade === null || grade === undefined || grade < 0) {
  //   return null;
  // }
  else {
    return "Failed";
  }
};

export const checkGradeColor = (grade) => {
  if (grade >= 75 && grade <= 100) {
    return "bg-[#71E684]";
  } else if (grade >= 50 && grade < 75) {
    return "bg-[#71E684]";
  } else if (grade >= 25 && grade < 50) {
    return "bg-[#EBB495]";
  } else {
    return "bg-[#FC5858]";
  }
};
export const mergeTimelines = (videoData, timeLineConversation) => {
  // Extract user and avatar timelines from the provided data
  const userTimeline = JSON.parse(videoData?.spar?.user_audio_timeline);
  // const userTimeline = videoData?.spar?.user_audio_timeline;

  const avatarTimeline = JSON.parse(videoData?.spar?.avatar_audio_timeline);
  // const avatarTimeline = videoData?.spar?.avatar_audio_timeline;

  // Iterate over the actions in timeLineConversation to insert user and avatar timelines
  timeLineConversation.forEach((conversation) => {
    if (conversation.mockData) {
      conversation.mockData.forEach((item, index) => {
        if (item.id === "0") {
          // Insert user timeline data
          userTimeline.forEach((userItem, userIndex) => {
            item.actions.push({
              id: `action${userIndex}`,
              start: userItem.start,
              end: userItem.end,
              effectId: "effect0",
            });
          });
        } else if (item.id === "1") {
          // Insert avatar timeline data
          avatarTimeline.forEach((avatarItem, avatarIndex) => {
            item.actions.push({
              id: `action1${avatarIndex}`,
              start: avatarItem.start,
              end: avatarItem.end,
              effectId: "effect1",
            });
          });
        }
      });
    }
  });
  // console.log("timeLineConversation: ", timeLineConversation);
  return timeLineConversation;
};

export function calculateScaleSize(targetDuration) {
  var referenceDuration = 1.55; // duration of the reference video in minutes
  var referenceScaleSize = 16;
  // Calculate the scale size for a target video duration based on the scale size for a reference video duration
  var targetScaleSize = parseInt(
    (targetDuration * referenceScaleSize) / referenceDuration
  );
  return targetScaleSize;
}

export const createConfigSatisfactionChartSeries = (textAnalysisData) => {
  if (textAnalysisData) {
    const satisfactionValues =
      textAnalysisData?.avatar_assistant_satisfaction_grades &&
      Object.values(textAnalysisData?.avatar_assistant_satisfaction_grades);
    return [
      {
        data: satisfactionValues,
        name: "Desktops",
      },
    ];
  }
};
export const createConfigSatisfactionChartOption = (textAnalysisData) => {
  if (textAnalysisData) {
    const satisfactionValues =
      textAnalysisData?.avatar_assistant_satisfaction_grades &&
      Object.values(textAnalysisData?.avatar_assistant_satisfaction_grades);
    let colorStops = [];
    satisfactionValues?.forEach((value, index) => {
      let color;
      if (value > 60) {
        color = "#95EBA3"; // Green
      } else if (value < 50) {
        color = "#FF0000"; // Red
      } else {
        color = "#FFD646"; // Yellow
      }

      colorStops.push({
        color: color,
        offset: (index / (satisfactionValues.length - 1)) * 100, // Ensuring offset is a percentage
      });
    });

    configSatisfactionChart.options.fill.gradient.colorStops = colorStops;

    return configSatisfactionChart.options;
  } else {
    return null;
  }
};
