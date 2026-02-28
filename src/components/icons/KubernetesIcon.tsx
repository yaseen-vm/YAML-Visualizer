export default function KubernetesIcon({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return <img src="/YAML-Visualizer/kubernetes.svg" alt="Kubernetes" className={className} />;
}