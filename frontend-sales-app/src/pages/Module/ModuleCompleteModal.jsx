import React, { useContext } from "react";
import Button from "../../component/Button/Button";

import {
  moduleCompletedModalType,
  moduleCompletedModalType2,
} from "../../utils/constant";
import { useSelector } from "react-redux";
import assets from "../../constants/assets";
import StarRating from "../../component/Star/StarRating";

const ModuleCompleteModal = ({
  type,
  generatingSparData,
  mergingVideoMedia,
  onClose,
  objectives,
  end,
  failed,
}) => {
  const postTranscriptionResult = useSelector(
    (state) => state.commonReducer.postTranscriptionResult
  );

  return (
    <>
      {/* <div className="text-center text-white max-w-[500px] m-auto mb-9">
        <p className="mb-4">
          {postTranscriptionResult == "error"
            ? "Sorry, Spar failed..."
            : "Spar completed!"}
        </p>
        <h3 className="mb-4 primary text-[19px] font-bold tracking-[0.19px]">
          {postTranscriptionResult == "finished" && (
            <p
              className="text-[#FDA43C]"
              dangerouslySetInnerHTML={{
                __html: moduleCompletedModalType2?.finished?.title,
              }}
            ></p>
          )}
          {postTranscriptionResult == "warning" && (
            <p className="text-[#FDA43C]">
              {moduleCompletedModalType2?.warning?.title}
            </p>
          )}
          {postTranscriptionResult == "error" && (
            <p className="error"> {moduleCompletedModalType2?.error?.title}</p>
          )}
          {postTranscriptionResult == "success" && (
            <p className="primary">
              {moduleCompletedModalType2?.success?.title}
            </p>
          )}
        </h3>
        {postTranscriptionResult == "finished" && (
          <p
            className="text-sm font-normal"
            dangerouslySetInnerHTML={{
              __html: moduleCompletedModalType2?.finished?.message,
            }}
          ></p>
        )}
        {postTranscriptionResult == "success" && (
          <p
            className="text-sm font-normal"
            dangerouslySetInnerHTML={{
              __html: moduleCompletedModalType2?.success?.message,
            }}
          ></p>
        )}
        {postTranscriptionResult == "warning" && (
          <p
            className="text-sm font-normal"
            dangerouslySetInnerHTML={{
              __html: moduleCompletedModalType2?.warning?.message,
            }}
          ></p>
        )}
        {postTranscriptionResult == "error" && (
          <p
            className="text-sm font-normal"
            dangerouslySetInnerHTML={{
              __html: moduleCompletedModalType2?.error?.message,
            }}
          ></p>
        )}
      </div> */}

      <div className="p-[60px]">
        <div className="text-center w-max mx-auto relative">
          <img
            loading="lazy"
            src={
              failed
                ? assets.failedNew
                : end
                ? assets.infoNew
                : assets.successComplete
            }
            className="shrink-0 w-[120px] h-[120px] aspect-square"
            alt=""
          />
        </div>
        <div className="flex flex-col items-center mt-8">
          {objectives && !end && !failed && (
            <>
              <p className="text-primary text-[19px] font-bold text-center font-montserrat leading-[12.87px] tracking-wider">
                Congratulations!
              </p>
              <p className="mt-2 font-light  text-[32px] leading-[41px] text-white text-center font-montserrat">
                Spar Completed
              </p>
            </>
          )}
          {/* {failed && (
            <p className="text-[#FF5555] text-[19px] font-bold text-center font-montserrat leading-[12.87px] tracking-wider">
              Spar failed...
            </p>
          )} */}
          {objectives && !end && !failed ? (
            <>
              <p className="mt-4 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
                You achieved the objectives of this Spar. We are happy to offer
                you your well-deserved rewards.
              </p>
            </>
          ) : failed ? (
            <>
              <p
                className={`${
                  failed ? "text-[#FF5555]" : "text-primary"
                }  text-[19px] font-bold text-center font-montserrat leading-[12.87px] tracking-wider`}
              >
                Spar failed...
              </p>
              <p className="mt-2 font-light  text-[32px] leading-[41px] text-white text-center font-montserrat">
                Don’t worry, it’s by making mistakes that we learn.
              </p>
              {!end && (
                <p className="mt-4 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
                  You still earn some Spar points as encouragement.
                </p>
              )}
            </>
          ) : (
            <>
              <p
                className={`${
                  end ? "text-[#FFC56E]" : "text-primary"
                }  text-[19px] font-bold text-center font-montserrat leading-[12.87px] tracking-wider`}
              >
                Spar completed...
              </p>
              <p className="mt-2 font-light  text-[32px] leading-[41px] text-white text-center font-montserrat">
                ...but you didn’t meet all the objectives
              </p>
              {!end && (
                <p className="mt-4 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
                  You still earn some Spar points as encouragement.
                </p>
              )}
            </>
          )}
          <div className="relative flex justify-center items-center w-full mt-8 h-[38px]">
            <div className="absolute top-1/2 w-[430px]  h-[1px]  bg-[#1A1A1A]"></div>
            <div className="flex relative z-10 ">
              <StarRating rating={3} />
            </div>
            {/* <img
              loading="lazy"
              src={assets.bigStar}
              className="shrink-0 w-[120px] h-[120px] aspect-square z-20 absolute ml-12"
              alt=""
            /> */}
          </div>
          {objectives && !end ? (
            <p className="mt-8 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
              Drill down into your feedback details to see how you can continue
              to improve.
            </p>
          ) : (
            !end && (
              <p className="mt-8 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
                Access your feedback to see what you missed and learn about your
                strengths and areas of improvements.
              </p>
            )
          )}
          {end && !failed && (
            <p className="mt-8 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
              It happens. Try again. Practice makes perfect! Click below to
              access the feedback of your session.
            </p>
          )}
          {failed && (
            <p className="mt-8 font-light text-[14px] leading-[23px] text-white text-center font-montserrat">
              Next time will definitely be better. Click below to access the
              feedback of your session.
            </p>
          )}
          <div className="flex flex-row justify-between mt-12">
            <Button
              onClick={onClose}
              className="btn btn-gradient-cancel mx-auto "
            >
              May be later
            </Button>
            <Button
              onClick={onClose}
              className="btn btn-gradient-complete mx-auto ml-3"
            >
              Access feedback
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleCompleteModal;
