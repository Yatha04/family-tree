// This legacy component is kept for reference. React Flow-based `FamilyTreeBuilder` is the primary implementation.
// Consider removing this file if no longer used.
'use client'

import { useMemo, useRef, useState } from 'react'

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

interface TreeVisualizationProps {
  members: Member[]
  relationships: Relationship[]
}

interface Node {
  id: string
  member: Member
  x: number
  y: number
  connections: Connection[]
}

interface Connection {
  targetId: string
  type: 'parent' | 'spouse'
  relationshipId: string
}

export default function TreeVisualization({ members, relationships }: TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Build graph structure with proper relationship handling
  const nodes = useMemo(() => {
    if (members.length === 0) return []

    // Create nodes map to ensure each person appears only once
    const nodesMap = new Map<string, Node>()
    
    members.forEach(member => {
      nodesMap.set(member.id, {
        id: member.id,
        member,
        x: 0,
        y: 0,
        connections: []
      })
    })

    // Build connections
    relationships.forEach(rel => {
      const nodeA = nodesMap.get(rel.a_id)
      const nodeB = nodesMap.get(rel.b_id)
      
      if (nodeA && nodeB) {
        nodeA.connections.push({
          targetId: rel.b_id,
          type: rel.type as 'parent' | 'spouse',
          relationshipId: rel.id
        })
        
        // For spouse relationships, add reverse connection
        if (rel.type === 'spouse') {
          nodeB.connections.push({
            targetId: rel.a_id,
            type: 'spouse',
            relationshipId: rel.id
          })
        }
      }
    })

    return Array.from(nodesMap.values())
  }, [members, relationships])

  // Layout algorithm - simple force-directed layout
  const layoutNodes = useMemo(() => {
    if (nodes.length === 0) return []

    const nodeRadius = 60
    const spacing = 150
    const iterations = 100
    const repulsion = 200
    const attraction = 0.1

    // Initialize positions in a circle
    const centerX = 400
    const centerY = 300
    const radius = Math.min(300, nodes.length * 50)
    
    const positionedNodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
    })

    // Force-directed layout
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < positionedNodes.length; i++) {
        for (let j = i + 1; j < positionedNodes.length; j++) {
          const dx = positionedNodes[j].x - positionedNodes[i].x
          const dy = positionedNodes[j].y - positionedNodes[i].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            const force = repulsion / (distance * distance)
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force
            
            positionedNodes[i].x -= fx
            positionedNodes[i].y -= fy
            positionedNodes[j].x += fx
            positionedNodes[j].y += fy
          }
        }
      }

      // Attraction between connected nodes
      positionedNodes.forEach(node => {
        node.connections.forEach(conn => {
          const target = positionedNodes.find(n => n.id === conn.targetId)
          if (target) {
            const dx = target.x - node.x
            const dy = target.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > spacing) {
              const force = (distance - spacing) * attraction
              const fx = (dx / distance) * force
              const fy = (dy / distance) * force
              
              node.x += fx
              node.y += fy
              target.x -= fx
              target.y -= fy
            }
          }
        })
      })
    }

    return positionedNodes
  }, [nodes])

  // Handle zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (layoutNodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No family tree data to display</p>
      </div>
    )
  }

  return (
    <div className="relative border rounded-lg overflow-hidden bg-gray-50">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-sm"
        >
          Reset View
        </button>
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-sm"
        >
          Zoom In
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-sm"
        >
          Zoom Out
        </button>
      </div>

      {/* Tree Visualization */}
      <div
        className="w-full h-96 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Draw connections first (behind nodes) */}
          {layoutNodes.map(node => (
            <g key={`connections-${node.id}`}>
              {node.connections.map(conn => {
                const target = layoutNodes.find(n => n.id === conn.targetId)
                if (!target) return null

                const isSpouse = conn.type === 'spouse'
                const isParent = conn.type === 'parent'
                
                return (
                  <line
                    key={`${node.id}-${conn.targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isSpouse ? "#8B5CF6" : "#3B82F6"}
                    strokeWidth={isSpouse ? 3 : 2}
                    strokeDasharray={isSpouse ? "5,5" : "none"}
                    opacity={0.6}
                  />
                )
              })}
            </g>
          ))}

          {/* Draw nodes */}
          {layoutNodes.map(node => (
            <g key={node.id}>
              {/* Node background */}
              <circle
                cx={node.x}
                cy={node.y}
                r="50"
                fill="white"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              
                             {/* Photo or avatar */}
                 {node.member.photo_path ? (
                 <>
                   <defs>
                     <clipPath id={`clip-${node.id}`}>
                       <circle cx={node.x} cy={node.y} r="40" />
                     </clipPath>
                   </defs>
                    <image  
                      href={node.member.photo_path}
                     x={node.x - 40}
                     y={node.y - 40}
                     width="80"
                     height="80"
                     clipPath={`url(#clip-${node.id})`}
                   />
                 </>
               ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  fill="#F3F4F6"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
              )}

              {/* Name */}
              <text
                x={node.x}
                y={node.y + 70}
                textAnchor="middle"
                fill="#111827"
                fontSize="12"
                fontWeight="500"
              >
                {node.member.name}
              </text>

              {/* Birth year */}
              {node.member.birthdate && (
                <text
                  x={node.x}
                  y={node.y + 85}
                  textAnchor="middle"
                  fill="#6B7280"
                  fontSize="10"
                >
                  {new Date(node.member.birthdate).getFullYear()}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

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
    </div>
  )
}
