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
  ReactFlowProvider,
  Panel
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Copy, ArrowLeft, Save, MoreHorizontal, LayoutTemplate, ChevronUp, ArrowRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";
import { createClient } from "@/utils/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add this before SchemaNode component
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Set node dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: 250, 
      height: node.data.type === 'object' ? 120 : 80 
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Let dagre do its magic
  dagre.layout(dagreGraph);

  // Get new nodes with updated positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (250 / 2),
        y: nodeWithPosition.y - (node.data.type === 'object' ? 60 : 40),
      },
      // Update source/target positions based on direction
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom node component for schema properties
const SchemaNode = memo(({ data }) => {
  const nodeClasses = {
    root: "px-4 py-3 shadow-lg rounded-lg border-2",
    section: "px-4 py-2 shadow-md rounded-md border",
    property: "px-3 py-2 shadow-sm rounded-md border"
  };

  const getBgColor = () => {
    switch (data.nodeType) {
      case 'root':
        return 'bg-primary/10 border-primary';
      case 'section':
        return 'bg-card border-border';
      default:
        return 'bg-background border-muted';
    }
  };

  return (
    <div className={`${nodeClasses[data.nodeType || 'property']} ${getBgColor()}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.description && (
          <div className="text-muted-foreground text-sm">{data.description}</div>
        )}
        {data.type && (
          <div className="text-xs font-mono bg-muted px-2 py-1 mt-2 rounded">
            {data.type}
            {data.required && <span className="text-red-500 ml-1">*</span>}
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

// Convert JSON schema to nodes and edges with improved layout
const convertSchemaToFlow = (schema) => {
  const nodes = [];
  const edges = [];

  const processProperty = (name, property, parentId = null, level = 0) => {
    const id = `${name}-${Math.random()}`;
    const isRoot = level === 0;

    // Handle different types of properties
    const processPropertyType = () => {
      if (property.type === 'object' && property.properties) {
        return 'object';
      } else if (property.type === 'array' && property.items) {
        if (property.items.type === 'object') {
          return 'array[object]';
        }
        return `array[${property.items.type}]`;
      }
      return property.type;
    };

    // Add node for current property
    nodes.push({
      id,
      type: 'schema',
      position: { x: 0, y: 0 }, // Position will be set by dagre
      data: {
        label: name,
        description: property.description,
        type: processPropertyType(),
        required: schema.required?.includes(name),
        nodeType: isRoot ? 'root' : property.type === 'object' ? 'section' : 'property'
      }
    });

    // Connect to parent if exists
    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: property.type === 'object'
      });
    }

    // Process nested properties
    if (property.type === 'object' && property.properties) {
      Object.entries(property.properties).forEach(([childName, childProp]) => {
        processProperty(childName, childProp, id, level + 1);
      });
    }

    // Process array items if they're objects with properties
    if (property.type === 'array' && property.items?.type === 'object' && property.items.properties) {
      Object.entries(property.items.properties).forEach(([childName, childProp]) => {
        processProperty(`${name}[].${childName}`, childProp, id, level + 1);
      });
    }
  };

  // Process all root properties
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([name, property]) => {
      processProperty(name, property, null, 0);
    });
  }

  return { nodes, edges };
};

// Add this helper function to process message content
const processMessageContent = (message) => {
  if (message.role === 'assistant') {
    // Remove JSON schema block from display but keep markdown formatting
    const contentWithoutSchema = message.content
      .replace(/```json\n[\s\S]*?\n```/g, '')
      .replace(/```typescript\n[\s\S]*?\n```/g, '')
      .trim();
    return contentWithoutSchema;
  }
  return message.content;
};

export default function SchemaGenerator() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState('LR');
  const [currentSchema, setCurrentSchema] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat/schema-generator",
  });

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge(params, eds)), [setEdges]
  );

  // Add layout handler
  const onLayout = useCallback((direction) => {
    setLayout(direction);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges]);

  const handleSaveSchema = async () => {
    if (!currentSchema || !schemaName.trim() || !user) {
      customToast.error('Please login to save schemas');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      
      const { data: savedSchema, error } = await supabase
        .from('report_schemas')
        .insert([
          {
            name: schemaName.trim(),
            schema: currentSchema,
            nodes: nodes,
            edges: edges,
            layout: layout,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      customToast.success('Template saved successfully!');
      setSaveDialogOpen(false);
      setSchemaName('');
      setSaveSuccess(true);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving Template:', error);
      customToast.error(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Update flow when new message is received
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      try {
        const schemaMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
        if (schemaMatch) {
          const schema = JSON.parse(schemaMatch[1]);
          setCurrentSchema(schema); // Store the current schema
          const flow = convertSchemaToFlow(schema);
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            flow.nodes,
            flow.edges,
            layout
          );
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        }
      } catch (error) {
        console.error('Failed to parse template:', error);
      }
    }
  }, [messages, setNodes, setEdges, layout]);

  // Update user effect
  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Disable save button if user is not logged in
  const canSave = user && currentSchema && !isSaving;

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        {/* Chat sidebar */}
        <div className="w-1/3 p-4 border-r">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            {saveSuccess && (
              <Button onClick={() => router.push('/generate-report')} className="bg-primary text-primary-foreground">
                Generate Report<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
          
          <h1 className="text-xl font-bold mb-2">Template Generator</h1>
          <p className="text-muted-foreground text-sm mb-2">Describe the report you want to generate and see it visualized as a template.</p>

          <div className="space-y-4">
            <div className="h-[50vh] overflow-y-auto">
              {messages.map((message) => {
                const content = processMessageContent(message);
                if (!content) return null;
                return (
                  <Card key={message.id} className={`p-4 mb-4 ${message.role === "user" ? "bg-primary/5" : "bg-background"}`}>
                    <div className="flex items-start gap-2">
                      <div className={`text-xs uppercase font-medium px-2 py-1 rounded ${message.role === "user" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {message.role === "user" ? "You" : "AI"}
                      </div>
                      <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                        {message.role === "user" ? content : (
                          <ReactMarkdown components={{
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                            ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            p: ({children}) => <p className="mb-2">{children}</p>,
                            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
                          }}>{content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea value={input} onChange={handleInputChange} placeholder="Describe your report requirements..." className="min-h-[100px]" />
              <Button type="submit" disabled={isLoading}>
                <MessageCircle className="w-4 h-4 mr-2" />{isLoading ? "Generating..." : "Generate Template"}
              </Button>
            </form>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="w-2/3 h-full bg-muted/10 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
            }}
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            
            {/* Add Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg"
                  >
                    {isMenuOpen ? (
                      <ChevronUp className="h-6 w-6" />
                    ) : (
                      <MoreHorizontal className="h-6 w-6" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => onLayout('LR')}
                    className="cursor-pointer"
                  >
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Vertical Layout
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onLayout('TB')}
                    className="cursor-pointer"
                  >
                    <LayoutTemplate className="mr-2 h-4 w-4 rotate-90" />
                    Horizontal Layout
                  </DropdownMenuItem>
                  
                  {currentSchema && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSaveDialogOpen(true)}
                        className="cursor-pointer"
                        disabled={!canSave}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ReactFlow>
        </div>
      </div>

      {/* Save Schema Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open) setSaveSuccess(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schema-name">Template Name</Label>
              <Input
                id="schema-name"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="Enter a name for your template"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchema}
              disabled={!schemaName.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Template Saved Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to generate a report using this template now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSuccessDialog(false)}>
              Continue Working
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/generate-report');
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate Report
              <ArrowRight className="w-4 h-4 ml-2" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ReactFlowProvider>
  );
} 