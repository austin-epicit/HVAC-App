export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: {
		code: string;
		message: string;
	} | null;
	meta?: {
		timestamp: string;
		count?: number;
	};
}