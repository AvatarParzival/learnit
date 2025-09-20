import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { toast } from "react-toastify";

export default function Contact() {
  const [state, handleSubmit] = useForm("https://formspree.io/f/xpwjqgzo");

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success("Message sent successfully! We'll get back to you soon.");
    }
  }, [state.succeeded]);

  React.useEffect(() => {
    if (state.errors && state.errors.length > 0) {
      toast.error("Failed to send message. Please try again.");
    }
  }, [state.errors]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <i className="fas fa-envelope text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">support@studenthub.com</p>
                <p className="text-gray-600">info@studenthub.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <i className="fas fa-phone text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-600">+92 (000) 000-0000</p>
                <p className="text-gray-600">Mon-Fri, 9AM-5PM EST</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <i className="fas fa-map-marker-alt text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-gray-600">123 Education Street</p>
                <p className="text-gray-600">Learning City, LC 12345</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <i className="fas fa-clock text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-gray-600">Typically within 24 hours</p>
                <p className="text-gray-600">During business days</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {[
                { icon: "fab fa-facebook", color: "text-blue-600", label: "Facebook" },
                { icon: "fab fa-twitter", color: "text-blue-400", label: "Twitter" },
                { icon: "fab fa-instagram", color: "text-pink-600", label: "Instagram" },
                { icon: "fab fa-linkedin", color: "text-blue-700", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className={`bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors ${social.color}`}
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your full name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors"
              />
              <ValidationError prefix="Name" field="name" errors={state.errors} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors"
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="feedback">Feedback & Suggestions</option>
                <option value="other">Other</option>
              </select>
              <ValidationError prefix="Subject" field="subject" errors={state.errors} />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="How can we help you?"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors resize-none"
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} />
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.submitting ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              . We'll never share your information with third parties.
            </p>
          </form>

          {state.succeeded && (
            <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-600 mr-2"></i>
                <span className="text-green-800 font-medium">Message sent successfully!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              question: "How long does it take to get a response?",
              answer: "We typically respond to all inquiries within 24 hours during business days."
            },
            {
              question: "Do you offer technical support?",
              answer: "Yes, we provide technical support for all our products and services."
            },
            {
              question: "Can I schedule a demo?",
              answer: "Absolutely! Contact us to schedule a personalized demo of our platform."
            },
            {
              question: "What are your business hours?",
              answer: "Our support team is available Monday to Friday, 9AM to 5PM EST."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}