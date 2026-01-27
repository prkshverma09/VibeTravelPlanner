import styles from './ScoreBadge.module.css';

type ScoreType = 'culture' | 'adventure' | 'nature' | 'beach' | 'nightlife';

interface ScoreBadgeProps {
  type: ScoreType;
  score: number;
  showLabel?: boolean;
}

const scoreIcons: Record<ScoreType, string> = {
  culture: '🎭',
  adventure: '🧗',
  nature: '🌲',
  beach: '🏖️',
  nightlife: '🌙',
};

const scoreLabels: Record<ScoreType, string> = {
  culture: 'Culture',
  adventure: 'Adventure',
  nature: 'Nature',
  beach: 'Beach',
  nightlife: 'Nightlife',
};

function getScoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export function ScoreBadge({ type, score, showLabel = true }: ScoreBadgeProps) {
  const level = getScoreLevel(score);
  const icon = scoreIcons[type];
  const label = scoreLabels[type];

  const levelClasses = {
    high: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span 
      className={`${styles.scoreBadge} ${levelClasses[level]} ${level}`}
      data-testid="score-badge"
    >
      <span role="img" aria-label={type}>{icon}</span>
      {showLabel && <span className={styles.label}>{label}:</span>}
      <span className={styles.score}>{score}</span>
    </span>
  );
}
