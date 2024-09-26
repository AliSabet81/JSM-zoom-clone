"use client";

import { useGetCalls } from "@/hooks/useGetCalls";
import {
  Call,
  CallRecording,
  ListRecordingsResponse,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";
import { useToast } from "@/hooks/use-toast";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recording" }) => {
  const { endedCalls, callRecordings, upcomingCalls, isLoading } =
    useGetCalls();
  const router = useRouter();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);

  const { toast } = useToast();

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recording":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "recording":
        return "No Recordings";
      case "upcoming":
        return "No Upcoming Calls";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoadingRecordings(true);
      try {
        const callData = await Promise.allSettled(
          callRecordings.map((meeting) => meeting.queryRecordings())
        );

        const successfulRecordings = callData
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<ListRecordingsResponse> =>
              result.status === "fulfilled" &&
              result.value.recordings?.length > 0
          )
          .flatMap((result) => result.value.recordings);

        setRecordings(successfulRecordings);
      } catch (error) {
        toast({ title: "Failed to load recordings. Please try again later." });
      } finally {
        setLoadingRecordings(false);
      }
    };

    if (type === "recording") fetchRecordings();
  }, [type, callRecordings, toast]);

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (isLoading || (type === "recording" && loadingRecordings)) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call)?.id || (meeting as CallRecording).filename}
            title={
              (meeting as Call)?.state?.custom?.description?.substring(0, 26) ||
              (meeting as CallRecording)?.filename?.substring(0, 20) ||
              "Personal Meeting"
            }
            date={
              (meeting as Call)?.state?.startsAt?.toLocaleString() ||
              new Date((meeting as CallRecording).start_time).toLocaleString()
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
