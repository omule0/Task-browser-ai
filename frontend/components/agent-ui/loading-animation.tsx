import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const LoadingAnimation = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-40 h-40">
      <DotLottieReact
        src="/loading-gif.json"
        loop
        autoplay
      />
    </div>
  </div>
); 