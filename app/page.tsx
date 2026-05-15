import { AuthButton } from './components/auth-button';
import { Editor } from './components/editor';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center lg:items-start justify-start gap-6 bg-white p-4 overflow-auto lg:overflow-visible">
      <AuthButton />
      <Editor />
    </main>
  );
}
