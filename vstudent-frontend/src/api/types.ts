export interface Credentials {
    email: string;
    password: string;
}

export interface TeacherProfile {
    id: number;
    name: string;
    email: string;
    role: 'TEACHER' | 'ADMIN';
}

export interface CurriculumTopic {
    id: number;
    name: string;
    objective: string;
    difficultyLevel: number;
    exampleQuestions: string[];
    acceptableAnswers: string[];
    commonMisconceptions: string[];
}

export interface CurriculumTopicInput {
    name: string;
    objective: string;
    difficultyLevel: number;
    exampleQuestions: string[];
    acceptableAnswers: string[];
    commonMisconceptions: string[];
}

export interface ChildStateResponse {
    attention: number;
    engagement: number;
    confidence: number;
    motivation: number;
    curiosity: number;
    frustration: number;
    fatigue: number;
    emotionalState: string;
    topicKnowledge: Record<string, number>;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    turnCount: number;
}

export interface TeacherSignal {
    signalType: string;
    value: string;
}

export interface LessonGuidance {
    recommendation: 'CONTINUE' | 'READY_TO_ADVANCE' | 'CONSIDER_EASIER_TOPIC';
    suggestedTopicId: number | null;
    suggestedTopicName: string | null;
}

export interface Turn {
    id: number;
    sequenceNo: number;
    teacherUtteranceText: string;
    childResponseText: string;
    audioUrl: string | null;
    outcome: string;
    validationPassed: boolean;
    timestamp: string;
    childState: ChildStateResponse | null;
    teacherSignals: TeacherSignal[];
    lessonGuidance: LessonGuidance | null;
}

export interface SessionResponse {
    id: number;
    curriculumTopicId: number;
    curriculumTopicName: string;
    startedAt: string;
    endedAt: string | null;
    status: 'ACTIVE' | 'ENDED';
}

export interface SessionSummary {
    id: number;
    curriculumTopicName: string;
    startedAt: string;
    endedAt: string | null;
    status: 'ACTIVE' | 'ENDED';
    turnCount: number;
}

export interface SessionReport {
    sessionId: number;
    generatedAt: string;
    metrics: Record<string, string>;
    highlights: string[];
    summaryText: string;
}

export interface SessionProgressPoint {
    sessionId: number;
    startedAt: string;
    curriculumTopicName: string;
    totalTurns: number;
    encouragementRate: number | null;
    checksUnderstandingRate: number | null;
    openQuestionRatio: number | null;
    mistakeHandlingRate: number | null;
    confidenceEnd: number | null;
}

export interface MetricTrend {
    metricName: string;
    mostRecent: number | null;
    previousAverage: number | null;
    direction: 'up' | 'down' | 'flat' | 'insufficient_data';
}

export interface ProgressResponse {
    sessions: SessionProgressPoint[];
    trends: MetricTrend[];
    narrativeText: string;
}

export interface AdminTeacherSummary {
    id: number;
    name: string;
    email: string;
    role: 'TEACHER' | 'ADMIN';
    totalSessions: number;
    completedSessions: number;
    lastSessionAt: string | null;
}

export interface PasswordResetResult {
    temporaryPassword: string;
}