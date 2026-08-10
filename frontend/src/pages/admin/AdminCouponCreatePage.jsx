import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCouponForm } from '../../hooks/useCouponList'
import { CouponWizard } from '../../components/admin/coupons/CouponWizard'
import { CouponTableSkeleton } from '../../components/admin/coupons/CouponTable'

export function AdminCouponCreatePage() {
  const navigate = useNavigate()
  const formState = useCouponForm(null)

  const handleSave = async (publish) => {
    await formState.save(publish)
    if (!formState.error && formState.form.code) {
      setTimeout(() => navigate(`/admin/coupons/${encodeURIComponent(formState.form.code)}`), 600)
    }
  }

  return (
    <div className="cpn-page">
      <header className="cpn-page-header">
        <div>
          <nav className="cpn-breadcrumb">
            <Link to="/admin">Admin</Link> / <Link to="/admin/coupons">Coupons</Link> / <span>New</span>
          </nav>
          <h1>Create Coupon</h1>
          <p>Multi-step wizard — new coupons saved locally until admin API is available.</p>
        </div>
      </header>

      {formState.message ? <p className="cpn-message">{formState.message}</p> : null}
      {formState.error ? <p className="cpn-message cpn-message--err">{formState.error}</p> : null}

      <CouponWizard
        form={formState.form}
        setForm={formState.setForm}
        step={formState.step}
        setStep={formState.setStep}
        onSave={handleSave}
        saving={formState.saving}
        isBackend={false}
      />
    </div>
  )
}

export function AdminCouponEditPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const decoded = decodeURIComponent(code || '')
  const formState = useCouponForm(decoded)

  const handleSave = async (publish) => {
    await formState.save(publish)
    if (!formState.error) {
      setTimeout(() => navigate(`/admin/coupons/${encodeURIComponent(formState.form.code || decoded)}`), 600)
    }
  }

  if (!decoded) {
    return (
      <div className="cpn-page">
        <p className="cpn-message cpn-message--err">Invalid coupon code</p>
        <Link to="/admin/coupons" className="cpn-back-link">← Back</Link>
      </div>
    )
  }

  return (
    <div className="cpn-page">
      <header className="cpn-page-header">
        <div>
          <nav className="cpn-breadcrumb">
            <Link to="/admin">Admin</Link> / <Link to="/admin/coupons">Coupons</Link> / <Link to={`/admin/coupons/${encodeURIComponent(decoded)}`}>{decoded}</Link> / <span>Edit</span>
          </nav>
          <h1>Edit Coupon</h1>
          <p>{formState.form.isBackend ? 'Editing metadata for live backend coupon' : 'Editing local draft coupon'}</p>
        </div>
      </header>

      {formState.message ? <p className="cpn-message">{formState.message}</p> : null}
      {formState.error ? <p className="cpn-message cpn-message--err">{formState.error}</p> : null}

      {!formState.form.code && !formState.error ? (
        <CouponTableSkeleton />
      ) : (
        <CouponWizard
          form={formState.form}
          setForm={formState.setForm}
          step={formState.step}
          setStep={formState.setStep}
          onSave={handleSave}
          saving={formState.saving}
          isBackend={Boolean(formState.form.isBackend)}
        />
      )}
    </div>
  )
}
