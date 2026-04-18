import { ExperimentFlow } from "@/components/ExperimentFlow";
import { ExperimentProvider } from "@/context/experiment-context";

export default function Home() {
  return (
    <ExperimentProvider>
      <ExperimentFlow />
    </ExperimentProvider>
  );
}
