"use client";

import {readStreamableValue} from "ai/rsc";
import {useState} from "react";
import {generate} from "./actions";

export function Generation() {
	const [generation, setGeneration] = useState<string>("");
	const [question, setQuestion] = useState<string>("");

	return (
		<div>
			<button type="reset" onClick={() => setGeneration("")}>
				Reset
			</button>
			<button
				type="button"
				onClick={async () => {
					const {output} = await generate(question);

					for await (const delta of readStreamableValue(output)) {
						setGeneration((currentGeneration) => `${currentGeneration}${delta}`);
					}
				}}
			>
				Ask
			</button>

			<div style={{fontFamily: "monospace", paddingTop: 10}}>{generation}</div>
		</div>
	);
}
