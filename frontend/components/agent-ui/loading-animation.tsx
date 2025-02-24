import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const LoadingAnimation = () => (
  <div className="flex items-center justify-center p-4 sm:p-6 md:p-8">
    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
      <DotLottieReact
        src="/loading-gif.json"
        loop
        autoplay
      />
    </div>
  </div>
); 