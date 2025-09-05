#!/usr/bin/env bun

import {McpServer} from "@effect/ai";
import {BunRuntime, BunSink, BunStream} from "@effect/platform-bun";
import {Effect, Layer, Logger} from "effect";

// Simple accounts prompt - generates context about accounts
const AccountsPrompt = McpServer.prompt({
	name: "Account Summary",
	description: "Generate a summary of SimpleFin accounts",
	content: () =>
		Effect.succeed("Please fetch and summarize the current account balances from SimpleFin."),
});

// Simple test prompt for transactions
const TransactionsPrompt = McpServer.prompt({
	name: "Get Transactions",
	description: "Generate a prompt to get account transactions",
	content: () =>
		Effect.succeed("Please fetch the recent transaction history for SimpleFin accounts."),
});

// Create the MCP server layer
const ServerLayer = Layer.mergeAll(AccountsPrompt, TransactionsPrompt).pipe(
	Layer.provide(
		McpServer.layerStdio({
			name: "SimpleFin MCP Server",
			version: "1.0.0",
			stdin: BunStream.stdin,
			stdout: BunSink.stdout,
		}),
	),
	Layer.provide(Logger.add(Logger.prettyLogger({stderr: true}))),
);

// Launch the server
Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
