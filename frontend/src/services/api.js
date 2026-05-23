import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

/* ───────── REQUEST INTERCEPTOR ───────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('wl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ───────── RESPONSE INTERCEPTOR ───────── */
API.interceptors.response.use(
  (res) => res.data, // ✅ GLOBAL NORMALIZATION
  (err) => {
    const message =
      err.response?.data?.message || 'Something went wrong'

    if (err.response?.status === 401) {
      localStorage.removeItem('wl_token')
      window.location.href = '/login'
    }

    return Promise.reject(new Error(message))
  }
)

/* ───────── AUTH ───────── */
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: async () => {
    const res = await API.get('/auth/me')
    return res.user
  },
}

/* ───────── PROFILE ───────── */
export const profileAPI = {
  create: async (data) => {
    const res = await API.post('/profile', data)
    return res.profile
  },

  getMe: async () => {
    const res = await API.get('/profile/me')
    return res.profile
  },

  getById: async (id) => {
    const res = await API.get(`/profile/${id}`)
    return res.profile
  },

  delete: () => API.delete('/profile'),
}

/* ───────── PORTFOLIO ───────── */
export const portfolioAPI = {
  create: async (data) => {
    const res = await API.post('/portfolio', data)
    return res.portfolio
  },

  getByUser: async (userId) => {
    const res = await API.get(`/portfolio/${userId}`)
    return res.portfolio || []
  },

  update: async (id, data) => {
    const res = await API.put(`/portfolio/${id}`, data)
    return res.portfolio
  },

  delete: (id) => API.delete(`/portfolio/${id}`),
}

/* ───────── JOBS ───────── */
export const jobsAPI = {
  create: async (data) => {
    const res = await API.post('/jobs', data)
    return res.job
  },

  getAll: async () => {
    const res = await API.get('/jobs')
    return res.jobs || []
  },

  getById: async (id) => {
    const res = await API.get(`/jobs/${id}`)
    return res.job
  },

  update: async (id, data) => {
    const res = await API.put(`/jobs/${id}`, data)
    return res.job
  },

  delete: (id) => API.delete(`/jobs/${id}`),

  myJobs: async () => {
    const res = await API.get('/jobs/my/jobs')
    return res.jobs || []
  },

  search: async (params) => {
    const res = await API.get('/jobs', { params })
    return res.jobs || []
  },
}

/* ───────── APPLICATIONS ───────── */
export const applicationsAPI = {
apply: async (data) => {
  const { jobId, ...body } = data

  const res = await API.post(`/applications/${jobId}/apply`, body)
  return res.application
},

  getByJob: async (jobId) => {
    const res = await API.get(`/applications/${jobId}/applications`)
    return res.applications || []
  },

  // ✅ FIXED (CLIENT DASHBOARD)
  getClientApps: async () => {
    const res = await API.get('/applications/client/all')
    return res.applications || []
  },

  // ✅ FREELANCER
  mine: async () => {
    const res = await API.get('/applications/me')
    return res.applications || []
  },

 update: async (id, data) => {
  const res = await API.put(`/applications/${id}/status`, data)
  return res.application
},
}

/* ───────── ESCROW ───────── */
export const escrowAPI = {
  create: async (data) => {
    const res = await API.post('/escrow', data)
    return res.escrow
  },

  release: (id) => API.post(`/escrow/${id}/release`),

  refund: (id) => API.post(`/escrow/${id}/refund`),

  byJob: async (jobId) => {
    const res = await API.get(`/escrow/${jobId}`)
    return res.escrow
  },

  mine: async () => {
    const res = await API.get('/escrow/me')
    return res.escrows || []
  },
}

/* ───────── REVIEWS ───────── */
/* ───────── REVIEWS ───────── */
export const reviewsAPI = {
  // ✅ CREATE REVIEW
  create: async (jobId, data) => {
    if (!jobId) throw new Error("Job ID missing")

    const res = await API.post(`/reviews/${jobId}`, data)
    return res.review
  },

  // ✅ GET USER REVIEWS
  getByUser: async (userId) => {
    const res = await API.get(`/reviews/${userId}`)
    return res.reviews || []
  },

  // ✅ UPDATE
  update: async (id, data) => {
    const res = await API.put(`/reviews/${id}`, data)
    return res.review
  },

  // ✅ DELETE
  delete: (id) => API.delete(`/reviews/${id}`),
}

/* ───────── AI ───────── */
export const aiAPI = {
  recommendations: async () => {
    const res = await API.get('/recommendations/jobs')
    return (res.recommendations || []).map(r => r.job)
  },
}

/* ───────── ANALYTICS ───────── */
export const analyticsAPI = {
  get: async () => {
    const res = await API.get('/analytics/dashboard')
    return res.analytics
  },
}

export default API