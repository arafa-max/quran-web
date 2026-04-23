import type { NavLinkProps } from "react-router-dom";

export const linkClass: NavLinkProps["className"] = ({ isActive }) =>
    `group flex items-center gap-3 py-2 rounded-lg transition  ${isActive
        ? "active text-[#2D3748] before:absolute before:left-67 before:h-10 before:w-1 before:bg-[#2736AF] before:rounded-l-4xl"
        : "text-[#718096] hover:bg-gray-100"
    }`;
type MenuItem = {
    label: string;
    path: string;
    Icon: string;
    hasNotification?: boolean;
};
export const menuItem: MenuItem[] = [
    { label: "Dashboard", path: "/Dashboard", Icon: "/chart.svg" },
    {
        label: "My neighborhood",
        path: "/MyNeighborhood",
        Icon: "/building-4.svg",
    },
    {
        label: "Car detections",
        path: "/CarDetections",

        Icon: "/Speedometer.svg",
    },
    {
        label: "Vehicle of interest",
        path: "/Vehicle",
        Icon: "/Vehicle of interest.svg",
    },
    {
        label: "Live cameras",
        path: "/LiveCameras",
        Icon: "/video.svg",
    },
    {
        label: "Residents",
        path: "/Residents",
        Icon: "/profile-tick.svg",
    },
    {
        label: "Discussions",
        path: "/Discussions",
        Icon: "/message-text.png",
    },
];
