'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { v4 as uuid } from 'uuid'
import type { Database } from '@/types/supabase'
import { getPhotoUrl, updateMember } from '@/lib/supabase'
type MemberRow = Database['public']['Tables']['Members']['Row']
type RelationshipRow = Database['public']['Tables']['Relationships']['Row']

interface FamilyTreeBuilderProps {
  members: MemberRow[]
  relationships: RelationshipRow[]
  onAddMember?: (member: Partial<MemberRow>) => void
  onAddRelationship?: (relationship: Partial<RelationshipRow>) => void
}

// Define the node data type for React Flow
type NodeData = MemberRow & { isPlaceholder?: boolean }

type RelType = 'parent' | 'spouse' | 'child' | 'sibling'

// Hierarchical layout function
const applyHierarchicalLayout = (nodes: any[], relationships: RelationshipRow[]) => {
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node }]))
  const parentChildMap = new Map<string, string[]>()
  const spouseMap = new Map<string, string[]>()
  
  // Build relationship maps
  relationships.forEach(rel => {
    if (rel.type === 'parent') {
      if (!parentChildMap.has(rel.a_id)) parentChildMap.set(rel.a_id, [])
      parentChildMap.get(rel.a_id)!.push(rel.b_id)
    } else if (rel.type === 'spouse') {
      if (!spouseMap.has(rel.a_id)) spouseMap.set(rel.a_id, [])
      spouseMap.get(rel.a_id)!.push(rel.b_id)
      if (!spouseMap.has(rel.b_id)) spouseMap.set(rel.b_id, [])
      spouseMap.get(rel.b_id)!.push(rel.a_id)
    }
  })
  
  // Find root nodes (nodes with no parents)
  const childIds = new Set(relationships.filter(r => r.type === 'parent').map(r => r.b_id))
  const rootNodes = nodes.filter(node => !childIds.has(node.id))
  
  // Position nodes hierarchically
  const positionedNodes = [...nodes]
  const visited = new Set<string>()
  
  const positionNode = (nodeId: string, x: number, y: number, level: number) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = positionedNodes.find(n => n.id === nodeId)
    if (!node) return
    
    node.position = { x, y }
    
    // Position children
    const children = parentChildMap.get(nodeId) || []
    const spouses = spouseMap.get(nodeId) || []
    
    let childX = x - (children.length - 1) * 150
    children.forEach(childId => {
      positionNode(childId, childX, y + 200, level + 1)
      childX += 300
    })
    
    // Position spouses at same level
    spouses.forEach(spouseId => {
      if (!visited.has(spouseId)) {
        const spouse = positionedNodes.find(n => n.id === spouseId)
        if (spouse) {
          spouse.position = { x: x + 250, y }
        }
      }
    })
  }
  
  // Start positioning from root nodes
  let rootX = 0
  rootNodes.forEach(root => {
    positionNode(root.id, rootX, 0, 0)
    rootX += 400
  })
  
  return positionedNodes
}

