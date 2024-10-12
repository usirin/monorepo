import {createStore} from "tinybase/with-schemas";

const store = createStore()
	.setValuesSchema({
		root: {type: "string"},
	})
	.setTablesSchema({
		windows: {
			id: {type: "string"},
			key: {type: "string"},
		},
	});
