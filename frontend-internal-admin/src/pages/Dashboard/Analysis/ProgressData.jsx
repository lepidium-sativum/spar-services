import React from "react";
import ProgressDataItems from "./ProgressDataItems";

const ProgressData = ({ audioAnalysisData, textAnalysisData }) => {
  return (
    <div className="p-8">
      {
        <ProgressDataItems
          title={"Clarity"}
          decs={"How comprehensible your speech is"}
          performance={textAnalysisData?.clarity_energy?.clarity}
        />
      }
      <ProgressDataItems
        title={"Pace"}
        decs={"How optimal your speaking tempo is"}
        performance={"75"}
      />
      <ProgressDataItems
        title={"Energy"}
        decs={"How confident you sound"}
        performance={textAnalysisData?.clarity_energy?.energy}
      />
      <ProgressDataItems
        title={"Sentence length"}
        decs={"How straightforward your sentences are"}
        performance={audioAnalysisData?.average_sentence_length?.user}
      />
    </div>
  );
};

export default ProgressData;
