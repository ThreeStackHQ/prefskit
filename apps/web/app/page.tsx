import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Logo / Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 text-sm font-medium px-4 py-1.5 rounded-full border border-sky-200">
          <span className="w-2 h-2 bg-sky-500 rounded-full" />
          Now in beta
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Email preferences,{" "}
          <span className="text-sky-600">done right.</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Give your subscribers a beautiful, hosted preference center. One line
          of code to check if you can send. Built for indie SaaS.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/signup"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/docs"
            className="text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Read the docs →
          </Link>
        </div>

        {/* Code snippet */}
        <div className="bg-gray-900 rounded-xl p-6 text-left text-sm font-mono text-gray-300 shadow-xl">
          <p className="text-gray-500 mb-3">{"// canSend in 3 lines"}</p>
          <p>
            <span className="text-purple-400">const</span>{" "}
            <span className="text-sky-300">prefskit</span>{" "}
            <span className="text-gray-400">=</span>{" "}
            <span className="text-yellow-300">new</span>{" "}
            <span className="text-green-300">PrefsKit</span>
            {"({ apiKey })"}
          </p>
          <p className="mt-2">
            <span className="text-purple-400">const</span>{" "}
            <span className="text-sky-300">ok</span>{" "}
            <span className="text-gray-400">=</span>{" "}
            <span className="text-yellow-300">await</span>{" "}
            <span className="text-sky-300">prefskit</span>
            <span className="text-gray-400">.</span>
            <span className="text-green-300">canSend</span>
            {"(email, "}
            <span className="text-orange-300">&apos;marketing&apos;</span>
            {")"}
          </p>
          <p className="mt-2">
            <span className="text-purple-400">if</span>
            {" (ok) "}
            <span className="text-yellow-300">await</span>
            {" resend.send(...)"}
          </p>
        </div>
      </div>
    </main>
  );
}
