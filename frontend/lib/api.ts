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
        const res = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return res.json();
    },
};
