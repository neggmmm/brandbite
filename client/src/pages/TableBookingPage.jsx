
 import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingContext";
import { Calendar, Clock, Users, User, Phone, Mail, CheckCircle } from "lucide-react";

export default function TableBookingPage() {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [form, setForm] = useState({ 
    date: "", 
    startTime: "18:00", 
    endTime: "19:00", 
    guests: 2, 
    name: "", 
    phone: "", 
    email: "" 
  });
  const [message, setMessage] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { theme } = useTheme();

  const { getServices } = useSettings();

  useEffect(() => {
    const load = async () => {
      try {
        // fetch restaurant info for id
        const res = await api.get("/api/restaurant");
        const data = res.data?.data || res.data;
        setRestaurantId(data.restaurantId || data._id || null);

        // fetch services from services endpoint (keeps in sync with admin toggles)
        let servicesData = {};
        try {
          servicesData = await getServices();
        } catch (e) {
          // fallback to top-level restaurant data
          servicesData = data.services || {};
        }

        const enabled = servicesData?.tableBooking?.enabled ?? servicesData?.tableBookings?.enabled ?? false;
        setDisabled(!enabled);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [getServices]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setIsSubmitted(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return setMessage("Table booking is not available");
    // client-side validation
    if (!restaurantId) return setMessage("Restaurant data not loaded yet. Please try again shortly.");
    if (!form.date) return setMessage("Please select a date for your reservation.");
    if (!form.name) return setMessage("Please provide your name.");
    if (!form.phone) return setMessage("Please provide a phone number.");
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        restaurantId,
        tableId: form.tableId || null,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        guests: Number(form.guests),
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
      };

      const res = await api.post("/api/bookings", payload);
      const status = res?.data?.data?.status || res?.data?.status || "pending";
      setMessage(`Booking created — status: ${status}`);
      setIsSubmitted(true);
      setForm({ date: "", startTime: "18:00", endTime: "19:00", guests: 2, name: "", phone: "", email: "" });
    } catch (err) {
      let msg = err?.response?.data?.message ?? err.message ?? "Failed";
      if (typeof msg !== "string") {
        try {
          msg = JSON.stringify(msg);
        } catch (e) {
          msg = String(msg);
        }
      }
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Predefined time slots for better UX
  const timeSlots = [
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
    "20:00", "20:30", "21:00", "21:30"
  ];

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-r from-rose-100 to-teal-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Booking Unavailable</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Table booking is currently disabled for this restaurant. Please check back later or contact us directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Reserve Your Table
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience fine dining at its best. Book your table in advance for a seamless experience.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Form */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <form onSubmit={submit} className="space-y-8">
                  {/* Date & Time Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Select Date & Time
                    </h2>
                    
                    {/* Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reservation Date
                      </label>
                      <div className="relative">
                        <input
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          type="date"
                          required
                          className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Start Time
                        </label>
                        <div className="relative">
                          <select
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Time
                        </label>
                        <div className="relative">
                          <select
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Number of Guests
                    </label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {guestOptions.map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleChange({ target: { name: 'guests', value: num } })}
                          className={`py-3 rounded-lg transition-all duration-200 font-medium ${
                            form.guests === num
                              ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Your Information
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            type="text"
                            required
                            className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            placeholder="John Doe"
                          />
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              type="tel"
                              required
                              className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              placeholder="+1 (555) 000-0000"
                            />
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              type="email"
                              required
                              className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              placeholder="john@example.com"
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Reservation...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Confirm Reservation
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Message Display */}
                {message && (
                  <div className={`mt-6 p-4 rounded-xl ${isSubmitted ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                    {typeof message === 'string' ? message : JSON.stringify(message)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Info Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-gradient-to-b from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 text-white">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Booking Details</h3>
                  <p className="text-primary-100">
                    Your reservation details will be confirmed via email and SMS.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary-100">What to Expect</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary-200 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary-100">Confirmation within 15 minutes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary-200 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary-100">Table held for 15 minutes after reservation time</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary-200 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary-100">Free cancellation up to 2 hours before</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-primary-500">
                    <h4 className="font-semibold text-primary-100 mb-3">Need Help?</h4>
                    <p className="text-sm text-primary-100">
                      Call us at <span className="font-semibold">+1 (555) 123-4567</span> or email{" "}
                      <span className="font-semibold">reservations@restaurant.com</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Animation */}
              {isSubmitted && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-green-800 dark:text-green-300">Reservation Submitted!</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Thank you for your reservation! We'll send a confirmation to your email shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}