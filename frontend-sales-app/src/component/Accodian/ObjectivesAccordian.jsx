import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import assets from "../../constants/assets";
import ObjectiveAccordianDetail from "./ObjectiveAccordianDetail";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";

const ObjectivesAccordian = ({ item, onPlayClick, onScrollToTop }) => {
  const [expanded, setExpanded] = useState(null);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  // console.log("item: ", item);
  const customSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), "em", "span", "strong", "a"],
    attributes: {
      ...defaultSchema.attributes,
      em: ["class"],
      span: ["class", "style"],
      strong: ["class"],
      a: ["href", "title", "class"],
    },
  };
  const formatFeedbackText = (text) => {
    if (!text) {
      return "N/A";
    }

    // Replace <bold> tags with markdown bold syntax
    let formattedText = text.replace(/<bold>(.*?)<\/bold>/g, "**$1**");

    // Normalize line breaks: replace multiple consecutive newlines with a single newline
    formattedText = formattedText.replace(/\n\n+/g, "\n");

    // Replace dots (•) with hyphens (-) for list items
    formattedText = formattedText.replace(/(?:^|\n)\s*•/g, "\n-");

    // Remove hyphens before headings (e.g., **Positive Aspects:**)
    formattedText = formattedText.replace(
      /(^|\n)-\s*(\*\*[^*]+?\*\*:)/g,
      "$1$2"
    );

    // Ensure proper spacing for markdown parsing
    formattedText = formattedText.replace(/(^|\n)(\*\*[^*]+?\*\*:)/g, "$1\n$2");

    return formattedText;
  };

  return (
    <div
      className="flex flex-col bg-[#28282A] rounded-[32px] w-full h-auto p-6"
      style={{
        borderRadius: "24px",
        overflow: "hidden",
        borderImageSource: "#28282A",
        borderImageSlice: 1,
        marginBottom: "8px",
      }}
    >
      <div>
        <span className="font-montserrat text-[20px] font-bold leading-[24.38px] text-white">
          Learning objectives
        </span>
      </div>

      {item &&
        item.map((objective, index) => (
          <Accordion
            expanded={expanded === `panel${index}`} // Unique identifier for each panel
            onChange={handleChange(`panel${index}`)} // Handle toggle for each panel
            sx={{
              marginTop: "24px",
              backgroundColor: "#28282A",
              alignItems: "center",
              border: "1px solid #ffffff33",
              borderRadius: "24px",
              padding: "6px",
            }}
            key={index}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    color: "#FFFFFF",
                  }}
                />
              }
              aria-controls="panel1bh-content"
              id="panel1bh-header"
              sx={{
                height: "106px",
                padding: "0px",
                margin: "0px",
              }}
            >
              <div className="flex flex-wrap w-full h-auto justify-between items-center rounded-2xl p-6 ">
                <div className="flex flex-row w-full h-[52px] justify-center items-center">
                  <img
                    src={
                      objective.score > 5
                        ? assets.tickCircle
                        : assets.crossCircle
                    }
                    alt=""
                    className="relative object-cover w-[20px] h-[20px] rounded-full"
                  />
                  <div className="flex flex-col w-full h-[52px] justify-start items-start">
                    <span className="mt-2 ml-2 font-montserrat font-bold leading-[21.94px] text-[18px] text-white">
                      {objective.title}
                    </span>
                    <span
                      className={`ml-2 mt-2 text-[16px] font-inter font-normal leading-[16.4px] text-[${
                        objective.score > 5 ? "#71E684" : "#FC5858"
                      }]`}
                    >
                      Score: {objective.score}
                    </span>
                  </div>
                </div>

                <div className="mt-6 font-inter font-normal leading-[22.4px] text-[16px] text-white">
                  {objective.summary}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                borderRadius: "16px",
                flexDirection: "column",
                width: "100%",
                marginTop: "0px",
              }}
            >
              <div className="flex flex-col w-full">
                {objective &&
                  objective.evidence_and_analysis.map((evidence, index) => (
                    <div key={index}>
                      <ObjectiveAccordianDetail
                        evidence={evidence}
                        onPlayClick={onPlayClick} // Pass the callback
                        onScrollToTop={onScrollToTop} // Pass scroll-to-top function as a prop
                      />
                    </div>
                  ))}
              </div>
            </AccordionDetails>
            <div className="flex flex-col p-6 w-full">
              <div className="font-inter font-bold leading-[22.4px] text-[16px] text-white">
                Improvement Actions
              </div>
              <div className="mt-4 font-inter font-normal leading-[22.4px] text-[16px] text-white">
                {/* {objective?.improvement_actions} */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
                  components={{
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal list-inside ml-4"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-normal pl-2" {...props} />
                    ),
                  }}
                >
                  {formatFeedbackText(objective?.improvement_actions)}
                </ReactMarkdown>
              </div>
            </div>
          </Accordion>
        ))}
      <div className="mt-2"></div>
    </div>
  );
};
export default ObjectivesAccordian;
