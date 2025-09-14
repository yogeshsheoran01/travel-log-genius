import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, MapPin, Filter, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: number;
  user_id: string;
  trip_number?: string;
  origin: string;
  destination: string;
  mode: string;
  start_time?: string;
  end_time?: string;
  companions?: string;
  created_at?: string;
}

export const ScientistDashboard = () => {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllTrips();
  }, []);

  useEffect(() => {
    let filtered = trips;
    
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (modeFilter !== "all") {
      filtered = filtered.filter(trip => trip.mode === modeFilter);
    }
    
    setFilteredTrips(filtered);
  }, [searchTerm, modeFilter, trips]);

  const fetchAllTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') { // Ignore table doesn't exist error
        console.error('Fetch all trips error:', error);
        toast({
          title: "Data Load Error",
          description: "Could not load trip data. Please ensure database is set up.",
          variant: "destructive"
        });
        return;
      }

      setTrips(data || []);
    } catch (error) {
      console.error('Unexpected error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getModeColor = (mode: string) => {
    const colors: { [key: string]: string } = {
      car: "bg-primary text-primary-foreground",
      bus: "bg-accent text-accent-foreground", 
      train: "bg-success text-success-foreground",
      walking: "bg-secondary text-secondary-foreground",
    };
    return colors[mode] || "bg-muted text-muted-foreground";
  };

  const getStats = () => {
    const totalTrips = filteredTrips.length;
    const uniqueUsers = new Set(filteredTrips.map(t => t.user_id)).size;
    const modeCounts = filteredTrips.reduce((acc, trip) => {
      acc[trip.mode] = (acc[trip.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topMode = Object.entries(modeCounts).sort(([,a], [,b]) => b - a)[0];

    return {
      totalTrips,
      uniqueUsers,
      topMode: topMode ? `${topMode[0]} (${topMode[1]} trips)` : "N/A"
    };
  };

  const stats = getStats();

  const exportData = () => {
    const csvContent = [
      ["Trip ID", "User ID", "Trip Number", "Origin", "Destination", "Mode", "Start Time", "End Time", "Companions"],
      ...filteredTrips.map(trip => [
        trip.id,
        trip.user_id,
        trip.trip_number || "",
        trip.origin,
        trip.destination,
        trip.mode,
        trip.start_time || "",
        trip.end_time || "",
        trip.companions || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "natpac_trip_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center py-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">NATPAC Research Dashboard</h1>
            <p className="text-muted-foreground">Transportation Data Analysis & Research</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="ml-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-gradient-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
                <p className="text-muted-foreground">Total Trips Collected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-gradient-accent rounded-lg">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                <p className="text-muted-foreground">Contributing Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="p-3 bg-success rounded-lg">
                <MapPin className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.topMode}</p>
                <p className="text-muted-foreground">Most Used Mode</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-primary" />
                <span>Data Filters & Export</span>
              </span>
              <Button 
                onClick={exportData}
                className="bg-gradient-accent hover:bg-accent-hover transition-smooth"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Locations</label>
                <Input
                  placeholder="Search by origin or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Mode</label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Data Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Collected Trip Data</CardTitle>
            <CardDescription>
              Showing {filteredTrips.length} of {trips.length} total trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading trip data...</p>
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {trips.length === 0 ? "No trip data available yet" : "No trips match your filters"}
                  </p>
                </div>
              ) : (
                filteredTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{trip.id}</Badge>
                        <Badge className={getModeColor(trip.mode)}>
                          {trip.mode.charAt(0).toUpperCase() + trip.mode.slice(1)}
                        </Badge>
                        {trip.trip_number && (
                          <Badge variant="outline">{trip.trip_number}</Badge>
                        )}
                        <Badge variant="outline">User: {trip.user_id.slice(0, 8)}...</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">From:</span>
                        <span>{trip.origin}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span className="font-medium">To:</span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                    
                    {(trip.start_time || trip.end_time) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {trip.start_time && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Started:</span>
                            <span>{new Date(trip.start_time).toLocaleString()}</span>
                          </div>
                        )}
                        {trip.end_time && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Ended:</span>
                            <span>{new Date(trip.end_time).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {trip.companions && (
                      <div className="flex items-start space-x-2 text-sm">
                        <Users className="w-4 h-4 text-accent mt-0.5" />
                        <span className="font-medium">Companions:</span>
                        <span>{trip.companions}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};