import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Phone, Calendar, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Définition du type Patient alignée avec le Backend DTO
interface Patient {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string; // Format YYYY-MM-DD
  numTel: string;
}

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  placeholder?: string;
}

const API_URL = 'http://localhost:8080/api/patients';

export function PatientSearch({ onSelectPatient, placeholder = "Rechercher par CIN ou nom..." }: PatientSearchProps) {
  const [user] = useLocalStorage('user', null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Logique de Recherche ---
  useEffect(() => {
    // On attend que l'utilisateur ait tapé au moins 2 caractères
    if (query.length < 2 || !user?.id) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Debounce : on attend 300ms après la dernière frappe avant d'appeler l'API
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        // Option 1 (Simple) : On récupère tous les patients du cabinet et on filtre côté client (JS)
        // C'est performant tant qu'il n'y a pas des milliers de patients.
        const res = await axios.get(API_URL, { 
          params: { secretaireId: user.id } 
        });
        
        const allPatients = res.data;
        
        // Filtrage insensible à la casse
        const filtered = allPatients.filter((p: Patient) => 
          p.nom.toLowerCase().includes(query.toLowerCase()) ||
          p.prenom.toLowerCase().includes(query.toLowerCase()) ||
          p.cin.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error("Erreur recherche patient", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, user]);

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setQuery(`${patient.prenom} ${patient.nom}`); // Affiche le nom sélectionné dans l'input
    setIsOpen(false);
  };

  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') {
                setIsOpen(false);
                onSelectPatient(null as any); // Reset si on efface tout
            }
          }}
          className="pl-10 pr-10"
        />
        
        {/* Bouton pour effacer ou Loader */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : query ? (
                <button 
                    onClick={() => { 
                        setQuery(''); 
                        setIsOpen(false); 
                        onSelectPatient(null as any);
                    }}
                    className="p-1 hover:bg-secondary rounded"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            ) : null}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {results.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient)}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{patient.prenom} {patient.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                      {patient.cin}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {calculateAge(patient.dateNaissance)} ans
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {patient.numTel}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {isOpen && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-4 z-50"
          >
            <p className="text-center text-muted-foreground">Aucun patient trouvé avec ce nom ou CIN.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}