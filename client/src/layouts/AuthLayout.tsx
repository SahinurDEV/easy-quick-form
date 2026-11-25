import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/header/ThemeToggle';

export default function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="fixed left-0 right-0 top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6">
          <Link to="/">
            <h1 className="font-cursive text-3xl font-bold text-primary">
              Easy Quick Form
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Button
              className="border-primary text-primary hover:text-primary"
              variant="outline"
              size="lg"
              asChild
            >
              <Link to="/demo">Demo</Link>
            </Button>
            {pathname !== '/login' && (
              <Button size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main
        className={`mx-auto mt-16 w-full max-w-[1440px] flex-grow px-6 py-5 ${
          pathname === '/demo' ? '' : 'flex'
        }`}
      >
        {pathname === '/demo' ? (
          <Outlet />
        ) : (
          <section className="mx-auto w-[424px] self-center">
            <Outlet />
          </section>
        )}
      </main>
    </div>
  );
}
