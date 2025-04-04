import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Team Collaboration",
    description: "Manage tasks across your organization with real-time updates",
    icon: "👥",
  },
  {
    title: "Task Analytics",
    description: "Track progress with detailed PDF/Excel reports",
    icon: "📈",
  },
  {
    title: "User Management",
    description: "Admin-controlled permissions & member management",
    icon: "🔐",
  },
  {
    title: "Progress Tracking",
    description: "Real-time updates on task completion status",
    icon: "✅",
  },
];

const pricing = [
  {
    name: "Free",
    price: 0,
    features: [
      "Up to 50 Members",
      "Basic Task Management",
      "PDF/Excel Reports",
      "Analytics Dashboard",
      "1 Organization",
    ],
  },
  {
    name: "Pro",
    price: 29,
    features: [
      "Unlimited Members",
      "Advanced Analytics",
      "Email Notifications",
      "Priority Support",
      "5 Organizations",
    ],
  },
  {
    name: "Enterprise",
    price: 99,
    features: [
      "Unlimited Organizations",
      "Advanced User Permissions",
      "Audit Logging",
      "Multi-Factor Authentication",
      "AI Chatbot Integration",
    ],
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-indigo-600"
          >
            TaskFlow
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/signin')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-6"
          >
            Streamline Team Productivity
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Collaborative task management with real-time analytics, detailed reporting, 
            and seamless team coordination for organizations of all sizes.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/signin')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Task Management Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg border-2 border-indigo-100"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold mb-4">
                    ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-gray-600"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/signin')}
                    className={`w-full py-3 rounded-lg ${
                      plan.name === "Free"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {plan.name === "Free" ? "Get Started Free" : "Choose Plan"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}