import {count} from "./count";
// this is a common js require
const assign = require("lodash.assign");

export const foo = () => {
	return assign({count: count()}, {foo: "bar"});
};
