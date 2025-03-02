import { HandballIcon } from "@/components/handball-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { clearPlayerIdentity, getPlayerName } from "@/lib/storage";

export function Header() {
  const playerName = getPlayerName();

  const handleLogout = () => {
    clearPlayerIdentity();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex h-14 items-center">
        <div className="flex items-center mr-4">
          <HandballIcon className="h-6 w-6 mx-2" />
          <span className="font-bold">Handball ML</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {playerName && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {playerName}
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}