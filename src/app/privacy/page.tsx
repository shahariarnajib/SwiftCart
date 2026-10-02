import React from "react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and customer data protection principles at Swift Cart Bangladesh.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                When you place an order on Swift Cart, we collect the necessary details required to
                fulfill and deliver your package: your name, contact telephone number, shipping
                address, and optional email address.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. How We Use Your Information</h2>
              <p>
                Your personal details are used strictly for order processing, dispatch coordination with
                trusted domestic logistics couriers (e.g. Steadfast, RedX, Pathao), delivery verification,
                and warranty registration.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Data Security & Storage</h2>
              <p>
                We do not sell, rent, or trade your contact information with third-party marketing brokers.
                All customer records are encrypted and stored in protected databases accessible only by
                authorized Swift Cart administrators.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Payment Security</h2>
              <p>
                For Cash on Delivery orders, no sensitive banking details or credit card information are
                stored on our servers. You complete your payment with physical cash directly upon receipt
                and satisfaction.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Contact Regarding Privacy</h2>
              <p>
                If you have questions regarding data privacy or wish to update or delete your contact
                records, please email us at <strong>privacy@swiftcart.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
