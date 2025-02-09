"use client";

import dynamic from "next/dynamic";

const StudioContainer = dynamic(
	() => import("~/studio/container").then((mod) => mod.StudioContainer),
	{ssr: false},
);

export default function HomePage() {
	return <StudioContainer />;
}
