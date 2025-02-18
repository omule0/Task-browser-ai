export interface UseCase {
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
}

export const useCases: UseCase[] = [
  {
    title: "Writing in Google Docs",
    description: "Enhance your writing experience with AI-powered suggestions and improvements directly in Google Docs.",
    imageUrl: "/images/use-cases/google-docs.png",
    altText: "AI assistant helping with writing in Google Docs"
  },
  {
    title: "Job Applications",
    description: "Get assistance with crafting compelling job applications, resumes, and cover letters.",
    imageUrl: "/images/use-cases/job-applications.png",
    altText: "AI helping with job applications"
  },
  {
    title: "Flight Search",
    description: "Find the best flight deals and travel options with AI-powered search assistance.",
    imageUrl: "/images/use-cases/flight-search.png",
    altText: "AI assisting with flight search"
  },
  {
    title: "Data Collection",
    description: "Efficiently gather and organize data with intelligent automation tools.",
    imageUrl: "/images/use-cases/data-collection.png",
    altText: "AI helping with data collection"
  }
]; 