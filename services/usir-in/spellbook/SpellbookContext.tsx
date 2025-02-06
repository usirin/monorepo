"use client";
import {Spellbook} from "@usirin/spellbook";
import {type ReactNode, createContext, useCallback, useContext, useMemo, useState} from "react";
import {z} from "zod";
import {OrganizationsListCommand} from "./commands/OrganizationsListCommand";
import {ProjectCreateCommand} from "./commands/ProjectCreateCommand";
import {ProjectsListCommand} from "./commands/ProjectsListCommand";
import {UserProfileCommand} from "./commands/UserProfileCommand";

const spellbook = Spellbook.create()
	.command("projects:list", {
		description: "List all projects",
		meta: {
			group: "Projects",
			icon: "📋",
		},
		input: () => z.void(),
		execute: async () => {
			return <ProjectsListCommand />;
		},
	})
	.command("project:create", {
		description: "Create a new project",
		meta: {
			group: "Projects",
			icon: "🆕",
		},
		input: () => z.void(),
		execute: async () => {
			return <ProjectCreateCommand />;
		},
	})
	.command("organizations:list", {
		description: "List all organizations",
		meta: {
			group: "Organizations",
			icon: "🏢",
		},
		input: () => z.void(),
		execute: async () => {
			return <OrganizationsListCommand />;
		},
	})
	.command("user:profile", {
		description: "View your profile",
		meta: {
			group: "User",
			icon: "👤",
		},
		input: () => z.void(),
		execute: async () => {
			return <UserProfileCommand />;
		},
	})
	.build();

type NavigationApi = ReturnType<typeof useNavigationApi>;

const SpellbookContext = createContext<{
	spellbook: typeof spellbook;
	navigation: NavigationApi;
} | null>(null);

export function SpellbookContextManager({children}: {children: React.ReactNode}) {
	const navigation = useNavigationApi();

	return (
		<SpellbookContext.Provider value={{spellbook, navigation}}>
			{children}
		</SpellbookContext.Provider>
	);
}

function useNavigationApi() {
	const [stack, setStack] = useState<ReactNode[]>([]);

	const push = useCallback((node: ReactNode) => {
		setStack((stack) => [...stack, node]);
	}, []);

	const pop = useCallback(() => {
		setStack((paths) => paths.slice(0, -1));
	}, []);

	const peek = useCallback(() => {
		return stack[stack.length - 1];
	}, [stack]);

	return {paths: stack, push, pop, peek};
}

export function useSpellbook() {
	const spellbook = useContext(SpellbookContext);
	if (!spellbook) {
		throw new Error("Spellbook not found");
	}
	return spellbook;
}
