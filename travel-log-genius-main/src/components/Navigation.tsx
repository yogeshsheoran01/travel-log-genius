import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, BarChart3, MapPin } from "lucide-react";

interface NavigationProps {
  currentView: 'user' | 'scientist';
  onViewChange: (view: 'user' | 'scientist') => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="flex items-center space-x-2 p-2 shadow-card bg-card/95 backdrop-blur-sm">
        <Button
          variant={currentView === 'user' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('user')}
          className={currentView === 'user' ? 'bg-gradient-primary text-primary-foreground' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          User View
        </Button>
        
        <Button
          variant={currentView === 'scientist' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('scientist')}
          className={currentView === 'scientist' ? 'bg-gradient-accent text-accent-foreground' : ''}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Research View
        </Button>
      </Card>
    </div>
  );
};