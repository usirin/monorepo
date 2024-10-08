import {Counter} from "./Counter";
import {Generation} from "./Generation";
import {Sandpack} from "./Sandpack";
import {Scratch} from "./Scratch";
import {ThemePanel as ThemeSettings} from "./ThemeSettings";
import {Time} from "./Time";
import {ChatWidget} from "./ai/ChatWidget";

export const widgets = {
	counter: <Counter />,
	sandpack: <Sandpack />,
	scratch: <Scratch />,
	time: <Time />,
	"theme-settings": <ThemeSettings />,
	generation: <Generation />,
	chat: <ChatWidget />,
};
