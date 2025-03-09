import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 relative loading-container">
      <div className="absolute inset-0 rounded-full bg-primary/5"></div>
      <div className="absolute inset-0 rounded-full border-2 border-primary/10"></div>
      <DotLottieReact
        src="/loading-gif.json"
        loop
        autoplay
      />
    </div>
    <div className="mt-4 text-sm text-muted-foreground font-medium">
      Processing...
    </div>
    <style jsx>{`
      .loading-container {
        position: relative;
      }
    `}</style>
  </div>
); 