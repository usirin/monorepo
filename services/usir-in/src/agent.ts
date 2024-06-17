import type {LanguageModel as LM} from "ai";

interface LanguageModel {
	model: LM;
}

export class Agent {
	private model: LanguageModel;
	constructor(model: LanguageModel) {
		this.model = model;
	}
}
