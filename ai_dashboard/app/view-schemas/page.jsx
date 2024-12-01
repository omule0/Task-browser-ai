"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactFlow, { 
  Background, 
  Controls,
  ReactFlowProvider,
  Panel,
  MiniMap,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
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
import { customToast } from "@/components/ui/toast-theme";
import { SchemaNode } from "../schema-generator/page"; // You'll need to export SchemaNode from schema-generator

const PreviewSchemaNode = ({ data }) => {
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
};

export default function ViewSchemas() {
  const router = useRouter();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [schemaToDelete, setSchemaToDelete] = useState(null);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('report_schemas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemas(data);
    } catch (error) {
      console.error('Error fetching schemas:', error);
      customToast.error('Failed to load schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!schemaToDelete) return;

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('report_schemas')
        .delete()
        .eq('id', schemaToDelete.id);

      if (error) throw error;

      setSchemas(schemas.filter(schema => schema.id !== schemaToDelete.id));
      customToast.success('Template deleted successfully');
      setShowDeleteDialog(false);
      setSchemaToDelete(null);
    } catch (error) {
      console.error('Error deleting schema:', error);
      customToast.error('Failed to delete template');
    }
  };

  const nodeTypes = {
    schema: PreviewSchemaNode
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <h1 className="text-2xl font-bold">Your Templates</h1>
        <div className="w-[100px]"></div> {/* Spacer for alignment */}
      </div>

      {schemas.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No templates found</p>
          <Button onClick={() => router.push('/schema-generator')}>
            Create Your First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemas.map((schema) => (
            <Card key={schema.id} className="p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{schema.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      setSchemaToDelete(schema);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Created: {new Date(schema.created_at).toLocaleDateString()}
              </div>
              <Button 
                className="mt-auto"
                onClick={() => router.push(`/generate-report?template=${schema.id}`)}
              >
                Generate Report
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Improved Preview Modal */}
      {selectedSchema && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedSchema.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(selectedSchema.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/generate-report?template=${selectedSchema.id}`)}
                  className="bg-primary text-primary-foreground"
                >
                  Generate Report
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSchema(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <ReactFlowProvider>
                <div className="w-full h-full bg-muted/5 rounded-lg">
                  <ReactFlow
                    nodes={selectedSchema.nodes}
                    edges={selectedSchema.edges}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                      type: 'smoothstep',
                      style: { 
                        stroke: 'hsl(var(--muted-foreground))', 
                        strokeWidth: 2,
                        animated: true 
                      },
                    }}
                    zoomOnScroll={false}
                    panOnScroll={true}
                    selectionOnDrag={false}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    fitViewOptions={{
                      padding: 0.5,
                      maxZoom: 1
                    }}
                  >
                    <Background 
                      color="hsl(var(--muted-foreground))" 
                      gap={16} 
                      size={1}
                      style={{ opacity: 0.1 }}
                    />
                    <Controls showInteractive={false} />
                    <MiniMap 
                      nodeColor={(node) => {
                        switch (node.data.nodeType) {
                          case 'root':
                            return 'hsl(var(--primary))';
                          case 'section':
                            return 'hsl(var(--card))';
                          default:
                            return 'hsl(var(--muted))';
                        }
                      }}
                      nodeStrokeWidth={3}
                      zoomable
                      pannable
                      position="bottom-left"
                      className="!left-12 !bottom-2"
                      style={{ 
                        width: 200, 
                        height: 150,
                        backgroundColor: 'hsl(var(--background))',
                        borderRadius: '0.5rem',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                  </ReactFlow>
                </div>
              </ReactFlowProvider>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 