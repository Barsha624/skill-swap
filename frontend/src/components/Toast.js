import { createContext, useCallback, useContext, useState } from "react";
import Icon from "./Icon";

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, type }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3600);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={"toast toast-" + t.type}>
            <Icon name={t.type === "error" ? "x" : "check"} size={16} />
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
