import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const features = [
  {
    title: "Team Collaboration",
    description: "Real-time task management with role-based access control",
    icon: "👥",
  },
  {
    title: "Advanced Analytics",
    description: "Interactive dashboard with charts, graphs, and data tables",
    icon: "📈",
  },
  {
    title: "Smart Reporting",
    description: "Generate detailed PDF/Excel reports with custom filters",
    icon: "📊",
  },
  {
    title: "AI-Powered Insights",
    description: "Get intelligent task recommendations from our AI assistant",
    icon: "🤖",
  },
  {
    title: "Enterprise Security",
    description: "SSO, Audit logging, and MFA integration",
    icon: "🔐",
  },
  {
    title: "Workflow Automation",
    description: "Custom triggers and real-time email notifications",
    icon: "⚡",
  },
];

const pricing = [
  {
    name: "Free",
    price: 0,
    features: [
      "Up to 50 members & tasks",
      "PDF/Excel Reports",
      "1 Organization",
      "Basic AI Assistant",
    ],
  },
  {
    name: "Pro",
    price: 29,
    features: [
      "Unlimited members & tasks",
      "Advanced Analytics Dashboard",
      "Priority Support",
      "5 Organizations",
    ],
  },
  {
    name: "Enterprise",
    price: 99,
    features: [
      "Unlimited Organizations",
      "Custom RBAC & SSO",
      "Audit Logs & MFA",
      "Multi-Factor Authentication"
    ],
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Navbar */}
      <nav className={`fixed w-full backdrop-blur-sm z-50 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
          >
            TaskFlow
          </motion.h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`text-2xl ${isDarkMode ? 'text-gray-100 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}`}
            >
              {isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/signin')}
              className={`px-6 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-indigo-400 text-gray-900 hover:bg-indigo-300' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Streamline Your Team's Workflow
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            TaskFlow simplifies team productivity with secure task management, AI-powered insights, 
            and comprehensive reporting. Export data seamlessly for better decision-making.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/signin')}
              className={`px-8 py-3 rounded-lg text-lg transition-all ${
                isDarkMode
                  ? 'bg-indigo-400 text-gray-900 hover:bg-indigo-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`p-8 rounded-xl transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-white hover:bg-gray-50'
                } shadow-lg`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Unified Workflow Dashboard Section */}
<section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
  <div className="container mx-auto px-6">
    <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="text-center max-w-4xl mx-auto">
        <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Unified Workflow Dashboard
        </h2>
        <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage tasks seamlessly, communicate in real time, and gain insights into your team's productivity—all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Smart Chatbot Assistant
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Get personalized AI insights to optimize task management and boost team collaboration.
            </p>
          </div>
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Analytics
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Visualize performance metrics, download detailed reports, and stay updated with real-time notifications.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/signin')}
            className={`px-8 py-3 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-indigo-400 text-gray-900 hover:bg-indigo-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Explore Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Pricing Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Simple Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-xl shadow-lg border-2 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-indigo-100 bg-white'
                }`}
              >
                <div className="text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    ${plan.price}<span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/signin')}
                    className={`w-full py-3 rounded-lg transition-all ${
                      plan.name === "Free"
                        ? isDarkMode
                          ? 'bg-indigo-400 text-gray-900 hover:bg-indigo-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : `border-2 ${
                            isDarkMode
                              ? 'border-indigo-400 text-indigo-400 hover:bg-gray-700'
                              : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                          }`
                    }`}
                  >
                    {plan.name === "Free" ? "Start Free" : "Go Professional"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className={`py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`container mx-auto px-6 text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}