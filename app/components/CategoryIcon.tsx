"use client"

import {
  MessageCircle,
  PenTool,
  Image,
  Code,
  Video,
  Music,
  BarChart3,
  Search,
  Zap,
  Palette,
  Wrench,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<any>> = {
  "message-circle": MessageCircle,
  "pen-tool": PenTool,
  image: Image,
  code: Code,
  video: Video,
  music: Music,
  "bar-chart-3": BarChart3,
  search: Search,
  zap: Zap,
  palette: Palette,
}

export function CategoryIcon({
  name,
  size = 24,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const Icon = iconMap[name] || Wrench
  return <Icon size={size} className={className} />
}
