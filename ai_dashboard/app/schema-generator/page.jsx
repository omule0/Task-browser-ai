"use client";
import { useState } from "react";
import { useChat } from "ai/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Copy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";

export default function SchemaGenerator() {
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat/schema-generator",
  });

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      customToast.success("Schema copied to clipboard!");
    } catch (err) {
      customToast.error("Failed to copy schema");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Report Schema Generator</h1>
        <p className="text-muted-foreground">
          Describe your report requirements and let AI generate an appropriate schema structure.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="space-y-4">
        {/* Messages */}
        <Card className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && message.content.includes("```") ? (
                    <>
                      <p className="mb-2 whitespace-pre-wrap">
                        {message.content.split("```")[0]}
                      </p>
                      <div className="relative">
                        <pre className="bg-background p-4 rounded-md overflow-x-auto">
                          <code>{message.content.split("```")[1].split("```")[0]}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(message.content.split("```")[1].split("```")[0])}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your report requirements... (e.g., I need a schema for a financial analysis report with sections for market overview, risk assessment, and recommendations)"
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Schema"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 