import {promises as fs} from "node:fs";
import {type ExportSpecifier, type ImportSpecifier, moduleLexerSync, parseSync} from "oxc-parser";
import type {Export, ModuleGraph as IModuleGraph, Import, ModuleInfo} from "./types";

export class ModuleGraph implements IModuleGraph {
	modules: Map<string, ModuleInfo> = new Map();

	async buildFromEntry(entryFile: string): Promise<void> {
		const content = await fs.readFile(entryFile, "utf-8");
		const {imports, exports} = moduleLexerSync(content);
		const ret = parseSync(content);
		console.log("ret", JSON.parse(ret.program));
		console.log("comments", ret.comments);

		console.log("imports", imports);
		console.log("exports", exports);

		const moduleInfo: ModuleInfo = {
			path: entryFile,
			imports: imports.map((imp) => this.convertImport(imp)),
			exports: exports.map((exp) => this.convertExport(exp)),
			hasModuleSyntax: true,
			facade: false,
		};

		this.modules.set(entryFile, moduleInfo);
	}

	private convertImport(imp: ImportSpecifier): Import {
		if ("n" in imp) {
			return {
				kind: "namespace",
				local: imp.n,
				source: imp.s,
			};
		}
		if ("d" in imp) {
			return {
				kind: "default",
				local: imp.d,
				source: imp.s,
			};
		}
		if ("l" in imp && "i" in imp) {
			return {
				kind: "named",
				names: [{local: imp.l, imported: imp.i}],
				source: imp.s,
			};
		}
		throw new Error(`Unknown import type: ${JSON.stringify(imp)}`);
	}

	private convertExport(exp: ExportSpecifier): Export {
		if ("n" in exp) {
			return {
				kind: "all",
				source: exp.s,
			};
		} else if ("d" in exp) {
			return {
				kind: "default",
				expression: exp.d,
			};
		} else if ("l" in exp && "e" in exp) {
			return {
				kind: "named",
				names: [{local: exp.l, exported: exp.e}],
			};
		} else {
			throw new Error(`Unknown export type: ${JSON.stringify(exp)}`);
		}
	}

	getDependencies(modulePath: string): string[] {
		throw new Error("Method not implemented.");
	}

	getImporters(modulePath: string): string[] {
		throw new Error("Method not implemented.");
	}

	getModuleInfo(modulePath: string): ModuleInfo | undefined {
		throw new Error("Method not implemented.");
	}
}
