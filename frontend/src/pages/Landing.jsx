import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const isLoggedIn = !!localStorage.getItem("token");
  if (isLoggedIn) return null;
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b12] via-[#0b0d19] to-[#0a0a12] text-white">
      
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Connect. Collaborate. Grow.
        </h1>
        <p className="mt-5 text-slate-300 text-lg md:text-xl">
          NetGlobalConnect helps professionals build connections, share updates, and find opportunities.
        </p>
        {!isLoggedIn && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/signup" className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:brightness-110">Get Started</Link>
            <Link to="/login" className="px-5 py-3 rounded-xl border border-slate-600 text-white hover:bg-white/10">Sign In</Link>
          </div>
        )}
      </section>


      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        {[
          { title: "Smart Feed", desc: "See posts from your network and beyond.", color: "from-cyan-500/20 to-cyan-500/5" },
          { title: "Messaging", desc: "Stay in touch with your connections.", color: "from-purple-500/20 to-purple-500/5" },
          { title: "Jobs", desc: "Discover and apply to roles that fit you.", color: "from-rose-500/20 to-rose-500/5" },
        ].map((f) => (
          <div key={f.title} className={`rounded-2xl p-6 border border-white/10 bg-gradient-to-b ${f.color}`}>
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-slate-300 mt-2">{f.desc}</p >
          </div>
        ))}
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Join the network</h2>
          <p className="text-slate-300 mt-2">Create your profile and start connecting today.</p>
          <div className="mt-6">
            <Link to="/signup" className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:brightness-110">Create free account</Link>
          </div>
        </section>
      )}
    </div>
  );
}


