import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl: "http://localhost:8000" });
// Using the graph deployed with the name "agent"
const assistantID = "report_maistro";
// create thread
const thread = await client.threads.create();
console.log(thread);

const input = {
  topic: "Compiler Design",
  feedback_on_report_plan: null,
  accept_report_plan: false
};

const streamResponse = client.runs.stream(
  thread["thread_id"],
  assistantID,
  {
    input,
    streamMode: "messages"
  }
);

for await (const chunk of streamResponse) {
  console.log(`Receiving new event of type: ${chunk.event}...`);
  console.log(chunk.data);
  console.log("\n\n");
}