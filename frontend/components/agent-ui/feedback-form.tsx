import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconSend, IconStar, IconStarFilled } from '@tabler/icons-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  onSubmit: (rating: number, feedback: string) => void;
  loading?: boolean;
}

export const FeedbackForm = ({ onSubmit, loading = false }: FeedbackFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || rating === 0) return;
    onSubmit(rating, feedback);
  };

  const ratingLabels = {
    0: '',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Bold Rating Section */}
        <div className="flex flex-col gap-1 sm:gap-2 items-center">
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground">
            How was your experience?
          </h3>
          
          <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-3 my-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <motion.button
                key={value}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                aria-label={`Rate ${value} stars`}
              >
                {rating >= value || (hoveredRating >= value && hoveredRating > 0) ? (
                  <IconStarFilled className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-amber-500" />
                ) : (
                  <IconStar className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-muted" />
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Display rating label */}
          <div className="h-5 sm:h-6">
            {(rating > 0 || hoveredRating > 0) && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-semibold text-sm sm:text-base text-primary"
              >
                {hoveredRating > 0 ? ratingLabels[hoveredRating as keyof typeof ratingLabels] : ratingLabels[rating as keyof typeof ratingLabels]}
              </motion.p>
            )}
          </div>
        </div>
        
        {/* Feedback textarea with bold outline */}
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts and feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={loading}
            aria-label="Feedback text"
            className={cn(
              "min-h-[80px] xs:min-h-[100px] sm:min-h-[120px] resize-none px-3 sm:px-4 py-2 sm:py-3",
              "text-sm sm:text-base rounded-lg sm:rounded-xl",
              "bg-background border-2 border-muted",
              "focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
              "shadow-sm hover:shadow-md transition-colors duration-300 ease-in-out",
              loading && "opacity-70 cursor-not-allowed",
              isFocused && "border-primary/70"
            )}
          />
        </div>
        
        {/* Bold submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || rating === 0}
            aria-label={loading ? "Sending feedback" : "Send feedback"}
            className={cn(
              "font-bold py-2 px-4 sm:px-6 text-sm sm:text-base",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "shadow-md hover:shadow-lg transition-all duration-200",
              "rounded-lg sm:rounded-xl",
              loading && "cursor-not-allowed opacity-70"
            )}
          >
            <IconSend className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
}; 