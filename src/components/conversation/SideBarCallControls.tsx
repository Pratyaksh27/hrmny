"use client";

import Image from "next/image";

type Props = {
  status: "Not Started" | "Connecting" | "Connected" | "Disconnected";
  onStart: () => void;
  onEnd: () => void;
  assets: {
    start: string;     // white mic
    on: string;        // green mic
    end: string;       // blue mic
    ended: string;     // post-end mic
  };
};

export default function SidebarCallControls({ status, onStart, onEnd, assets }: Props) {
  const isStarted = status === "Connected" || status === "Connecting";
  const isEnded = status === "Disconnected";
  const canEnd = status === "Connected";
  const canStart = status === "Not Started" || status === "Disconnected";

  const topImgSrc = isStarted ? assets.on : assets.start;
  const topText   = isStarted ? "Conversation Started" : "Start";
  const bottomImgSrc = isEnded ? assets.ended : assets.end;
  const bottomText   = isEnded ? "Conversation Finished" : "End Conversation";

  return (
    <div className="flex flex-col items-center gap-10 text-center select-none">
      {/* Top mic */}
      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className={`flex flex-col items-center gap-2 ${canStart ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
      >
        <Image src={topImgSrc} alt="Start Conversation" width={64} height={64} />
        <span className="text-sm font-semibold text-brand">{topText}</span>
      </button>

      {/* Bottom mic */}
      <button
        type="button"
        onClick={onEnd}
        disabled={!canEnd}
        className={`flex flex-col items-center gap-2 ${canEnd ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
      >
        <Image src={bottomImgSrc} alt="End Conversation" width={64} height={64} />
        <span className="text-sm font-semibold text-brand">{bottomText}</span>
      </button>
    </div>
  );
}
