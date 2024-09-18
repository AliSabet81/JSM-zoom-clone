import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { FC } from "react";

interface HomeCardProps {
  img: string;
  title: string;
  description: string;
  handleClick: () => void;
  className: string;
}

const HomeCard: FC<HomeCardProps> = ({
  img,
  description,
  title,
  handleClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "px-4 py-6 flex flex-col justify-between w-full min-h-[260px] rounded-[14px] cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center glassmorphism size-12 rounded-[10px]">
        <Image src={img} width={27} height={27} alt="meeting" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal">{description}</p>
      </div>
    </div>
  );
};

export default HomeCard;
