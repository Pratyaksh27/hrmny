"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

return (
    <Menu as="div" className="relative">
        <Menu.Button className="text-brand focus:oulline-none">
            <MenuIcon className="w-6 h-6" />
        </Menu.Button>
        <Menu.Items className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg bg-white text-black border-black z-50">
            <div className="py-1">
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => router.push("/start-new-case")}
                            className={`block w-full text-center px-4 py-2 text-sm bg-sidebar text-brand ${
                                active ? "bg-brand text-sidebar" : ""
                            }`}
                        >
                            Start New Case
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => router.push("/revisit-case")}
                            className={`block w-full text-center px-4 py-2 text-sm bg-sidebar text-brand ${
                                 active ? "bg-brand text-sidebar" : ""
                            }`}
                        >
                            Revisit Existing Case
                        </button>
                    )}
                </Menu.Item>
            </div>
        </Menu.Items>
    </Menu>    
);
}