import type { LessonGuidance } from '../api/types';

interface LessonGuidanceBannerProps {
    guidance: LessonGuidance;
    onSwitchTopic: (topicId: number) => Promise<void>;
}

export function LessonGuidanceBanner({ guidance, onSwitchTopic }: LessonGuidanceBannerProps) {
    if (guidance.recommendation === 'CONTINUE') {
        return null;
    }

    const isAdvance = guidance.recommendation === 'READY_TO_ADVANCE';
    const message = isAdvance
        ? 'The child has answered correctly a couple of times in a row.'
        : 'The child seems to be struggling right now.';

    return (
        <div
            style={{
                border: `1px solid ${isAdvance ? '#86efac' : '#fca5a5'}`,
                background: isAdvance ? '#f0fdf4' : '#fef2f2',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                margin: '1rem 0',
                display: 'flex', flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
            }}
        >
      <span>
        {isAdvance ? '💡' : '⚠️'} {message}
          {guidance.suggestedTopicName
              ? ` Consider ${isAdvance ? 'moving to' : 'switching to'} "${guidance.suggestedTopicName}."`
              : isAdvance
                  ? ' No harder topic is set up yet.'
                  : ' No easier topic is available.'}
      </span>
            {guidance.suggestedTopicId != null && (
                <button onClick={() => onSwitchTopic(guidance.suggestedTopicId!)} style={{ whiteSpace: 'nowrap' }}>
                    Switch topic
                </button>
            )}
        </div>
    );
}