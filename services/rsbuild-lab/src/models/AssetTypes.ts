export interface AssetMetadata {
	readonly url: string;
	readonly type: AssetType;
	readonly priority: AssetPriority;
	readonly size?: number;
	readonly format?: string;
}

export enum AssetType {
	MODEL = "model",
	TEXTURE = "texture",
	AUDIO = "audio",
	SHADER = "shader",
}

export enum AssetPriority {
	CRITICAL = "critical",
	ENHANCEMENT = "enhancement",
	OPTIONAL = "optional",
}

export interface LoadedAsset {
	readonly url: string;
	readonly type: AssetType;
	readonly data: unknown;
	readonly loaded: boolean;
	readonly loadTime?: number;
	readonly size?: number;
}

export interface AssetError {
	readonly type: AssetErrorType;
	readonly asset: string;
	readonly message: string;
	readonly originalError?: Error;
}

export enum AssetErrorType {
	MODEL_LOAD_ERROR = "ModelLoadError",
	AUDIO_LOAD_ERROR = "AudioLoadError",
	TEXTURE_LOAD_ERROR = "TextureLoadError",
	NETWORK_ERROR = "NetworkError",
	PARSE_ERROR = "ParseError",
}

export interface AssetLoadProgress {
	readonly totalAssets: number;
	readonly loadedAssets: number;
	readonly failedAssets: number;
	readonly currentAsset?: string;
	readonly percentage: number;
}
