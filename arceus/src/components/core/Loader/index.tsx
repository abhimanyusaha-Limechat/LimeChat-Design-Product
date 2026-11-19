
import Lottie from "lottie-react";
import animationData from "assets/lottie/logo.json";

const LottieComponent = (Lottie as unknown as { default?: typeof Lottie }).default ?? Lottie;

function Loader({ size = 100 }: { size?: number }) {
  return <LottieComponent animationData={animationData} loop style={{ width: size }} />;
}

export default Loader;
export { Loader };
