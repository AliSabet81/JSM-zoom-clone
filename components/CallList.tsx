"use client";

import { useGetCalls } from "@/hooks/useGetCalls";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recording" }) => {
  const { endedCalls, callRecordings, upcomingCalls, isLoading } =
    useGetCalls();
  const router = useRouter();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recording": {
        return recordings;
      }
      case "upcoming": {
        return upcomingCalls;
      }
      default:
        return [];
    }
  };
  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "recording": {
        return "No Recordings";
      }
      case "upcoming": {
        return "No Upcoming Calls";
      }
      default:
        return "";
    }
  };

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call)?.id}
            title={
              (meeting as Call).state.custom.description.substring(0, 26) ||
              "No Description"
            }
            date={
              (meeting as Call).state.startedAt?.toLocaleString() ||
              (meeting as CallRecording).start_time.toLocaleString()
            }
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            isPreviousMeeting={type === "ended"}
            buttonIcon1={type === "recording" ? "/icons/play.svg" : undefined}
            buttonText={type === "recording" ? "play" : "start"}
            handleClick={
              type === "recording"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
            link={
              type === "recording"
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${
                    (meeting as Call).id
                  }`
            }
          />
        ))
      ) : (
        <h1>{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
