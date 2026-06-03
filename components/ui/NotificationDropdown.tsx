"use client"

import { useState } from "react"
import { Bell, FileText, Check, Trash2 } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
    const [open, setOpen] = useState(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4 pb-2">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={markAllAsRead}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                                onClick={clearNotifications}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col p-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between w-full gap-2">
                                        <div className="flex items-center gap-2">
                                            {notification.type === 'report' && <FileText className="w-4 h-4 text-blue-500" />}
                                            {notification.type === 'alert' && <Bell className="w-4 h-4 text-orange-500" />}
                                            <span className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                                        {notification.message}
                                    </p>
                                    {notification.link && (
                                        <Link href={notification.link} className="w-full mt-2 pl-6">
                                            <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                                                View Report
                                            </Button>
                                        </Link>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
