import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { reviewsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, StarRating, Modal } from '../../components/ui'
import { Star, Plus, Send } from 'lucide-react'

export default function ReviewsPage() {
  const { user } = useAuth()

  const { data: reviews = [], loading, refetch } = useAsync(
    () => reviewsAPI.getByUser(user?._id),
    [user?._id]
  )

  // ✅ FIXED mutation wrapper
  const { mutate: createReview, loading: submitting } = useMutation(
    ({ jobId, data }) => reviewsAPI.create(jobId, data)
  )

  const [modal, setModal] = useState(false)

  const [form, setForm] = useState({
    jobId: '',
    revieweeId: '',
    rating: 0,
    comment: ''
  })

  const handleSubmit = async () => {
    console.log("FORM 👉", form)

    if (!form.jobId) return alert("Job ID required ❌")
    if (!form.rating) return alert("Rating required ❌")

    await createReview(
      {
        jobId: form.jobId,
        data: {
          rating: form.rating,
          comment: form.comment,
          revieweeId: form.revieweeId
        }
      },
      {
        successMsg: "⭐ Review submitted",
        onSuccess: () => {
          setModal(false)
          setForm({ jobId: '', revieweeId: '', rating: 0, comment: '' })
          refetch()
        }
      }
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Reviews"
        subtitle="Your feedback system"
        action={
          <button onClick={() => setModal(true)} className="btn-primary flex gap-2">
            <Plus size={16} /> Write Review
          </button>
        }
      />

      {loading ? (
        <p>Loading...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r._id} className="glass-card p-4">
              ⭐ {r.rating} — {r.comment}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Star} title="No reviews yet" />
      )}

      {modal && (
        <Modal open={modal} onClose={() => setModal(false)} title="Write Review">
          <div className="space-y-3">

            {/* JOB ID */}
            <input
              placeholder="Enter Job ID"
              value={form.jobId}
              onChange={e => setForm({ ...form, jobId: e.target.value })}
              className="input-field"
            />

            {/* USER ID */}
            <input
              placeholder="Reviewee ID"
              value={form.revieweeId}
              onChange={e => setForm({ ...form, revieweeId: e.target.value })}
              className="input-field"
            />

            <StarRating
              value={form.rating}
              onChange={r => setForm({ ...form, rating: r })}
            />

            <textarea
              placeholder="Write comment"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              className="input-field"
            />

            <button onClick={handleSubmit} className="btn-primary w-full">
              <Send size={14} /> Submit
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}