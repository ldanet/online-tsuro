import { ComponentProps } from "react";
import { cn } from "../utils/styles";

const Button = ({
  fullSize,
  onClick,
  ...props
}: ComponentProps<"button"> & { fullSize?: boolean }) => {
  return (
    <button
      className={cn(
        fullSize && "w-full",
        "rounded-xl px-4 border-2 border-orange-800 py-3 text-lg text-orange-800 hover:bg-orange-800 hover:text-orange-50"
      )}
      onClick={onClick}
      {...props}
    />
  );
};

export default Button;
