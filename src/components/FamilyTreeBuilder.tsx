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
} from 'reactflow'
import 'reactflow/dist/style.css'
import { v4 as uuid } from 'uuid'

interface Member {
  id: string
  name: string
  birthdate: string | null
  photo_path: string | null
  summary: string | null
  created_at: string
}

interface Relationship {
  id: string
  a_id: string
  b_id: string
  type: string
}

interface FamilyTreeBuilderProps {
  members: Member[]
  relationships: Relationship[]
  onAddMember?: (member: Partial<Member>) => void
  onAddRelationship?: (relationship: Partial<Relationship>) => void
}

// Define the node data type for React Flow
type NodeData = Member & { isPlaceholder?: boolean }

type RelType = 'parent' | 'spouse' | 'child'

// Hierarchical layout function
const applyHierarchicalLayout = (nodes: any[], relationships: Relationship[]) => {
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
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-md min-w-[120px]">
      {/* Photo or avatar */}
      <div className="flex justify-center mb-2">
        {data.photo_path ? (
          <img
            src={data.photo_path}
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
      return
    }

    // Convert existing members to React Flow nodes
    const memberNodes: any[] = members.map((member, index) => ({
      id: member.id,
      type: 'familyNode',
      position: { 
        x: index * 200 - (members.length - 1) * 100, 
        y: 0 
      },
      data: member,
    }))

    setNodes(memberNodes)

    // Convert existing relationships to React Flow edges
    const relationshipEdges: Edge[] = relationships.map(rel => ({
      id: rel.id,
      source: rel.a_id,
      target: rel.b_id,
      animated: false,
      style: {
        stroke: rel.type === 'spouse' ? '#8B5CF6' : '#3B82F6',
        strokeDasharray: rel.type === 'spouse' ? '5,5' : undefined,
        strokeWidth: rel.type === 'spouse' ? 3 : 2,
      },
      data: { type: rel.type }
    }))

    setEdges(relationshipEdges)
    
    // Apply hierarchical layout for parent-child relationships
    if (relationships.length > 0) {
      const updatedNodes = [...memberNodes]
      
      // Find root nodes (nodes with no parents)
      const childIds = new Set(relationships.filter(r => r.type === 'parent').map(r => r.b_id))
      const rootNodes = memberNodes.filter(node => !childIds.has(node.id))
      
      // Apply hierarchical positioning
      const positionedNodes = applyHierarchicalLayout(updatedNodes, relationships)
      setNodes(positionedNodes)
    } else {
      setNodes(memberNodes)
    }
  }, [members, relationships])

  // Handle connecting existing nodes
  const onConnect = useCallback((params: Connection) => {
    if (onAddRelationship) {
      onAddRelationship({
        a_id: params.source!,
        b_id: params.target!,
        type: 'parent' // Default type, could be enhanced with a selector
      })
    }
    setEdges(eds => addEdge({ ...params, id: uuid() }, eds))
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
    }[type]

    const newNodeId = uuid()
    const newMember: Partial<Member> = {
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

    const newEdge: Edge = {
      id: uuid(),
      source: parentId,
      target: newNodeId,
      animated: false,
      style: {
        stroke: type === 'spouse' ? '#8B5CF6' : '#3B82F6',
        strokeDasharray: type === 'spouse' ? '5,5' : undefined,
        strokeWidth: type === 'spouse' ? 3 : 2,
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
      onAddRelationship({
        a_id: parentId,
        b_id: newNodeId,
        type
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
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
