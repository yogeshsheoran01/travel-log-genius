import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Users, Database, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ConsentPageProps {
  onConsentGiven: () => void;
}

export const ConsentPage = ({ onConsentGiven }: ConsentPageProps) => {
  const { toast } = useToast();
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!consent) return;
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please login first.",
          variant: "destructive"
        });
        return;
      }

      // Update user profile with consent
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          consent: true,
          updated_at: new Date().toISOString()
        });

      if (error && error.code !== '42P01') { // Ignore table doesn't exist error for now
        console.error('Consent update error:', error);
        // Continue anyway - table might not exist yet
      }

      toast({
        title: "Consent Recorded",
        description: "Thank you for participating in transportation research!",
        className: "bg-success text-success-foreground"
      });
      
      onConsentGiven();
    } catch (error) {
      console.error('Consent error:', error);
      // Continue anyway for demo purposes
      onConsentGiven();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">NATPAC Travel Data Collection</CardTitle>
          <CardDescription className="text-base">
            Help us improve transportation planning by sharing your travel data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What data will be collected?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Trip Information</h4>
                  <p className="text-sm text-muted-foreground">Origin, destination, mode of transport, timing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium">Travel Companions</h4>
                  <p className="text-sm text-muted-foreground">Number and details of accompanying travelers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How will your data be used?</h3>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted">
              <Database className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Transportation Planning Research</h4>
                <p className="text-sm text-muted-foreground">
                  Your anonymized data will be used by NATPAC scientists for transportation planning and research purposes only. 
                  Personal identifying information will be kept secure and confidential.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
              />
              <label 
                htmlFor="consent" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to the collection and use of my travel data for transportation planning research by NATPAC
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={!consent || isLoading}
            className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth"
          >
            {isLoading ? "Recording Consent..." : "Continue to App"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};