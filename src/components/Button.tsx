import { ComponentProps } from "react";
import { cn } from "../utils/styles";

type Variant = "standard" | "small";

const variantStyles: { [key in Variant]: string } = {
  small: "px-2 py-1",
  standard: "px-4 py-3 text-lg",
};

const Button = ({
  className,
  fullSize,
  onClick,
  variant = "standard",
  ...props
}: ComponentProps<"button"> & { fullSize?: boolean; variant?: Variant }) => {
  return (
    <button
      className={cn(
        className,
        fullSize && "w-full",
        "rounded-xl border-2 border-orange-800 text-orange-800 hover:bg-orange-800 hover:text-orange-50",
        variantStyles[variant]
      )}
      onClick={onClick}
      {...props}
    />
  );
};

export default Button;
