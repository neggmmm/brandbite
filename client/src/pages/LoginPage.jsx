// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { loginUser, getMe } from "../redux/slices/authSlice";
// import GoogleLoginButton from "../components/GoogleLoginButton";
// import { Mail, Lock, ArrowLeft, ChefHat } from "lucide-react";

// export default function LoginPage() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { loading, error } = useSelector((state) => state.auth);

//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   const validateField = (name, value) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     switch (name) {
//       case "email":
//         if (!value) return "Email is required";
//         if (!emailRegex.test(value)) return "Please enter a valid email";
//         return "";
//       case "password":
//         if (!value) return "Password is required";
//         if (value.length < 8) return "Password must be at least 8 characters";
//         return "";
//       default:
//         return "";
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (touched[name]) {
//       const error = validateField(name, value);
//       setErrors((prev) => ({ ...prev, [name]: error }));
//     }
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     setTouched((prev) => ({ ...prev, [name]: true }));
//     const error = validateField(name, value);
//     setErrors((prev) => ({ ...prev, [name]: error }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};
//     Object.keys(formData).forEach((key) => {
//       const error = validateField(key, formData[key]);
//       if (error) newErrors[key] = error;
//     });

//     setErrors(newErrors);
//     setTouched({ email: true, password: true });

//     if (Object.keys(newErrors).length === 0) {
//       const resultAction = await dispatch(loginUser(formData));
//       if (loginUser.fulfilled.match(resultAction)) {
//         // Fetch full user profile (includes role)
//         const meAction = await dispatch(getMe());
//         const user = meAction.payload || resultAction.payload?.user || null;

//         // Redirect based on role
//         const role = (user?.role || "").toString().toLowerCase();
//         if (role === "admin") {
//           // Force full reload to ensure admin layout mounts and server cookies are sent
//           window.location.replace("/admin");
//           return;
//         }
//         if (role === "cashier") {
//           window.location.replace("/cashier");
//           return;
//         }
//         if (role === "kitchen") {
//           window.location.replace("/kitchen");
//           return;
//         }

//         // Default: customer -> menu
//         window.location.replace("/menu");
//       }
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSubmit(e);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Back Button */}
//         <button
//           onClick={() => navigate("/")}
//           className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-orange-400 transition-colors mb-6 group"
//         >
//           <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
//           Back to Home
//         </button>

//         {/* Login Card */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           {/* Header */}
//           <div className="bg-primary from-primary/50 to-primary/60 p-6 text-center">
//             <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
//               <ChefHat className="w-10 h-10 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
//             <p className="text-orange-100 opacity-90 mt-1">
//               Please login to continue
//             </p>
//           </div>

//           {/* Form Content */}
//           <div className="p-8">
//             {error && (
//               <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
//                 <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Email Field */}
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//                 >
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     onKeyPress={handleKeyPress}
//                     className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${errors.email && touched.email
//                       ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                       : "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
//                       } rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
//                     placeholder="john@example.com"
//                   />
//                 </div>
//                 {errors.email && touched.email && (
//                   <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div>
//                 <div className="flex justify-between items-center mb-2">
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//                   >
//                     Password
//                   </label>
//                   <Link
//                     to="/forgot-password"
//                     className="text-sm text-primary dark:text-primary/40 hover:text-primary/60 dark:hover:text-primary/30 transition-colors"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
//                   <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     onKeyPress={handleKeyPress}
//                     className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${errors.password && touched.password
//                       ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                       : "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
//                       } rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
//                     placeholder="••••••••"
//                   />
//                 </div>
//                 {errors.password && touched.password && (
//                   <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.password}</p>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary from-primary/50 to-primary/60 hover:from-primary/60 hover:to-primary/70 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Logging in...
//                   </span>
//                 ) : "Login"}
//               </button>
//             </form>

//             {/* Sign Up Link */}
//             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
//               <p className="text-gray-600 dark:text-gray-400 text-sm">
//                 Don't have an account?{" "}
//                 <Link
//                   to="/register"
//                   className="font-semibold text-primary dark:text-primary/40 hover:text-primary/60 dark:hover:text-primary/20 transition-colors"
//                 >
//                   Sign up now
//                 </Link>
//               </p>
//             </div>
//           </div>
//           <div className="mt-6 text-center">
//             <p className="text-gray-600 text-sm">
//               Forgot password?{" "}
//               <Link
//                 to="/forgot-password"
//                 className="primary font-semibold hover:underline"
//               >
//                 Reset Password
//               </Link>
//             </p>
//           </div>
//           <GoogleLoginButton />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getMe } from "../redux/slices/authSlice";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Mail, Lock, ArrowLeft, ChefHat, Star, Users, Tag, Shield } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(newErrors).length === 0) {
      const resultAction = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(resultAction)) {
        // Fetch full user profile (includes role)
        const meAction = await dispatch(getMe());
        const user = meAction.payload || resultAction.payload?.user || null;

        // Redirect based on role
        const role = (user?.role || "").toString().toLowerCase();
        if (role === "admin") {
          // Force full reload to ensure admin layout mounts and server cookies are sent
          window.location.replace("/admin");
          return;
        }
        if (role === "cashier") {
          window.location.replace("/cashier");
          return;
        }
        if (role === "kitchen") {
          window.location.replace("/kitchen");
          return;
        }

        // Default: customer -> menu
        window.location.replace("/menu");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center">
        {/* Left Column - Branding & Stats */}
        <div className="lg:w-1/2 w-full max-w-lg">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">BrandBite</h1>
              </div>
              <p className="text-white/90 text-lg mb-8">
                Welcome back to the best restaurant experience in the world. 
                Your culinary journey continues here.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-2xl">20% OFF</span>
                  </div>
                  <p className="text-white/80 text-sm">Special Offer for Members</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-2xl">89</span>
                  </div>
                  <p className="text-white/80 text-sm">Excellent Reviews</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-2xl">500+</span>
                  </div>
                  <p className="text-white/80 text-sm">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Login</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access your account and continue your journey
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                  <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyPress={handleKeyPress}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border ${
                        errors.email && touched.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/20"
                      } rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyPress={handleKeyPress}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border ${
                        errors.password && touched.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/20"
                      } rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Sign In to BrandBite
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <GoogleLoginButton />

              {/* Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    Join 500+ Happy Customers
                  </Link>
                </p>
              </div>
              
              {/* Forgot Password Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Need help?{" "}
                  <Link
                    to="/support"
                    className="text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors hover:underline"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}