// Custom node component for family members
const FamilyNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-md min-w-[120px] relative">
      {/* Connection handles - specific to relationship types */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-green-500" 
        id="parent"
        style={{ top: '-6px' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-blue-500" 
        id="child"
        style={{ bottom: '-6px' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-purple-500" 
        id="spouse-source"
        style={{ right: '-6px' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-purple-500" 
        id="spouse-target"
        style={{ left: '-6px' }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        className="w-3 h-3 bg-orange-500" 
        id="sibling-source"
        style={{ left: '-6px' }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        className="w-3 h-3 bg-orange-500" 
        id="sibling-target"
        style={{ right: '-6px' }}
      />
      
      {/* Photo or avatar */}
      <div className="flex justify-center mb-2">
        {data.photo_path ? (
          <img
            src={getPhotoUrl(data.photo_path)}
            alt={data.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Name */}
      <div className="text-center">
        <div className="font-medium text-sm text-gray-900 truncate">{data.name}</div>
        {data.birthdate && (
          <div className="text-xs text-gray-500">
            {new Date(data.birthdate).getFullYear()}
          </div>
        )}
      </div>
    </div>
  )
}

// Define nodeTypes outside the component to prevent recreation
const nodeTypes: NodeTypes = {
  familyNode: FamilyNode,
}

export default function FamilyTreeBuilder({ 
  members, 
  relationships, 
  onAddMember, 
  onAddRelationship 
}: FamilyTreeBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<any[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  // Initialize nodes from existing members
  useEffect(() => {
    if (members.length === 0) {
      // Start with a "You" node if no members exist
      setNodes([{
        id: 'you',
        type: 'familyNode',
        position: { x: 0, y: 0 },
        data: { 
          name: 'You',
          birthdate: null,
          photo_path: null,
          summary: null,
          isPlaceholder: true
        },
      }] as any[])
      setEdges([]) // Clear edges when no members
      return
    }

    // Convert existing members to React Flow nodes
    const memberNodes: any[] = members.map((member, index) => ({
      id: member.id,
      type: 'familyNode',
      position: {
        x: member.position_x ?? (index * 200 - (members.length - 1) * 100),
        y: member.position_y ?? 0,
      },
      data: member,
    }))

    // Convert existing relationships to React Flow edges
    const relationshipEdges: Edge[] = relationships.map(rel => {
      // Determine source and target handles based on relationship type
      let sourceHandle = 'child'
      let targetHandle = 'parent'
      
      if (rel.type === 'spouse') {
        sourceHandle = 'spouse-source'
        targetHandle = 'spouse-target'
      } else if (rel.type === 'sibling') {
        sourceHandle = 'sibling-source'
        targetHandle = 'sibling-target'
      }
      
      return {
        id: rel.id,
        source: rel.a_id,
        target: rel.b_id,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        type: 'default', // Explicitly set edge type
        animated: false,
        style: {
          stroke: rel.type === 'spouse' ? '#8B5CF6' : rel.type === 'sibling' ? '#F97316' : '#3B82F6',
          strokeDasharray: rel.type === 'spouse' ? '5,5' : undefined,
          strokeWidth: rel.type === 'spouse' ? 6 : 5,
          opacity: 1,
          zIndex: 1000,
        },
        data: { type: rel.type }
      }
    })

    // Apply hierarchical layout for parent-child relationships
    if (relationships.length > 0) {
      // Apply hierarchical positioning
      // If nodes already have saved positions, keep them; otherwise layout.
      const hasAnySaved = members.some(m => m.position_x != null && m.position_y != null)
      const positionedNodes = hasAnySaved ? memberNodes : applyHierarchicalLayout([...memberNodes], relationships)
      setNodes(positionedNodes)
    } else {
      setNodes(memberNodes)
    }

    // Set edges after nodes are positioned
    setEdges(relationshipEdges)
  }, [members, relationships])

  // Handle connecting existing nodes
  const onConnect = useCallback((params: Connection) => {
    const inferType = (sourceHandle?: string | null, targetHandle?: string | null): 'parent' | 'spouse' | 'sibling' => {
      const handles = `${sourceHandle || ''}-${targetHandle || ''}`
      if (handles.includes('spouse')) return 'spouse'
      if (handles.includes('sibling')) return 'sibling'
      return 'parent'
    }

    const relType = inferType((params as any).sourceHandle, (params as any).targetHandle)

    if (onAddRelationship) {
      onAddRelationship({
        a_id: params.source!,
        b_id: params.target!,
        type: relType
      })
    }
    const newEdge = {
      ...params,
      id: uuid(),
      type: 'default',
      animated: false,
      style: {
        stroke: relType === 'spouse' ? '#8B5CF6' : relType === 'sibling' ? '#F97316' : '#3B82F6',
        strokeDasharray: relType === 'spouse' ? '5,5' : undefined,
        strokeWidth: relType === 'spouse' ? 6 : 5,
        opacity: 1,
        zIndex: 1000,
      },
      data: { type: relType }
    }
    setEdges(eds => addEdge(newEdge, eds))
  }, [onAddRelationship])

  // Add a new relative
  const addRelative = (parentId: string, type: RelType) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    // Calculate position offset based on relationship type
    const OFFSET = {
      parent: { x: 0, y: -200 },
      child: { x: 0, y: 200 },
      spouse: { x: 250, y: 0 },
      sibling: { x: 200, y: 0 },
    }[type]

    const newNodeId = uuid()
    const newMember: Partial<MemberRow> = {
      name: `New ${type}`,
      birthdate: null,
      photo_path: null,
      summary: null,
    }

    const newNode: Node = {
      id: newNodeId,
      type: 'familyNode',
      position: {
        x: parent.position.x + OFFSET.x,
        y: parent.position.y + OFFSET.y,
      },
      data: newMember,
    }

    // Determine source and target handles based on relationship type
    let sourceHandle = 'child'
    let targetHandle = 'parent'
    
    if (type === 'spouse') {
      sourceHandle = 'spouse-source'
      targetHandle = 'spouse-target'
    } else if (type === 'sibling') {
      sourceHandle = 'sibling-source'
      targetHandle = 'sibling-target'
    }
    
    const newEdge: Edge = {
      id: uuid(),
      source: parentId,
      target: newNodeId,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: 'default',
      animated: false,
      style: {
        stroke: type === 'spouse' ? '#8B5CF6' : type === 'sibling' ? '#F97316' : '#3B82F6',
        strokeDasharray: type === 'spouse' ? '5,5' : undefined,
        strokeWidth: type === 'spouse' ? 6 : 5,
        opacity: 1,
        zIndex: 1000,
      },
      data: { type }
    }

    setNodes(nds => nds.concat(newNode))
    setEdges(eds => eds.concat(newEdge))

    // Call callbacks to persist changes
    if (onAddMember) {
      onAddMember(newMember)
    }
    if (onAddRelationship) {
      const persistType: 'parent' | 'spouse' | 'sibling' = type === 'child' ? 'parent' : type
      onAddRelationship({
        a_id: parentId,
        b_id: newNodeId,
        type: persistType
      })
    }
  }

  // Handle node click to show add menu
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setMenuPosition({ x: event.clientX, y: event.clientY })
    setShowAddMenu(true)
  }, [])

  // Handle canvas click to hide menu
  const onPaneClick = useCallback(() => {
    setShowAddMenu(false)
    setSelectedNode(null)
  }, [])

  // Handle add relative button clicks
  const handleAddRelative = (type: RelType) => {
    if (selectedNode) {
      addRelative(selectedNode.id, type)
    }
    setShowAddMenu(false)
    setSelectedNode(null)
  }

  return (
    <div className="w-full h-[600px] relative" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'default',
            animated: false,
            style: { stroke: '#3B82F6', strokeWidth: 5, opacity: 1, zIndex: 1000 }
          }}
          onNodeDragStop={async (_e, node) => {
            // Persist position for real members only (skip placeholders)
            const member = members.find(m => m.id === node.id)
            if (!member) return
            try {
              await updateMember(node.id, {
                position_x: Math.round(node.position.x),
                position_y: Math.round(node.position.y),
              })
            } catch {
              // ignore
            }
          }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Add Relative Menu */}
        {showAddMenu && selectedNode && (
          <div
            className="absolute bg-white border rounded-lg shadow-lg p-2 z-10"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px'
            }}
          >
            <div className="text-xs font-medium text-gray-700 mb-2 px-2">
              Add relative to {selectedNode.data.name}
            </div>
                         <div className="space-y-1">
               <button
                 onClick={() => handleAddRelative('parent')}
                 className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
               >
                 Add Parent
               </button>
               <button
                 onClick={() => handleAddRelative('child')}
                 className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
               >
                 Add Child
               </button>
               <button
                 onClick={() => handleAddRelative('spouse')}
                 className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
               >
                 Add Spouse
               </button>
               <button
                 onClick={() => handleAddRelative('sibling')}
                 className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
               >
                 Add Sibling
               </button>
             </div>
          </div>
        )}

                 {/* Legend */}
         <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm">
           <div className="text-xs text-gray-600 space-y-1">
             <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-blue-500"></div>
               <span>Parent-Child</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-purple-500 border-t-2 border-dashed border-purple-500"></div>
               <span>Spouse</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-orange-500"></div>
               <span>Sibling</span>
             </div>
           </div>
         </div>
      </ReactFlowProvider>
    </div>
  )
}
