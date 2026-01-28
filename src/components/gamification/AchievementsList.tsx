import { AchievementBadge } from './AchievementBadge'
import { ACHIEVEMENT_DEFINITIONS } from '../../lib/achievements'
import type { Achievement } from '../../lib/types'

interface AchievementsListProps {
  achievements: Achievement[]
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  const unlockedMap = new Map(
    achievements.map(a => [a.achievement_type, a])
  )

  return (
    <div className="space-y-3">
      {ACHIEVEMENT_DEFINITIONS.map((def) => {
        const unlocked = unlockedMap.get(def.type)
        return (
          <AchievementBadge
            key={def.type}
            icon={def.icon}
            name={def.name}
            description={def.description}
            unlocked={!!unlocked}
            unlockedAt={unlocked?.unlocked_at}
          />
        )
      })}
    </div>
  )
}
