const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface GenerateRequest {
    text: string;
    slideCount?: number;
    type?: 'pptx' | 'pdf';
}

export interface GenerateResponse {
    status: 'success' | 'error';
    data?: {
        filename: string;
        contentType: string;
        fileBase64: string;
    };
    message?: string;
}

export const apiClient = {
    healthCheck: async () => {
        try {
            const res = await fetch(`${API_URL}/health`);
            return res.json();
        } catch (error) {
            console.error('Health check failed', error);
            throw error;
        }
    },

    generatePresentation: async (payload: GenerateRequest): Promise<GenerateResponse> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        try {
            const res = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return res.json();
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again with less text or fewer slides.');
            }
            throw error;
        }
    },
};
