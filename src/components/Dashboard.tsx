import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TripForm } from "./TripForm";
import { MapPin, Clock, Users, Car, Plus, BarChart3, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  trip_number?: string;
  origin: string;
  destination: string;
  mode: string;
  start_time?: string;
  end_time?: string;
  companions?: string;
  created_at?: string;
}

export const Dashboard = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
    fetchTrips();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') { // Ignore table doesn't exist error
        console.error('Fetch trips error:', error);
        toast({
          title: "Data Load Error",
          description: error.message ? `Could not load your trips: ${error.message}` : "Could not load your trips. Using offline data.",
          variant: "destructive"
        });
        return;
      }

      setTrips(data || []);
    } catch (error) {
      console.error('Unexpected error fetching trips:', error);
      toast({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripSaved = () => {
    setShowForm(false);
    fetchTrips(); // Refresh trips list
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      window.location.reload(); // Simple refresh to reset app state
    }
  };

  const getModeIcon = (mode: string) => {
    return <Car className="w-4 h-4" />;
  };

  const getModeVariant = (mode: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      car: "default",
      bus: "secondary",
      train: "outline",
      walking: "destructive",
    };
    return variants[mode] || "outline";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 animate-fade-in">
      <div className="container mx-auto p-4 space-y-8">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center py-12 mb-4">
          <div className="absolute inset-0 -z-10 blur-2xl opacity-40 pointer-events-none bg-gradient-to-r from-blue-300 via-purple-200 to-pink-200 rounded-3xl" style={{height: '100%', width: '100%'}}></div>
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mt-6 mb-2 drop-shadow-lg">Travel Data Collection</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-2">Contributing to better transportation planning</p>
          {user && (
            <p className="text-base text-muted-foreground mt-2">Welcome, <span className="font-semibold text-primary">{user.email}</span></p>
          )}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="absolute top-4 right-4 shadow-md hover:scale-105 transition-transform"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-lg animate-pulse">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{trips.length}</p>
                <p className="text-muted-foreground">Total Trips</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up delay-100">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 rounded-lg animate-pulse">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{new Set(trips.flatMap(t => [t.origin, t.destination])).size}</p>
                <p className="text-muted-foreground">Unique Locations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up delay-200">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-gradient-to-tr from-green-400 via-blue-400 to-purple-400 rounded-lg animate-pulse">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{trips.filter(t => t.companions).length}</p>
                <p className="text-muted-foreground">Group Trips</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Trip Button */}
        {!showForm && (
          <div className="text-center animate-fade-in-up delay-300">
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 hover:scale-105 transition-transform shadow-lg text-white text-lg px-8 py-3 rounded-full"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Trip
            </Button>
          </div>
        )}

        {/* Trip Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto animate-fade-in-up delay-400">
            <TripForm onTripSaved={handleTripSaved} />
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="hover:scale-105 transition-transform"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Recent Trips */}
        <Card className="shadow-xl mt-8 animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Recent Trips</span>
            </CardTitle>
            <CardDescription>
              Your recently recorded travel data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 animate-pulse">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No trips recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 space-y-3 shadow hover:shadow-lg transition-shadow duration-200 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getModeIcon(trip.mode)}
                        <Badge variant={getModeVariant(trip.mode)}>
                          {trip.mode.charAt(0).toUpperCase() + trip.mode.slice(1)}
                        </Badge>
                        {trip.trip_number && (
                          <Badge variant="outline">{trip.trip_number}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">From:</span>
                        <span>{trip.origin}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">To:</span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                    
                    {(trip.start_time || trip.end_time) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {trip.start_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Started:</span>
                            <span>{new Date(trip.start_time).toLocaleString()}</span>
                          </div>
                        )}
                        {trip.end_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Ended:</span>
                            <span>{new Date(trip.end_time).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {trip.companions && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Companions:</span>
                        <span>{trip.companions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};