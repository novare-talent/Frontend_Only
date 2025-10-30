"use client"

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  
  const isActivePath = (itemUrl: string) => {
    // Remove trailing slashes from both paths for comparison
    const cleanItemUrl = itemUrl.replace(/\/$/, '')
    const cleanPathname = pathname.replace(/\/$/, '')
    return cleanPathname === cleanItemUrl
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (            <SidebarMenuItem key={item.title}>
              <a href={item.url} about={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                className={`hover:bg-purple-100 hover:text-purple-600 ${
                  isActivePath(item.url) ? 'bg-purple-100 text-purple-600' : ''
                }`}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
            
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
