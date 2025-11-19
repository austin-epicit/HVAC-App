import type { JSX } from "react";

interface FullPopupProps {
  content: JSX.Element;
  isModalOpen: boolean;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
  hasBackground?: boolean;
}

const FullPopup = ({
  content,
  isModalOpen,
  onClose,
  size = "md",
  hasBackground = true,
}: FullPopupProps) => {
  let baseClassPanel =
    "transition-all fixed inset-0 z-[5000] flex items-center justify-center ";
  let baseClassBackground =
    "transition-all fixed inset-0 z-[4000] bg-black ";

  if (isModalOpen) {
    baseClassPanel += "opacity-100 pointer-events-auto";
    baseClassBackground += "opacity-50 pointer-events-auto";
  } else {
    baseClassPanel += "opacity-0 pointer-events-none";
    baseClassBackground += "opacity-0 pointer-events-none";
  }

  let baseClassInset =
    "scrollbar-hide transition-all bg-zinc-900 p-5 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ";

  switch (size) {
    case "md":
      baseClassInset += "w-11/12 md:w-1/2 lg:w-1/3";
      break;
    case "lg":
      baseClassInset += "w-11/12 md:w-4/5 lg:w-2/3";
      break;
    case "xl":
      baseClassInset += "w-11/12 md:w-4/5 lg:w-5/6";
      break;
  }

  if (!isModalOpen) {
    // Don’t render content at all when closed (optional but nice)
    return (
      <>
        {hasBackground && <div className={baseClassBackground} />}
        <div className={baseClassPanel}></div>
      </>
    );
  }

  return (
    <>
      {hasBackground && (
        <div
          className={baseClassBackground}
          onMouseDown={onClose} // mousedown starting on backdrop closes
        />
      )}

      <div
        className={baseClassPanel}
        onMouseDown={onClose} // mousedown starting anywhere outside inner box closes
      >
        <div
          className={baseClassInset}
          onMouseDown={(e) => e.stopPropagation()} // mousedown starting inside does NOT close
        >
          {content}
        </div>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
    
  );
};

export default FullPopup;
