import { cn } from "@/lib/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  const isAuthPage = location.pathname === "/autenticacao";
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/autenticacao")
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/pessoas", label: "Pessoas" },
    { path: "/transacoes", label: "Transações" },
  ];

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <nav>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-8 font-semibold p-5">Controle de Gastos</div>
            <div className="flex gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "text-sm transition-colors hover:text-primary",
                      isActive
                        ? "text-sky-500 font-medium"
                        : "text-muted-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <UserCircle className="h-5 w-5" />
                  {session.user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 text-white border border-gray-600 rounded">
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <NavLink to="/autenticacao">Sign In</NavLink>
            </Button>
          )}
        </div>
      </nav>
      <main className="container w-screen">{children}</main>
    </div>
  );
};

export default Layout;
