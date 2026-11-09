import { describe, it, expect, vi, beforeEach } from "vitest";

const render = vi.fn();
const createRoot = vi.fn(() => ({ render }));
vi.mock("react-dom/client", () => ({ createRoot }));
vi.mock("./App.tsx", () => ({ default: () => <p>[App]</p> }));
vi.mock("./context/AuthContext.tsx", () => ({ AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("main.tsx (punto de entrada)", () => {
  beforeEach(() => {
    vi.resetModules();
    render.mockClear();
    createRoot.mockClear();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("monta la app una sola vez en el elemento #root", async () => {
    await import("./main");

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(render).toHaveBeenCalledTimes(1);
  });

  it("envuelve la app en StrictMode, Router y AuthProvider", async () => {
    await import("./main");

    type Nodo = React.ReactElement<{ children: React.ReactElement<{ children: React.ReactElement }> }>;
    const arbol = render.mock.calls[0][0] as Nodo;
    // StrictMode -> BrowserRouter -> AuthProvider -> App
    expect(String(arbol.type)).toContain("react.strict_mode");
    const router = arbol.props.children;
    expect(typeof router.type === "function" ? router.type.name : "").toBe("BrowserRouter");
    const auth = router.props.children;
    expect(typeof auth.type === "function" ? auth.type.name : "").toBe("AuthProvider");
  });
});
