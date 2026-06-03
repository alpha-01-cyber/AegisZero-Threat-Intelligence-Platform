"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface UserContextType {
    username: string
    setUsername: (name: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState("Analyst")

    useEffect(() => {
        const stored = localStorage.getItem("aegis_username")
        if (stored) {
            setUsername(stored)
        }
    }, [])

    const handleSetUsername = (name: string) => {
        setUsername(name)
        localStorage.setItem("aegis_username", name)
    }

    return (
        <UserContext.Provider value={{ username, setUsername: handleSetUsername }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}
