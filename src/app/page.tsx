import App from "./App";
import { TranscriptProvider } from "./contexts/TranscriptContext";

export default function Page() {
  return (
    <TranscriptProvider>
      <App />  
    </TranscriptProvider>
  );
}