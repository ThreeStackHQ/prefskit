interface PreferencesPageProps {
  params: Promise<{ token: string }>;
}

export default async function PreferencesPage({ params }: PreferencesPageProps) {
  const { token } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Email Preferences</h1>
      <p className="mt-2 text-gray-600">
        Manage your email preferences (token: {token})
      </p>
    </main>
  );
}
