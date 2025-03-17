import React from "react";
import { feedBackGradeIcon, feedBackStatus } from "../../utils/constant";
import { checkGradeLevelTextColor } from "../../utils/constant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";

const FeedbackItems = ({ title, description, number }) => {
  // console.log("number: ", number);

  // const formatFeedbackText = (text) => {
  //   if (!text) {
  //     return "N/A";
  //   }
  //   let formattedText = text.replace(/<bold>(.*?)<\/bold>/g, "**$1**");
  //   // Replace bullet characters with Markdown list syntax
  //   // formattedText = formattedText.replace(/^\s*•\s+/gm, "- ");
  //   // // Ensure there's a blank line before lists
  //   // formattedText = formattedText.replace(/([^\n])(\n- )/g, "$1\n\n- ");
  //   return formattedText;
  // };
  const formatFeedbackText = (text) => {
    if (!text) {
      return "N/A";
    }

    // Replace <bold> tags with markdown bold syntax
    let formattedText = text.replace(/<bold>(.*?)<\/bold>/g, "**$1**");

    // Replace dots (•) with hyphens (-) when they appear after a newline or at the start of the text
    formattedText = formattedText.replace(/(?:^|\n)\s*•/g, "\n-");

    // Normalize line breaks: replace double newlines with single newlines
    formattedText = formattedText.replace(/\n\n+/g, "\n");

    // Ensure lists have a blank line before starting (markdown rule)
    // formattedText = formattedText.replace(/([^\n])(\n- )/g, "$1\n\n- ");

    return formattedText;
  };

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
  const formattedDescription = formatFeedbackText(description);
  return (
    <div className="knowledge-list bg-[#4B4B4B] gap-6 mb-4 border border-[color:#464646] shadow-[0px_2.76726px_2.21381px_0px_rgba(0,0,0,0.02),0px_6.6501px_5.32008px_0px_rgba(0,0,0,0.03),0px_12.52155px_10.01724px_0px_rgba(0,0,0,0.04),0px_10px_60px_0px_rgba(0,0,0,0.35)] rounded-2xl border-solid">
      <div className="flex justify-between">
        <div className="w-[92%] p-6">
          <h3 className={"text-base font-bold text-white mb-3"}>{title}</h3>
          <span className="text-white text-base font-light font-montserrat">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
              components={{
                strong: ({ node, ...props }) => (
                  <strong
                    className={`font-bold ${checkGradeLevelTextColor(number)}`}
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside ml-4" {...props} /> // Adds bullets with proper indentation
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside ml-4" {...props} /> // Adds numbers with proper indentation
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-normal pl-2" {...props} /> // Padding for list item text to keep it in line
                ),
              }}
            >
              {formattedDescription}
            </ReactMarkdown>
          </span>
        </div>
        <div className="w-[8%] border-l-[#1A1A1A] border-l-2 border-solid p-6 flex items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-2">
            {number === undefined ? (
              <h2
                className={`text-[16px] font-bold font-montserrat text-white`}
              >
                N/A
              </h2>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={feedBackGradeIcon(number)}
                  // className="ml-[8px]"
                  alt=""
                />
                <span className="text-white text-[10px] mt-[15px]">
                  {feedBackStatus(number)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItems;
