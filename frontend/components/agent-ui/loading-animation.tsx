import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 relative loading-container">
      <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse"></div>
      <div className="absolute inset-0 rounded-full border-2 border-primary/10"></div>
      <DotLottieReact
        src="/loading-gif.json"
        loop
        autoplay
      />
    </div>
    <div className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">
      Processing...
    </div>
    <style jsx>{`
      .loading-container {
        position: relative;
      }
      
      .loading-container::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        height: 90%;
        background: radial-gradient(
          circle,
          hsla(var(--primary), 0.15) 0%,
          hsla(var(--primary), 0.05) 40%,
          transparent 70%
        );
        border-radius: 50%;
        z-index: -1;
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      @keyframes glow {
        0% {
          opacity: 0.5;
          transform: translate(-50%, -50%) scale(0.95);
        }
        100% {
          opacity: 0.8;
          transform: translate(-50%, -50%) scale(1.05);
        }
      }
    `}</style>
  </div>
); 