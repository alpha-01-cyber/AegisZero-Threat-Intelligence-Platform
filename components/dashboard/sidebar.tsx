"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Shield, Activity, Globe, BarChart3, Search, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { href: "/active-threats", icon: Activity, label: "Active Threats" },
    { href: "/network-map", icon: Globe, label: "Network Map" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/ioc-search", icon: Search, label: "IOC Search" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "80px" }
  }

  return (
    <motion.div
      className={cn("relative border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block", className)}
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        <div className={cn("flex h-14 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                AegisZero
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 hidden md:flex", isCollapsed && "absolute -right-4 top-3 z-50 bg-background border rounded-full shadow-md")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                >
                  <span
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors relative",
                      isActive ? "bg-accent text-accent-foreground" : "transparent",
                      isCollapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2", isActive && "text-primary")} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </motion.div>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const menuItems = [
    { href: "/active-threats", icon: Activity, label: "Active Threats" },
    { href: "/network-map", icon: Globe, label: "Network Map" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/ioc-search", icon: Search, label: "IOC Search" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
          <Shield className="h-6 w-6 text-primary" />
          <span>AegisZero</span>
        </Link>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                  pathname === item.href && "text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
