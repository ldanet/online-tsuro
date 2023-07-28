import "../styles/styles.css";
import type { AppProps } from "next/app";
import { Varela_Round, Comfortaa } from "next/font/google";
import { cn } from "../utils/styles";

const textFont = Varela_Round({
  subsets: ["latin"],
  weight: "400",
});

const displayFont = Comfortaa({
  subsets: ["latin"],
  variable: "--font-display",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={cn(textFont.className, displayFont.variable)}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
