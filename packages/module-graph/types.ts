export interface ModuleInfo {
	path: string;
	imports: Import[];
	exports: Export[];
	hasModuleSyntax: boolean;
	facade: boolean;
}

export type Import = NamedImport | DefaultImport | NamespaceImport;

export interface NamedImport {
	kind: "named";
	names: {local: string; imported: string}[];
	source: string;
}

export interface DefaultImport {
	kind: "default";
	local: string;
	source: string;
}

export interface NamespaceImport {
	kind: "namespace";
	local: string;
	source: string;
}

export type Export = NamedExport | DefaultExport | AllExport;

export interface NamedExport {
	kind: "named";
	names: {local: string; exported: string}[];
	source?: string; // For re-exports
}

export interface DefaultExport {
	kind: "default";
	expression?: string; // For inline default exports
}

export interface AllExport {
	kind: "all";
	source: string;
}

export interface ModuleGraph {
	modules: Map<string, ModuleInfo>;
	buildFromEntry(entryFile: string): Promise<void>;
	getDependencies(modulePath: string): string[];
	getImporters(modulePath: string): string[];
	getModuleInfo(modulePath: string): ModuleInfo | undefined;
}
