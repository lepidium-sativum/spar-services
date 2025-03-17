import React, { useState, useEffect } from "react";
import StarRating from "../Star/StarRating";
import Badge from "../Badges/Badge";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import UnReadBadge from "../Badges/UnReadBadge";
import assets from "../../constants/assets";
import StripSparCard from "./StripSparCard";
import Timeline from "../TimerPreview/TimeLine";
import { useNavigate } from "react-router-dom";
import {
  getAnalysisData,
  postAnalysisData,
} from "../../../store/thunk/statesThunk";
import { useDispatch } from "react-redux";
import { calculateStar, level } from "../../utils/constant";

const StripReportCard = ({ item, spars, value }) => {
  // console.log("item: ", item);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sortedSpars = spars && [...spars].sort((a, b) => b.id - a.id);

  const [expanded, setExpanded] = React.useState(false);
  // const [analysisId, setAnalysisId] = useState("");
  // const [sparId, setSparId] = useState("");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const avatarUrl = item?.module?.aiavatar?.metahuman?.url;

  const handleClick = (id, sparState) => {
    // console.log("check id and avatar: ", id, avatarUrl);
    if (sparState === "finished" || sparState === "failed") {
      dispatch(getAnalysisData(id))
        .then((response) => {
          // console.log("getAnalysis response: ", response?.payload);
          if (response?.payload?.status === 200) {
            const state = response.payload.data.state;
            console.log("getAnalysis state: ", state);
            if (state === "finished") {
              navigate("/newreport", {
                state: {
                  additionalData: {
                    level: item?.module?.level,
                    sparId: id,
                    url: avatarUrl,
                  },
                },
              });
            } else if (state === "failed") {
              dispatch(postAnalysisData({ id }))
                .then((res) => {
                  // console.log("postAnalysisData result:", res);
                  if (res?.payload?.status === 200) {
                    navigate("/newreport", {
                      state: {
                        additionalData: {
                          sparId: id,
                          url: avatarUrl,
                          level: item?.module?.level,
                        },
                      },
                    });
                  }
                })
                .catch((error) => {
                  console.log("Error in postAnalysisData:", error);
                });
              // alert("Analysis is not available for In Progress state.");
              console.error("Analysis failed in getAnalysis");
            } else if (state === "in_progress") {
              dispatch(postAnalysisData({ id }))
                .then((res) => {
                  // console.log("postAnalysisData result:", res);
                  if (res?.payload?.status === 200) {
                    navigate("/newreport", {
                      state: {
                        additionalData: {
                          sparId: id,
                          url: avatarUrl,
                          level: item?.module?.level,
                        },
                      },
                    });
                  }
                })
                .catch((error) => {
                  console.log("Error in postAnalysisData:", error);
                });
            }
          } else if (response?.payload === 404) {
            dispatch(postAnalysisData({ id }))
              .then((res) => {
                // console.log("postAnalysisData result:", res);
                if (res?.payload?.status === 200) {
                  navigate("/newreport", {
                    state: {
                      additionalData: {
                        sparId: id,
                        url: avatarUrl,
                        level: item?.module?.level,
                      },
                    },
                  });
                }
              })
              .catch((error) => {
                console.log("Error in postAnalysisData:", error);
              });
            // alert("Analysis is not available for In Progress state.");
          }
        })
        .catch((error) => {
          console.error("Error in pollAnalysisStatus:", error);
        });
    } else {
      alert("Analysis is not available for Not completed state.");
    }
  };
  // console.log("my reports spars: ", spars);

  const timelineItems =
    spars &&
    sortedSpars.map((spar, index) => ({
      content: (
        <StripSparCard
          key={index}
          item={spar}
          onClick={() => handleClick(spar?.id, spar?.state)}
          value={value}
          level={item?.module?.level}
        />
      ),
    }));
  return (
    <div
      style={{
        borderRadius: "24px",
        overflow: "hidden",
        borderImageSource:
          "linear-gradient(335.03deg, #464646 0%, #1A1A1A 100%)",
        borderImageSlice: 1,
        marginBottom: "8px",
      }}
    >
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
        sx={{
          backgroundColor: "#313732",
          padding: "24px",
          alignItems: "center",
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon
              sx={{
                color: "#FFFFFF", // Change the color here
              }}
            />
          }
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{
            backgroundColor: "#464646",
            borderRadius: "16px",
            height: "106px",
            padding: "0px",
          }}
        >
          <div className="flex flex-wrap w-full h-[106px] rounded-2xl justify-between items-center bg-[#464646]">
            <div className="flex flex-col justify-start items-start relative w-[135px] h-full overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center rounded-l-2xl"
                style={{
                  backgroundImage: `url(${item?.module?.aiavatar?.bgscene?.background_image?.url})`,
                }}
              />
              <img
                loading="lazy"
                src={item?.module?.aiavatar?.metahuman?.url}
                className="relative z-10 object-cover w-full h-full rounded-l-2xl"
              />
              <div className="absolute bottom-1.5 ml-2 z-20">
                <Badge text={item?.module?.level} />
              </div>
            </div>

            <div className="flex-1 ml-6">
              <div className="text-[16px] font-montserrat font-bold leading-[19.5px] text-white mb-1">
                Module {item?.module?.id}
              </div>
              <div className="text-[18px] text-nowrap w-[281px] h-[22px] font-montserrat font-normal leading-normal text-white mb-1">
                {item?.module?.name}
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="mt-0">
                {/* <UnReadBadge number={2} reports={"reports"} /> */}
              </div>
              <div className="w-[100px] mr-4">
                <StarRating rating={calculateStar(item?.rating)} />
              </div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            marginTop: "24px",
            borderRadius: "16px",
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div className="w-full px-0">
            <Timeline items={timelineItems} />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default StripReportCard;
