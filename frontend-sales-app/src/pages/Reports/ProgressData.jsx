// import React from "react";
import ProgressDataItems from "./ProgressDataItems";
import PropTypes from "prop-types";

const ProgressData = ({ textAnalysisData, loading, audioAnalysisData }) => {
  return (
    <div className="p-8">
      <ProgressDataItems
        loading={loading}
        title={"Clarity"}
        decs={"How comprehensible your speech is"}
        performance={textAnalysisData?.clarity_energy?.clarity}
        isHardcoded={false} // Normal data
      />
      <ProgressDataItems
        loading={loading}
        title={"Pace"}
        decs={"How optimal your speaking tempo is"}
        performance={audioAnalysisData?.pace?.user}
        isHardcoded={false} // Hardcoded
      />
      <ProgressDataItems
        loading={loading}
        title={"Energy"}
        decs={"How confident you sound"}
        performance={textAnalysisData?.clarity_energy?.energy}
        isHardcoded={false} // Normal data
      />
      <ProgressDataItems
        loading={loading}
        title={"Sentence length"}
        decs={"How straightforward your sentences are"}
        // performance={audioAnalysisData?.average_sentence_length?.user}
        performance={audioAnalysisData?.average_sentence_length?.user}
        isHardcoded={false} // Hardcoded
      />
    </div>
  );
};
// ProgressData.propTypes = {
//   // audioAnalysisData: PropTypes.object.isRequired,
//   textAnalysisData: PropTypes.object.isRequired,
// };
export default ProgressData;
