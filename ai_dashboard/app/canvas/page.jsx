"use client";
import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  addEdge,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";
import { FileText, Trash2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { customToast } from "@/components/ui/toast-theme";

// Custom Node Component with delete button and truncated filename
const FileNode = ({ data, id }) => {
  const deleteNode = () => {
    data.onDelete(id);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow w-64 border">
      <Handle
        type="target"
        position={Position.Top}
        className="w-8 h-8 !bg-gray-300 hover:!bg-blue-500 border-2 border-white transition-colors"
        style={{ top: -8 }}
      />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 flex-shrink-0 text-gray-500" />
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-medium text-gray-900 truncate"
              title={data.originalName || data.name}
            >
              {data.originalName || data.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {new Date(data.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={deleteNode}
          className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-gray-500 truncate">
        {(data.metadata?.size / 1024 / 1024).toFixed(2)} MB
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-8 h-8 !bg-gray-300 hover:!bg-blue-500 border-2 border-white transition-colors"
        style={{ bottom: -8 }}
      />
    </div>
  );
};

// Register custom node type
const nodeTypes = {
  fileNode: FileNode,
};

// Customize edge options with consistent styling
const defaultEdgeOptions = {
  type: 'smoothstep', // smoother edge type
  animated: true,     // keep the animation
  style: {
    strokeWidth: 2,
    stroke: '#374151', // gray-700
  },
  // Increase interaction width to make edges easier to select
  interactionWidth: 10,
  // Add custom markers for better visibility
  markerEnd: {
    type: 'arrow',
    width: 20,
    height: 20,
    color: '#374151',
  }
};

// Customize connection line style
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#374151',
  strokeDasharray: '5,5', // dashed line while connecting
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  // Handle node connections
  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#374151', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle node deletion
  const onDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ));
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
      // Load saved positions and connections
      const savedState = localStorage.getItem(`canvasState-${currentWorkspace.id}`);
      if (savedState) {
        const { positions, connections } = JSON.parse(savedState);
        setNodes(prevNodes => 
          prevNodes.map(node => ({
            ...node,
            position: positions[node.id] || node.position
          }))
        );
        setEdges(connections || []);
      }
    }
  }, [currentWorkspace, setNodes, setEdges]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!currentWorkspace) {
        setNodes([]);
        return;
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .list(`${currentWorkspace.id}/${user.id}`);

      if (error) throw error;

      // Convert files to nodes
      const fileNodes = data.map((file, index) => {
        const parts = file.name.split('-');
        const originalName = parts.slice(2).join('-');
        
        // Calculate grid-like initial positions
        const position = {
          x: (index % 3) * 300,
          y: Math.floor(index / 3) * 150
        };

        return {
          id: file.name,
          type: 'fileNode',
          position,
          data: {
            ...file,
            originalName,
            onDelete: onDeleteNode,
          },
          connectable: true,
        };
      });

      setNodes(fileNodes);
    } catch (error) {
      console.error('Error loading files:', error);
      customToast.error('Error loading your files');
    } finally {
      setLoading(false);
    }
  };

  const onNodeDragStop = useCallback(() => {
    // Save positions and connections to localStorage
    if (currentWorkspace) {
      const positions = nodes.reduce((acc, n) => ({
        ...acc,
        [n.id]: n.position
      }), {});
      
      localStorage.setItem(
        `canvasState-${currentWorkspace.id}`,
        JSON.stringify({
          positions,
          connections: edges
        })
      );
    }
  }, [nodes, edges, currentWorkspace]);

  const onEdgesDelete = useCallback((edgesToDelete) => {
    setEdges((eds) => eds.filter(e => !edgesToDelete.find(del => del.id === e.id)));
    
    // Save updated state to localStorage
    if (currentWorkspace) {
      const positions = nodes.reduce((acc, n) => ({
        ...acc,
        [n.id]: n.position
      }), {});
      
      localStorage.setItem(
        `canvasState-${currentWorkspace.id}`,
        JSON.stringify({
          positions,
          connections: edges.filter(e => !edgesToDelete.find(del => del.id === e.id))
        })
      );
    }
  }, [nodes, edges, currentWorkspace]);

  if (loading) return <Loading />;
  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No workspace selected</h3>
          <p className="text-gray-500">Please select or create a workspace to view files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        elevateEdgesOnSelect={true}
        selectNodesOnDrag={false}
        connectionMode="loose"
        onEdgesDelete={onEdgesDelete}
      >
        <Controls className="bg-white rounded-md border shadow-sm" />
        <MiniMap 
          className="bg-white rounded-md border shadow-sm" 
          nodeColor="#374151"
        />
        <Background variant="dots" gap={12} size={1} color="#E5E7EB" />
        <Panel position="top-left">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">
              • Click and drag between handles to connect nodes
              <br/>
              • Select an edge and press Delete to remove it
              <br/>
              • Handles will highlight blue when hovering
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <div className="p-1">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold mb-1">Canvas</h1>
        <p className="text-gray-500">Organize and connect your files</p>
      </div>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
