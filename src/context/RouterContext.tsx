import React, { createContext, useContext, useEffect, useState } from "react";

export type RoutePath = "/" | "/login" | "/signup" | "/dashboard" | "/admin" | "/new-page" | string;

interface RouterContextType {
  pathname: string;
  search: string;
  fullPath: string;
  push: (path: RoutePath) => void;
  replace: (path: RoutePath) => void;
  back: () => void;
}

function extractPathAndSearch(fullUrl: string): { pathname: string; search: string } {
  if (!fullUrl) return { pathname: "/", search: "" };
  const [pathPart, queryPart] = fullUrl.split("?");
  const purePath = (pathPart || "/").split("#")[0] || "/";
  const pureSearch = queryPart ? `?${queryPart.split("#")[0]}` : "";
  return { pathname: purePath, search: pureSearch };
}

const RouterContext = createContext<RouterContextType>({
  pathname: "/",
  search: "",
  fullPath: "/",
  push: () => {},
  replace: () => {},
  back: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<{ pathname: string; search: string; fullPath: string }>(() => {
    if (typeof window !== "undefined") {
      const full = window.location.pathname + window.location.search;
      const { pathname, search } = extractPathAndSearch(full);
      return { pathname, search, fullPath: full };
    }
    return { pathname: "/", search: "", fullPath: "/" };
  });

  useEffect(() => {
    const handlePopState = () => {
      const full = window.location.pathname + window.location.search;
      const { pathname, search } = extractPathAndSearch(full);
      setCurrentRoute({ pathname, search, fullPath: full });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const push = (path: RoutePath) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      const { pathname, search } = extractPathAndSearch(path);
      setCurrentRoute({ pathname, search, fullPath: path });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const replace = (path: RoutePath) => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", path);
      const { pathname, search } = extractPathAndSearch(path);
      setCurrentRoute({ pathname, search, fullPath: path });
    }
  };

  const back = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <RouterContext.Provider
      value={{
        pathname: currentRoute.pathname,
        search: currentRoute.search,
        fullPath: currentRoute.fullPath,
        push,
        replace,
        back,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({ href, className, children, onClick, ...props }) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !props.target) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

