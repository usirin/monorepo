import "./styles.css";

import "@radix-ui/themes/styles.css";

export default function Layout(props: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<title>u5</title>
			</head>
			<body>{props.children}</body>
		</html>
	);
}
