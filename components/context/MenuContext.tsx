"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextType {
    isOpen: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    return (
        <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error("useMenu must be used within a MenuProvider");
    }
    return context;
}
