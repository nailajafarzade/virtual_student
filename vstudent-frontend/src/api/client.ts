import type {
    AdminTeacherSummary,
    Credentials,
    CurriculumTopic,
    CurriculumTopicInput,
    PasswordResetResult,
    ProgressResponse,
    SessionReport,
    SessionResponse,
    SessionSummary,
    TeacherProfile,
    Turn,
} from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

function authHeader(credentials: Credentials): string {
    return 'Basic ' + btoa(`${credentials.email}:${credentials.password}`);
}

async function request<T>(
    path: string,
    credentials: Credentials | null,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    if (credentials) {
        headers.set('Authorization', authHeader(credentials));
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    } catch {
        throw new ApiError(0, 'Cannot connect to Virtual Student. Check your connection and try again. If this continues, contact support.');
    }

    if (!response.ok) {
        const body = await response.text();
        let message = body;
        try {
            const parsed = JSON.parse(body);
            const detail = parsed.error ?? parsed.message ?? parsed.detail;
            message = typeof detail === 'string' ? detail : '';
        } catch {
            // body JSON deyil — xam mətnlə davam et
        }
        const fallback = response.status === 401
            ? 'Your sign-in details are no longer valid. Please sign in again.'
            : response.status === 403
                ? 'You do not have permission to perform this action.'
                : 'The request could not be completed. Please try again.';
        if ([502, 503, 504].includes(response.status)) {
            message = 'Lumi could not respond because the AI service is unavailable or took too long. Please try again shortly. If this continues, contact support.';
        } else if (response.status >= 500 || !response.headers.get('content-type')?.includes('application/json')) {
            message = fallback;
        }
        throw new ApiError(response.status, message || fallback);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json() as Promise<T>;
    }
    return undefined as T;
}

// ---------- Auth / teachers ----------

export async function registerTeacher(name: string, email: string, password: string): Promise<TeacherProfile> {
    return request<TeacherProfile>('/api/v1/teachers/register', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
}

export async function getCurrentTeacher(credentials: Credentials): Promise<TeacherProfile> {
    return request<TeacherProfile>('/api/v1/teachers/me', credentials);
}

export async function changeOwnPassword(
    credentials: Credentials,
    currentPassword: string,
    newPassword: string,
): Promise<void> {
    return request<void>('/api/v1/teachers/me/password', credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

// ---------- Curriculum ----------

export async function getCurriculumTopics(credentials: Credentials): Promise<CurriculumTopic[]> {
    return request<CurriculumTopic[]>('/api/v1/curriculum-topics', credentials);
}

export async function createCurriculumTopic(
    credentials: Credentials,
    input: CurriculumTopicInput,
): Promise<CurriculumTopic> {
    return request<CurriculumTopic>('/api/v1/curriculum-topics', credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
}

export async function updateCurriculumTopic(
    credentials: Credentials,
    id: number,
    input: CurriculumTopicInput,
): Promise<CurriculumTopic> {
    return request<CurriculumTopic>(`/api/v1/curriculum-topics/${id}`, credentials, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
}

export async function deleteCurriculumTopic(credentials: Credentials, id: number): Promise<void> {
    return request<void>(`/api/v1/curriculum-topics/${id}`, credentials, { method: 'DELETE' });
}

// ---------- Sessions ----------

export async function listSessions(credentials: Credentials): Promise<SessionSummary[]> {
    return request<SessionSummary[]>('/api/v1/sessions', credentials);
}

export async function getSession(credentials: Credentials, sessionId: number): Promise<SessionResponse> {
    return request<SessionResponse>(`/api/v1/sessions/${sessionId}`, credentials);
}

export async function startSession(credentials: Credentials, curriculumTopicId: number): Promise<SessionResponse> {
    return request<SessionResponse>('/api/v1/sessions', credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumTopicId }),
    });
}

export async function changeSessionTopic(
    credentials: Credentials,
    sessionId: number,
    curriculumTopicId: number,
): Promise<SessionResponse> {
    return request<SessionResponse>(`/api/v1/sessions/${sessionId}/topic`, credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumTopicId }),
    });
}

export async function endSession(credentials: Credentials, sessionId: number): Promise<SessionResponse> {
    return request<SessionResponse>(`/api/v1/sessions/${sessionId}/end`, credentials, { method: 'POST' });
}

export async function getSessionReport(credentials: Credentials, sessionId: number): Promise<SessionReport> {
    return request<SessionReport>(`/api/v1/sessions/${sessionId}/report`, credentials);
}

export async function getProgress(credentials: Credentials): Promise<ProgressResponse> {
    return request<ProgressResponse>('/api/v1/progress', credentials);
}

// ---------- Turns ----------

export async function submitTextTurn(
    credentials: Credentials,
    sessionId: number,
    teacherUtterance: string,
): Promise<Turn> {
    return request<Turn>(`/api/v1/sessions/${sessionId}/turns`, credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherUtterance }),
    });
}

export async function submitAudioTurn(
    credentials: Credentials,
    sessionId: number,
    audioBlob: Blob,
): Promise<Turn> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    // Content-Type qəsdən qoyulmur — brauzer multipart boundary-ni özü əlavə edir.
    return request<Turn>(`/api/v1/sessions/${sessionId}/turns/audio`, credentials, {
        method: 'POST',
        body: formData,
    });
}

export async function getTurns(credentials: Credentials, sessionId: number): Promise<Turn[]> {
    return request<Turn[]>(`/api/v1/sessions/${sessionId}/turns`, credentials);
}

export function turnAudioUrl(audioUrl: string): string {
    return `${API_BASE_URL}${audioUrl}`;
}

export async function fetchTurnAudioBlob(credentials: Credentials, audioUrl: string): Promise<Blob> {
    // <audio src> Authorization header göndərə bilmir, ona görə fetch + object URL.
    const response = await fetch(turnAudioUrl(audioUrl), {
        headers: { Authorization: authHeader(credentials) },
    });
    if (!response.ok) {
        throw new ApiError(response.status, `Could not load audio: ${response.status}`);
    }
    return response.blob();
}

// ---------- Admin ----------

export async function listTeachersAdmin(credentials: Credentials): Promise<AdminTeacherSummary[]> {
    return request<AdminTeacherSummary[]>('/api/v1/admin/teachers', credentials);
}

export async function getTeacherProgress(credentials: Credentials, teacherId: number): Promise<ProgressResponse> {
    return request<ProgressResponse>(`/api/v1/admin/teachers/${teacherId}/progress`, credentials);
}

export async function changeTeacherRole(
    credentials: Credentials,
    teacherId: number,
    role: 'TEACHER' | 'ADMIN',
): Promise<AdminTeacherSummary> {
    return request<AdminTeacherSummary>(`/api/v1/admin/teachers/${teacherId}/role`, credentials, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    });
}

export async function resetTeacherPassword(credentials: Credentials, teacherId: number): Promise<PasswordResetResult> {
    return request<PasswordResetResult>(`/api/v1/admin/teachers/${teacherId}/reset-password`, credentials, {
        method: 'POST',
    });
}
