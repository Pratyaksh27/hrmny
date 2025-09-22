// src/components/screens/WelcomeContent.tsx

export default function WelcomeContent() {
  return (
    <div className="h-full w-full bg-bgCanvas text-textPrimary p-7">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-bold mb-5">Welcome</h1>
        <p className="text-base font-regular mb-4">
          HRMNY is your safe and confidential space to share what’s on your mind—free from bias or judgment.
        </p>
        <p className="text-base font-regular mb-4">
          Whether it’s a concern, a complaint, or an escalation, you’ll be guided step by step. Take a breath,
          and when you’re ready, choose the menu to the left to begin.
        </p>
        <p className="text-base font-regular">We’re here to listen.</p>
      </div>
    </div>
  );
}
