// Replace the NamiLogo component with this simple text-based version
import { useSidebar } from "@/components/ui/sidebar";

export function NamiLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="text-primary font-black text-4xl px-2 py-1" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      {isCollapsed ? "N" : "NAMI"}
    </div>
  );
}

// Alternative version with smooth transition
export function NamiLogoAnimated() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="text-primary font-black text-4xl px-2 py-1 transition-all duration-200" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <span className={isCollapsed ? "hidden" : "inline"}>NAMI</span>
      <span className={isCollapsed ? "inline" : "hidden"}>N</span>
    </div>
  );
}

// Even simpler version using CSS overflow
export function NamiLogoSimple() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div 
      className={`text-primary font-black text-4xl px-2 py-1 transition-all duration-200 overflow-hidden ${
        isCollapsed ? "w-8" : "w-auto"
      }`}
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      NAMI
    </div>
  );
}