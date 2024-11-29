"use client";
import { useState, useCallback, useEffect, memo } from "react";
import { useChat } from "ai/react";
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Copy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";

// Custom node component for schema properties
const SchemaNode = memo(({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.description && (
          <div className="text-gray-500 text-sm">{data.description}</div>
        )}
        {data.type && (
          <div className="text-xs font-mono bg-gray-100 px-2 py-1 mt-2 rounded">
            {data.type}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

SchemaNode.displayName = 'SchemaNode';

const nodeTypes = {
  schema: SchemaNode
};

// Convert JSON schema to nodes and edges
const convertSchemaToFlow = (schema) => {
  const nodes = [];
  const edges = [];
  let yOffset = 0;

  const processProperty = (name, property, parentId = null) => {
    const id = `${name}-${Math.random()}`;
    
    nodes.push({
      id,
      type: 'schema',
      position: { x: 0, y: yOffset },
      data: {
        label: name,
        description: property.description,
        type: property.type
      }
    });

    yOffset += 100;

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id
      });
    }

    if (property.properties) {
      Object.entries(property.properties).forEach(([childName, childProp]) => {
        processProperty(childName, childProp, id);
      });
    }
  };

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([name, property]) => {
      processProperty(name, property);
    });
  }

  return { nodes, edges };
};

export default function SchemaGenerator() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat/schema-generator",
  });

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge(params, eds)), [setEdges]
  );

  // Update flow when new message is received
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      try {
        // Extract JSON schema from markdown code block
        const schemaMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
        if (schemaMatch) {
          const schema = JSON.parse(schemaMatch[1]);
          const flow = convertSchemaToFlow(schema);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
      } catch (error) {
        console.error('Failed to parse schema:', error);
      }
    }
  }, [messages, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        {/* Chat sidebar */}
        <div className="w-1/3 p-4 border-r">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">Schema Generator</h1>
          <p className="text-muted-foreground mb-4">
            Describe your report requirements and see them visualized as a schema.
          </p>

          <div className="space-y-4">
            <div className="h-[60vh] overflow-y-auto">
              {messages.map((message) => (
                <Card key={message.id} className="p-4 mb-4">
                  <div className={message.role === "user" ? "font-medium" : ""}>
                    {message.content}
                  </div>
                </Card>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your report requirements..."
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={isLoading}>
                <MessageCircle className="w-4 h-4 mr-2" />
                {isLoading ? "Generating..." : "Generate Schema"}
              </Button>
            </form>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="w-2/3 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
} 