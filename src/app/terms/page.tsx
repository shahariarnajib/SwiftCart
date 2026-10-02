import React from "react";

export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions of purchasing and delivery through Swift Cart Bangladesh.",
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
            <p className="text-xs text-slate-400 mt-1">Effective Date: October 2026</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By placing an order or browsing products on Swift Cart, you agree to comply with and be
                bound by these Terms and Conditions. Please review them carefully prior to order
                submission.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Pricing and Availability</h2>
              <p>
                All prices are stated in Bangladeshi Taka (৳ / BDT). While we endeavor to ensure all
                prices, descriptions, and stock quantities are accurate, rare discrepancies may occur.
                Swift Cart reserves the right to cancel or adjust orders where pricing or inventory was
                materially misstated.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Shipping and Delivery</h2>
              <p>
                Estimated delivery timelines are 24-48 hours within Dhaka Metro and 3-5 business days
                nationwide across Bangladesh. Actual delivery times may vary during public holidays,
                severe weather, or national strikes (hartals/blockades).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Return & Replacement Policy</h2>
              <p>
                Products found with verified manufacturing defects or transit damage upon initial
                inspection are eligible for replacement within 7 calendar days of receipt. Products must
                be accompanied by all original accessories, documentation, and original packaging.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Governing Law</h2>
              <p>
                These terms are governed by and construed in accordance with the applicable laws of the
                People&apos;s Republic of Bangladesh.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
