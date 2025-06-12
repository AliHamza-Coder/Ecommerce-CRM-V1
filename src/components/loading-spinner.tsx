export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" }) {
  const spinnerSize = size === "sm" ? "w-4 h-4" : "w-12 h-12";
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className={`${spinnerSize} rounded-full absolute border-4 border-solid border-gray-200`}></div>
        <div className={`${spinnerSize} rounded-full animate-spin absolute border-4 border-solid border-blue-500 border-t-transparent`}></div>
      </div>
    </div>
  );
} 