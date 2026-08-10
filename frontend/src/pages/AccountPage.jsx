import { useEffect, useState } from 'react'
import { FiEdit2, FiMapPin, FiPackage, FiPlus, FiSave, FiTrash2, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
}

export function AccountPage() {
  const { user, refreshProfile, updateLocalUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [addressForm, setAddressForm] = useState(emptyAddress)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)

  useEffect(() => {
    refreshProfile()
      .then((nextUser) => {
        setProfile({ name: nextUser.name || '', phone: nextUser.phone || '' })
        setAddresses(nextUser.addresses || [])
      })
      .catch(() => {})
  }, [refreshProfile])

  const saveProfile = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const payload = await api.updateProfile(profile)
      updateLocalUser(payload.user)
      setAddresses(payload.user.addresses || [])
      setEditingProfile(false)
      setMessage('Profile updated')
    } catch (err) {
      setError(err.message)
    }
  }

  const saveAddress = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const payload = await api.addAddress({ ...addressForm, email: addressForm.email || user?.email })
      setAddresses(payload.addresses)
      updateLocalUser({ ...user, addresses: payload.addresses })
      setAddressForm(emptyAddress)
      setShowAddressForm(false)
      setMessage('Address saved')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeAddress = async (addressId) => {
    const payload = await api.deleteAddress(addressId)
    setAddresses(payload.addresses)
    updateLocalUser({ ...user, addresses: payload.addresses })
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-8 text-white shadow-xl">
  
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
  
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
  
            <div>
              <p className="uppercase tracking-widest text-sm opacity-80">
                Welcome Back
              </p>
  
              <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                {user?.name || "Customer"}
              </h1>
  
              <p className="mt-3 max-w-xl text-orange-50">
                Manage your personal information, delivery addresses and
                orders from one place.
              </p>
            </div>
  
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 backdrop-blur-lg">
              <FiUser size={45} />
            </div>
  
          </div>
  
        </div>
  
        {(message || error) && (
          <div className="mt-6">
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-green-700">
                {message}
              </div>
            )}
  
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-red-600">
                {error}
              </div>
            )}
          </div>
        )}
  
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
  
          {/* Orders */}
  
          <Link
            to="/account/orders"
            className="group rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <FiPackage size={30} />
            </div>
  
            <h2 className="mt-6 text-2xl font-semibold">
              Orders
            </h2>
  
            <p className="mt-2 text-gray-500">
              View your recent orders, payment status and shipping updates.
            </p>
  
            <div className="mt-6 text-orange-600 font-medium">
              View Orders →
            </div>
          </Link>
  
          {/* Profile */}
  
          <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2">
  
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  
              <div className="flex items-center gap-4">
  
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <FiUser size={26} />
                </div>
  
                <div>
  
                  <h2 className="text-2xl font-semibold">
                    My Profile
                  </h2>
  
                  <p className="text-gray-500">
                    Personal Information
                  </p>
  
                </div>
  
              </div>
  
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="rounded-xl border border-orange-500 px-5 py-2 font-medium text-orange-600 transition hover:bg-orange-500 hover:text-white"
              >
                <FiEdit2 className="mr-2 inline" />
  
                {editingProfile ? "Cancel" : "Edit"}
              </button>
  
            </div>
  
            {editingProfile ? (
  
              <form
                onSubmit={saveProfile}
                className="grid gap-5 md:grid-cols-2"
              >
  
                <div>
  
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>
  
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value,
                      })
                    }
                  />
  
                </div>
  
                <div>
  
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>
  
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value,
                      })
                    }
                  />
  
                </div>
  
                <div className="md:col-span-2">
  
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>
  
                  <input
                    disabled
                    value={user?.email}
                    className="w-full rounded-xl bg-gray-100 px-4 py-3"
                  />
  
                </div>
  
                <button className="rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 md:col-span-2">
                  <FiSave className="mr-2 inline" />
                  Save Profile
                </button>
  
              </form>
  
            ) : (
  
              <div className="space-y-4">
  
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Full Name
                  </p>
  
                  <p className="mt-1 font-semibold">
                    {user?.name}
                  </p>
                </div>
  
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Email
                  </p>
  
                  <p className="mt-1 font-semibold">
                    {user?.email}
                  </p>
                </div>
  
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>
  
                  <p className="mt-1 font-semibold">
                    {user?.phone || "Not Added"}
                  </p>
                </div>
  
              </div>
  
            )}
  
          </div>
  
        </div>
  
        {/* Address */}
  
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
  
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  
            <div className="flex items-center gap-4">
  
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <FiMapPin size={25} />
              </div>
  
              <div>
  
                <h2 className="text-2xl font-semibold">
                  Saved Addresses
                </h2>
  
                <p className="text-gray-500">
                  Manage delivery locations
                </p>
  
              </div>
  
            </div>
  
            <button
              onClick={() =>
                setShowAddressForm(!showAddressForm)
              }
              className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
            >
              <FiPlus className="mr-2 inline" />
              Add Address
            </button>
  
          </div>
  
          {showAddressForm && (
            <form
              onSubmit={saveAddress}
              className="mb-10 grid gap-5 md:grid-cols-2"
            >
              {Object.entries(addressForm).map(([key, value]) => {
                if (key === "isDefault") return null;
  
                return (
                  <input
                    key={key}
                    placeholder={key}
                    value={value}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        [key]: e.target.value,
                      })
                    }
                    className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                  />
                );
              })}
  
              <button className="rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 md:col-span-2">
                Save Address
              </button>
  
            </form>
          )}
  
          {addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center text-gray-500">
              No Saved Address
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="rounded-2xl border p-6 transition hover:shadow-lg"
                >
                  <div className="flex justify-between">
  
                    <div>
  
                      <h3 className="text-lg font-semibold">
                        {addr.fullName}
                      </h3>
  
                      <p className="mt-3 text-gray-500">
                        {addr.line1}
                        <br />
                        {addr.line2}
                        <br />
                        {addr.city}, {addr.state}
                        <br />
                        {addr.pincode}
                      </p>
  
                      <p className="mt-3 font-medium">
                        {addr.phone}
                      </p>
  
                    </div>
  
                    <button
                      onClick={() =>
                        removeAddress(addr._id)
                      }
                      className="text-red-500 transition hover:scale-110"
                    >
                      <FiTrash2 size={22} />
                    </button>
  
                  </div>
  
                </div>
              ))}
  
            </div>
          )}
  
        </div>
  
      </div>
    </section>
  )
}
