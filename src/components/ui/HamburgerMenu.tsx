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
        <Menu.Items className="absolute mt-2 w-48 rounded-md shadow-lg bg-white text-black z-50">
            <div className="py-1">
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => router.push("/start-new-case")}
                            className={`${
                                active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm`}
                        >
                            Start New Case
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => router.push("/revisit-case")}
                            className={`${
                                active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm`}
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