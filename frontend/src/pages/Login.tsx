import { useState } from 'react';
import { motion} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 👤 UTILISATEURS FAKE
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  const form = e.currentTarget;
  const login = (form.elements.namedItem('username') as HTMLInputElement).value;
  const pwd = (form.elements.namedItem('password') as HTMLInputElement).value;

  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      login,
      pwd,
    });

    const user = response.data;

    // 💾 Sauvegarde locale
    localStorage.setItem('user', JSON.stringify(user));

    // 🔁 REDIRECTION SELON ROLE (backend)
    switch (user.role) {
      case 'SECRETAIRE':
        navigate('/dashboard/secretaire');
        break;
      case 'MEDECIN':
        navigate('/dashboard/medecin');
        break;
      case 'ADMIN':
        navigate('/dashboard/admin');
        break;
      default:
        setError('Rôle inconnu');
    }

  } catch (err: any) {
    setError(
      err.response?.data?.error || 'Identifiant ou mot de passe incorrect'
    );
    
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <img
              src="/public/7.png" // ou le chemin de votre photo dans /public ou importée
              alt="7M7Cabinet"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-2xl font-bold">
              7M7<span className="text-gradient">Cabinet</span>
            </span>
          </Link>

          <Card variant="glass">
            <CardHeader className="text-center">
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Entrez votre identifiant et mot de passe
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Identifiant</label>
                  <Input name="username" required placeholder="Votre identifiant" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe</label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>

              </form>
            </CardContent>
          </Card>

          

        </motion.div>
      </div>
      
    </div>
    
  );
}
