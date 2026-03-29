'use client'

import { Card } from '../ui/Card'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Review {
  id: string
  rating: number
  culture_rating: number
  work_life_balance: number
  review_text: string
  created_at: string
  user: {
    username: string
    avatar_url?: string
  }
}

interface CompanyReviewCardProps {
  review: Review
}

export function CompanyReviewCard({ review }: CompanyReviewCardProps) {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <Card className="mb-4">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={review.user.avatar_url || '/default-avatar.png'}
          alt={review.user.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.user.username}</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            <div className="text-sm">
              <span className="text-gray-400">التقييم العام: </span>
              <span>{renderStars(review.rating)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">ثقافة الشركة: </span>
              <span>{renderStars(review.culture_rating)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">التوازن بين العمل والحياة: </span>
              <span>{renderStars(review.work_life_balance)}</span>
            </div>
          </div>
          <p className="text-gray-300">{review.review_text}</p>
        </div>
      </div>
    </Card>
  )
}

